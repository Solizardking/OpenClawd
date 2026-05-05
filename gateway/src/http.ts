// 🦞 OpenClawd Gateway HTTP server.
//
// Routes the Browser Bridge extension calls (Birdeye + Helius proxies):
//   GET  /health
//   GET  /api/token/overview?address=<mint>
//   GET  /api/wallet/portfolio?address=<wallet>
//   POST /api/wallet/submit            — forward signed tx to Helius RPC
//   POST /api/wallet/swap/build        — placeholder (returns 501 for now)
//
// Routes that bridge to the OpenClawd agent runtime in /src:
//   GET  /api/agent/runtime            — runtime description (skills, hasOpenRouterKey)
//   GET  /api/agent/skills             — full skill registry
//   POST /api/agent/text               — generateText through OpenRouter
//   POST /api/agent/clone              — clone a built-in agent (trader/scanner/...)
//   GET  /api/helius/asset?id=<id>     — DAS getAsset via the in-tree client
//   GET  /api/robotics/hardware        — public hardware manifest
//   POST /api/robot/connect            — register a robot gateway target
//   POST /api/robot/task               — create a gated robot task + payment intent
//
// Honcho integration:
//   POST /api/honcho/webhook           — verified Honcho webhook receiver
//   POST /api/honcho/remember          — { peer, role, channel, content } → bridge
//   POST /api/honcho/context           — { peer, channel, tokens? } → openai-shape
//   POST /api/honcho/ask               — { peer, query } → natural-language reply
//   GET  /api/honcho/config            — redacted resolved config (diagnostic)
//
// The /src import is lazy + cached. If the import fails (broken types in
// some unrelated /src module, /src not built), the agent routes return 503
// while the proxy routes keep working. Set OPENCLAWD_SRC_DISABLED=1 to skip
// the bridge entirely.
//
// Reads BIRDEYE_API_KEY, HELIUS_API_KEY (and optional HELIUS_RPC_URL) from
// the environment. Permissive CORS so the Chrome extension can reach it.
//
// Run with: npm --prefix gateway run http

import http from 'node:http';
import { URL } from 'node:url';
import 'dotenv/config';
import { discover } from '@openclawdsolana/service-registry';
import { CodexDispatcher, type CodexTaskRequest } from './codex-dispatcher.js';

// Source the boot port from @openclawdsolana/service-registry so other
// OpenClawd surfaces (chrome-extension, clawdhub, scripts/doctor.mjs) can
// reach the gateway at the URL they expect. The registry honors GATEWAY_HTTP_PORT
// (port-only) and OPENCLAWD_GATEWAY_URL (full URL); we read its resolved port
// here so a single env override moves both this server and every consumer.
const REGISTRY_GATEWAY = discover('gateway');
const PORT = REGISTRY_GATEWAY.port;
const BIRDEYE_KEY = process.env.BIRDEYE_API_KEY ?? '';
const BIRDEYE_WSS_URL = process.env.BIRDEYE_WSS_URL ?? '';
const HELIUS_KEY = process.env.HELIUS_API_KEY ?? '';
const HELIUS_RPC =
  process.env.HELIUS_RPC_URL ||
  (HELIUS_KEY ? `https://mainnet.helius-rpc.com/?api-key=${HELIUS_KEY}` : '');
const SRC_DISABLED = process.env.OPENCLAWD_SRC_DISABLED === '1';
const PAY_SH_GATEWAY_URL = process.env.PAY_SH_GATEWAY_URL ?? 'https://pay.sh';
const MPP_PROXY_URL = process.env.MPP_PROXY_URL ?? process.env.PAY_SH_MPP_PROXY_URL ?? `${PAY_SH_GATEWAY_URL}/mpp`;
const ROBOT_LIVE_ENABLED = process.env.OPENCLAWD_ROBOT_LIVE === '1';
const codex = new CodexDispatcher({
  openaiApiKey: process.env.OPENAI_API_KEY,
  model: process.env.OPENAI_CODEX_MODEL,
  repoPath: process.env.OPENCLAWD_REPO_PATH,
});

// Lazy bridge to the root /src runtime. Each subsystem loads independently
// so a broken module in /src doesn't take down the whole bridge — e.g. if
// agents/runtime.ts has dangling imports we still serve /api/helius/asset.
type SrcBridge = {
  runtime?: {
    getRuntime: () => unknown;
    describeRuntime: (rt: unknown) => unknown;
  };
  clone?: { cloneAgent: (type: string, opts?: unknown) => unknown };
  helius?: { getAsset: (id: string) => Promise<unknown> };
};
const SRC_ERRORS: Record<string, string | null> = {
  runtime: null,
  clone: null,
  helius: null,
};
const srcBridge: SrcBridge = {};
let srcLoaded = false;

const runtimeImport = (specifier: string): Promise<unknown> => {
  const importer = new Function('specifier', 'return import(specifier)') as (
    specifier: string,
  ) => Promise<unknown>;
  return importer(specifier);
};

async function loadSrcModule<T>(
  key: keyof SrcBridge,
  importer: () => Promise<unknown>,
  shape: (mod: unknown) => T,
): Promise<T | undefined> {
  if (SRC_DISABLED) {
    SRC_ERRORS[key] = 'disabled';
    return undefined;
  }
  if (srcBridge[key]) return srcBridge[key] as T;
  if (SRC_ERRORS[key]) return undefined;
  try {
    const mod = await importer();
    const value = shape(mod);
    (srcBridge as Record<string, unknown>)[key] = value;
    SRC_ERRORS[key] = null;
    return value;
  } catch (e) {
    SRC_ERRORS[key] = e instanceof Error ? e.message : String(e);
    return undefined;
  }
}

async function ensureRuntime() {
  return loadSrcModule('runtime', () => runtimeImport('../../src/agents/runtime.js'), (m) => {
    const mod = m as {
      getRuntime: () => unknown;
      describeRuntime: (r: unknown) => unknown;
    };
    return { getRuntime: mod.getRuntime, describeRuntime: mod.describeRuntime };
  });
}
async function ensureClone() {
  return loadSrcModule('clone', () => runtimeImport('../../src/agents/clone.js'), (m) => {
    const mod = m as { cloneAgent: (t: string, o?: unknown) => unknown };
    return { cloneAgent: mod.cloneAgent };
  });
}
async function ensureHelius() {
  return loadSrcModule('helius', () => runtimeImport('../../src/helius/index.js'), (m) => {
    const mod = m as {
      createHeliusClient?: (cfg: { apiKey: string; rpcUrl?: string }) => {
        getAsset: (id: string) => Promise<unknown>;
      };
    };
    if (!mod.createHeliusClient) throw new Error('createHeliusClient not exported');
    if (!HELIUS_KEY) throw new Error('HELIUS_API_KEY not set');
    const client = mod.createHeliusClient({ apiKey: HELIUS_KEY, rpcUrl: HELIUS_RPC });
    return { getAsset: (id: string) => client.getAsset(id) };
  });
}

// Eagerly attempt the bridge load on boot so /health reports accurately.
async function probeSrc() {
  if (SRC_DISABLED) {
    srcLoaded = true;
    return;
  }
  await Promise.allSettled([ensureRuntime(), ensureClone(), ensureHelius()]);
  srcLoaded = true;
}

const BASE58 = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

function corsHeaders() {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type, x-api-key, x-chain, x-robot-token',
  };
}

function json(res: http.ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'content-type': 'application/json', ...corsHeaders() });
  res.end(JSON.stringify(body));
}

async function readBody(req: http.IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  if (chunks.length === 0) return undefined;
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf-8'));
  } catch {
    return undefined;
  }
}

async function readRawBody(req: http.IncomingMessage): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  return Buffer.concat(chunks);
}

// ── Honcho bridge (lazy) ────────────────────────────────────────────────
type HonchoBridgeMod = {
  loadHonchoConfig: () => {
    enabled: boolean;
    url: string;
    apiKey: string;
    workspaceId: string;
    agentPeerId: string;
    reasoningLevel: string;
    contextTokens: number;
    contextSummary: boolean;
    syncMessages: boolean;
    webhookSecret: string;
    webhooks: Array<{ index: number; url: string; secret: string; workspace?: string }>;
  };
  createHonchoEngine: () => {
    remember: (input: {
      ownerId: string;
      agentId?: string;
      role: 'owner' | 'agent';
      channel: { thread: string; platform: string };
      content: string;
    }) => Promise<void>;
    contextFor: (input: {
      ownerId: string;
      agentId?: string;
      channel: { thread: string; platform: string };
      tokens?: number;
      summary?: boolean;
    }) => Promise<unknown>;
    describe: (peer: string, query: string) => Promise<string>;
  };
  verifyHonchoWebhook: (
    req: { headers: Record<string, string | string[] | undefined>; rawBody: Buffer | string },
    secret: string,
  ) =>
    | { ok: true; event: { type: string; receivedAt: string } }
    | { ok: false; reason: string; status: 400 | 401 | 415 };
  secretForRequest: (cfg: ReturnType<HonchoBridgeMod['loadHonchoConfig']>, hintedWorkspace?: string) => string;
};
let honchoMod: HonchoBridgeMod | null | undefined; // undefined = not tried, null = failed
async function loadHoncho(): Promise<HonchoBridgeMod | null> {
  if (honchoMod !== undefined) return honchoMod;
  try {
    const [cfg, engine, hook] = await Promise.all([
      runtimeImport('../../packages/honcho-bridge/src/config.js'),
      runtimeImport('../../packages/honcho-bridge/src/engine.js'),
      runtimeImport('../../packages/honcho-bridge/src/webhook.js'),
    ]);
    const cfgMod = cfg as Pick<HonchoBridgeMod, 'loadHonchoConfig'>;
    const engineMod = engine as Pick<HonchoBridgeMod, 'createHonchoEngine'>;
    const hookMod = hook as Pick<HonchoBridgeMod, 'verifyHonchoWebhook' | 'secretForRequest'>;
    honchoMod = {
      loadHonchoConfig: cfgMod.loadHonchoConfig,
      createHonchoEngine: engineMod.createHonchoEngine,
      verifyHonchoWebhook: hookMod.verifyHonchoWebhook,
      secretForRequest: hookMod.secretForRequest,
    };
    return honchoMod;
  } catch (e) {
    console.error('honcho bridge load failed:', e instanceof Error ? e.message : e);
    honchoMod = null;
    return null;
  }
}

// ── Birdeye proxy ────────────────────────────────────────────────────
const BIRDEYE_BASE_URL = 'https://public-api.birdeye.so';
const SOL_MINT = 'So11111111111111111111111111111111111111112';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const MAX_ADDRESS_LIST = 100;
const SAFE_KEYWORD = /^[\w .:$-]{0,64}$/;
const OHLCV_TYPES = new Set([
  '1s',
  '15s',
  '30s',
  '1m',
  '3m',
  '5m',
  '15m',
  '30m',
  '1H',
  '2H',
  '4H',
  '6H',
  '8H',
  '12H',
  '1D',
  '3D',
  '1W',
  '1M',
]);
const PRICE_TIMEFRAMES = new Set(['1m', '5m', '30m', '1h', '2h', '4h', '8h', '24h', '2d', '3d', '7d']);
const SMART_INTERVALS = new Set(['1d', '7d', '30d']);
const SMART_STYLES = new Set(['all', 'risk_averse', 'risk_balancers', 'trenchers']);

function requireBirdeye(): void {
  if (!BIRDEYE_KEY) throw new Error('BIRDEYE_API_KEY not set');
}

function birdeyeHeaders(extra?: Record<string, string>): Record<string, string> {
  requireBirdeye();
  return {
    accept: 'application/json',
    'x-chain': 'solana',
    'X-API-KEY': BIRDEYE_KEY,
    ...extra,
  };
}

async function birdeyeGet(path: string, params: Record<string, string | number | boolean | undefined>): Promise<unknown> {
  const url = new URL(path, BIRDEYE_BASE_URL);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') url.searchParams.set(key, String(value));
  }
  const r = await fetch(url, { headers: birdeyeHeaders() });
  if (!r.ok) throw new Error(`Birdeye ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const j = (await r.json()) as { success?: boolean; data?: unknown; message?: string };
  if (j.success === false) throw new Error(j.message ?? 'Birdeye request failed');
  return j.data ?? j;
}

function parseAddressList(value: string, max = MAX_ADDRESS_LIST): string[] {
  const addresses = value
    .split(',')
    .map((a) => a.trim())
    .filter(Boolean);
  if (addresses.length === 0) throw new Error('missing address list');
  if (addresses.length > max) throw new Error(`too many addresses; max ${max}`);
  const invalid = addresses.find((a) => !BASE58.test(a));
  if (invalid) throw new Error(`invalid base58 address: ${invalid}`);
  return addresses;
}

function unixParam(url: URL, key: string, fallback: number): number {
  const raw = url.searchParams.get(key);
  if (!raw) return fallback;
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value) || value < 0 || value > 10_000_000_000) {
    throw new Error(`invalid ${key}`);
  }
  return value;
}

async function birdeyeOverview(address: string): Promise<unknown> {
  const url = new URL('/defi/token_overview', BIRDEYE_BASE_URL);
  url.searchParams.set('address', address);
  url.searchParams.set('ui_amount_mode', 'scaled');
  const r = await fetch(url, {
    headers: birdeyeHeaders(),
  });
  if (!r.ok) throw new Error(`Birdeye ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const j = (await r.json()) as { success?: boolean; data?: unknown; message?: string };
  if (j.success === false) throw new Error(j.message ?? 'Birdeye request failed');
  return j.data ?? j;
}

async function birdeyeWalletPortfolio(wallet: string): Promise<unknown> {
  const url = new URL('/v1/wallet/token_list', BIRDEYE_BASE_URL);
  url.searchParams.set('wallet', wallet);
  const r = await fetch(url, {
    headers: birdeyeHeaders(),
  });
  if (!r.ok) throw new Error(`Birdeye ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const j = (await r.json()) as { success?: boolean; data?: { items?: unknown[]; totalUsd?: number } };
  if (j.success === false) throw new Error('Birdeye request failed');
  return j.data ?? j;
}

async function birdeyePrice(address: string): Promise<unknown> {
  return birdeyeGet('/defi/price', {
    address,
    include_liquidity: true,
    ui_amount_mode: 'scaled',
  });
}

async function birdeyeMultiPrice(addresses: string[]): Promise<unknown> {
  return birdeyeGet('/defi/multi_price', {
    list_address: addresses.join(','),
    include_liquidity: true,
    ui_amount_mode: 'scaled',
  });
}

async function birdeyeOhlcv(url: URL): Promise<unknown> {
  const address = url.searchParams.get('address')?.trim() || SOL_MINT;
  if (!BASE58.test(address)) throw new Error('invalid base58 address');
  const type = url.searchParams.get('type')?.trim() || '15m';
  if (!OHLCV_TYPES.has(type)) throw new Error('invalid ohlcv type');
  const now = Math.floor(Date.now() / 1000);
  const timeTo = unixParam(url, 'time_to', now);
  const timeFrom = unixParam(url, 'time_from', timeTo - 24 * 60 * 60);
  return birdeyeGet('/defi/v3/ohlcv', {
    address,
    type,
    currency: 'usd',
    time_from: timeFrom,
    time_to: timeTo,
    ui_amount_mode: 'scaled',
    count_limit: 500,
  });
}

async function birdeyeBaseQuoteOhlcv(url: URL): Promise<unknown> {
  const base = url.searchParams.get('base_address')?.trim() || SOL_MINT;
  const quote = url.searchParams.get('quote_address')?.trim() || USDC_MINT;
  if (!BASE58.test(base) || !BASE58.test(quote)) throw new Error('invalid base58 address');
  const type = url.searchParams.get('type')?.trim() || '15m';
  if (!OHLCV_TYPES.has(type)) throw new Error('invalid ohlcv type');
  const now = Math.floor(Date.now() / 1000);
  const timeTo = unixParam(url, 'time_to', now);
  const timeFrom = unixParam(url, 'time_from', timeTo - 24 * 60 * 60);
  return birdeyeGet('/defi/ohlcv/base_quote', {
    base_address: base,
    quote_address: quote,
    type,
    time_from: timeFrom,
    time_to: timeTo,
    ui_amount_mode: 'scaled',
  });
}

async function birdeyePriceStats(address: string, listTimeframe: string): Promise<unknown> {
  const frames = listTimeframe
    .split(',')
    .map((f) => f.trim())
    .filter(Boolean);
  if (frames.length === 0 || frames.some((f) => !PRICE_TIMEFRAMES.has(f))) {
    throw new Error('invalid price stat timeframe');
  }
  return birdeyeGet('/defi/v3/price/stats/single', {
    address,
    list_timeframe: frames.join(','),
    ui_amount_mode: 'scaled',
  });
}

async function birdeyeTradeData(address: string): Promise<unknown> {
  return birdeyeGet('/defi/v3/token/trade-data/single', {
    address,
    frames: '1m,5m,30m,1h,4h,24h',
    ui_amount_mode: 'scaled',
  });
}

async function birdeyeSearch(url: URL): Promise<unknown> {
  const keyword = (url.searchParams.get('keyword') ?? '').trim();
  if (!SAFE_KEYWORD.test(keyword)) throw new Error('invalid keyword');
  const target = url.searchParams.get('target') ?? 'all';
  const searchBy = url.searchParams.get('search_by') ?? (BASE58.test(keyword) ? 'address' : 'combination');
  const searchMode = url.searchParams.get('search_mode') ?? 'fuzzy';
  const markets = url.searchParams.get('markets') ?? 'Raydium,Raydium CP,Raydium Clamm,Meteora,Meteora DLMM,Pump.fun,Orca';
  const limit = Math.min(Math.max(Number.parseInt(url.searchParams.get('limit') ?? '12', 10) || 12, 1), 20);
  return birdeyeGet('/defi/v3/search', {
    chain: 'solana',
    keyword,
    target,
    search_mode: searchMode,
    search_by: searchBy,
    sort_by: url.searchParams.get('sort_by') ?? 'volume_24h_usd',
    sort_type: url.searchParams.get('sort_type') ?? 'desc',
    verify_token: url.searchParams.get('verify_token') ?? undefined,
    markets,
    offset: Math.max(Number.parseInt(url.searchParams.get('offset') ?? '0', 10) || 0, 0),
    limit,
    ui_amount_mode: 'scaled',
  });
}

async function birdeyeSmartMoney(url: URL): Promise<unknown> {
  const interval = url.searchParams.get('interval') ?? '1d';
  const traderStyle = url.searchParams.get('trader_style') ?? 'all';
  if (!SMART_INTERVALS.has(interval) || !SMART_STYLES.has(traderStyle)) {
    throw new Error('invalid smart money filter');
  }
  const limit = Math.min(Math.max(Number.parseInt(url.searchParams.get('limit') ?? '12', 10) || 12, 1), 20);
  return birdeyeGet('/smart-money/v1/token/list', {
    interval,
    trader_style: traderStyle,
    sort_by: url.searchParams.get('sort_by') ?? 'smart_traders_no',
    sort_type: url.searchParams.get('sort_type') ?? 'desc',
    offset: Math.max(Number.parseInt(url.searchParams.get('offset') ?? '0', 10) || 0, 0),
    limit,
  });
}

// Helius DAS fallback for wallet portfolio when Birdeye's wallet endpoint
// is unavailable (free tier doesn't include /v1/wallet). Uses
// getAssetsByOwner with showFungible: true so we get tokens + price data
// in one shot.
async function heliusWalletPortfolio(wallet: string): Promise<unknown> {
  if (!HELIUS_RPC) throw new Error('HELIUS_API_KEY not set');
  const r = await fetch(HELIUS_RPC, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'gateway',
      method: 'getAssetsByOwner',
      params: {
        ownerAddress: wallet,
        page: 1,
        limit: 50,
        displayOptions: { showFungible: true, showNativeBalance: true },
      },
    }),
  });
  if (!r.ok) throw new Error(`Helius ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const j = (await r.json()) as {
    result?: {
      items?: Array<{
        id: string;
        token_info?: {
          symbol?: string;
          balance?: number;
          decimals?: number;
          price_info?: { price_per_token?: number; total_price?: number };
        };
        content?: { metadata?: { name?: string } };
      }>;
      nativeBalance?: { lamports?: number; total_price?: number };
    };
    error?: { message?: string };
  };
  if (j.error) throw new Error(j.error.message ?? 'rpc error');
  const items = (j.result?.items ?? []).map((a) => {
    const tok = a.token_info ?? {};
    const decimals = tok.decimals ?? 0;
    const balance = tok.balance ?? 0;
    const uiAmount = decimals ? balance / Math.pow(10, decimals) : balance;
    const priceUsd = tok.price_info?.price_per_token ?? null;
    const valueUsd = tok.price_info?.total_price ?? (priceUsd != null ? priceUsd * uiAmount : null);
    return {
      address: a.id,
      symbol: tok.symbol ?? a.content?.metadata?.name ?? '?',
      decimals,
      balance,
      uiAmount,
      priceUsd,
      valueUsd,
    };
  });
  const totalUsd = items.reduce((s, i) => s + (i.valueUsd ?? 0), 0);
  return {
    wallet,
    totalUsd,
    items,
    nativeBalance: j.result?.nativeBalance ?? null,
    source: 'helius-das',
  };
}

// ── Helius RPC: forward a signed transaction ────────────────────────
async function heliusSendTransaction(signedBase58: string): Promise<unknown> {
  if (!HELIUS_RPC) throw new Error('HELIUS_API_KEY / HELIUS_RPC_URL not set');
  const r = await fetch(HELIUS_RPC, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'gateway',
      method: 'sendTransaction',
      params: [signedBase58, { encoding: 'base58', skipPreflight: false }],
    }),
  });
  if (!r.ok) throw new Error(`Helius ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const j = (await r.json()) as { result?: string; error?: { message?: string } };
  if (j.error) throw new Error(j.error.message ?? 'rpc error');
  return { signature: j.result };
}

// ── Robotics gateway: hardware manifest + deny-first task envelopes ──
type RobotCapability =
  | 'telemetry'
  | 'camera'
  | 'imu'
  | 'audio'
  | 'can-bus'
  | 'motion-control'
  | 'x402'
  | 'mpp'
  | 'pay-sh';

type RobotConnection = {
  robot_id?: string;
  robot_url?: string;
  wallet?: string;
  model?: string;
  capabilities?: RobotCapability[];
};

type RobotTaskRequest = RobotConnection & {
  objective?: string;
  task?: string;
  amount_usd?: string | number;
  service?: string;
  pay_gateway?: string;
  mpp_proxy?: string;
  execute?: boolean;
  payment_rails?: Array<'x402' | 'mpp' | 'pay-sh'>;
};

const ROBOT_ID = /^[A-Za-z0-9_.:-]{3,80}$/;
const SAFE_ROBOT_TEXT = /^[\w .,:/$#@()[\]+=-]{1,220}$/;

function assertRobotId(robotId: string | undefined): string {
  const value = robotId?.trim() ?? '';
  if (!ROBOT_ID.test(value)) throw new Error('robot_id must be 3-80 safe characters');
  return value;
}

function assertSafeRobotText(value: string | undefined, field: string): string {
  const text = value?.trim() ?? '';
  if (!SAFE_ROBOT_TEXT.test(text)) throw new Error(`${field} is missing or contains unsafe characters`);
  return text;
}

function safeRobotUrl(value: string | undefined): string | null {
  if (!value) return null;
  const url = new URL(value);
  if (!['http:', 'https:', 'ws:', 'wss:'].includes(url.protocol)) {
    throw new Error('robot_url must use http, https, ws, or wss');
  }
  return url.toString();
}

function normalizeAmountUsd(value: string | number | undefined): string {
  if (value === undefined || value === '') return '0.005';
  const parsed = typeof value === 'number' ? value : Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 10) {
    throw new Error('amount_usd must be between 0 and 10');
  }
  return parsed.toFixed(3);
}

function robotHardwareManifest() {
  return {
    name: 'OPENCLAWDASV1 Solana robot',
    profile: 'OCASV1',
    base: 'Asimov v1 humanoid robot',
    source: 'Robotics/',
    openclawd: {
      profile: 'Robotics/OCASV1/README.md',
      manifest: 'Robotics/OCASV1/manifest.json',
      hardwareManifest: 'Robotics/OCASV1/openclawd-asv1.hardware.json',
      gr00tDeployment: 'Robotics/OCASV1/gr00t-deployment.md',
      solanaIdentity: 'Robotics/OCASV1/solana-identity.json',
      solanaRobot: 'Robotics/OCASV1/solana-robot.json',
      robotId: 'OPENCLAWDASV1',
      token: '$CLAWD',
      mint: '8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump',
    },
    licenses: {
      hardware: 'Robotics/HARDWARE-LICENSE.txt',
      software: 'Robotics/SOFTWARE-LICENSE.txt',
      gr00t: 'Robotics/Isaac-GR00T-main/LICENSE',
    },
    assets: {
      image: 'Robotics/assets/asimov-v1.jpg',
      electricalProfile: 'Robotics/electrical/OPENCLAWDASV1.md',
      wiring: 'Robotics/electrical/wiring/wiring.yaml',
      wiringDiagram: 'Robotics/electrical/wiring/wiring.svg',
      wiringProfile: 'Robotics/electrical/wiring/OPENCLAWDASV1-WIRING.md',
      wiringMap: 'Robotics/electrical/wiring/openclawd-asv1-wiring.map.yaml',
      deviceTree: 'Robotics/electrical/motion_control/mcb-io.dts',
      motionControlProfile: 'Robotics/electrical/motion_control/OPENCLAWDASV1-MCB.md',
      motionControlMap: 'Robotics/electrical/motion_control/openclawd-asv1-mcb.map.yaml',
      cad: 'Robotics/mechanical/ASV1/ASIMOV_V1.STEP',
      mechanicalProfile: 'Robotics/mechanical/OCASV1/README.md',
      mechanicalManifest: 'Robotics/mechanical/OCASV1/manifest.json',
      mujoco: 'Robotics/sim-model/xmls/asimov.xml',
    },
    gr00t: {
      source: 'Robotics/Isaac-GR00T-main',
      integration: 'Robotics/Isaac-GR00T-main/OPENCLAWDASV1.md',
      openClawdExample: 'Robotics/Isaac-GR00T-main/examples/OpenClawdASV1',
      openClawdConfig: 'Robotics/Isaac-GR00T-main/examples/OpenClawdASV1/openclawd_asv1_config.py',
      openClawdModality: 'Robotics/Isaac-GR00T-main/examples/OpenClawdASV1/modality.json',
      openClawdGuide: 'Robotics/Isaac-GR00T-main/getting_started/openclawd_asv1.md',
      embodimentTag: 'NEW_EMBODIMENT',
      actionHorizon: 32,
      policyApi: 'Robotics/Isaac-GR00T-main/getting_started/policy.md',
      realWorldDeployment: 'Robotics/Isaac-GR00T-main/getting_started/real_world_deployment.md',
      finetuneNewEmbodiment: 'Robotics/Isaac-GR00T-main/getting_started/finetune_new_embodiment.md',
      deploymentScripts: 'Robotics/Isaac-GR00T-main/scripts/deployment',
      role: 'vision-language-action proposal engine',
    },
    specs: {
      height_m: 1.2,
      weight_kg: 35,
      actuated_degrees_of_freedom: 25,
      passive_degrees_of_freedom: 2,
      compute: ['Raspberry Pi 5', 'Radxa CM5'],
      buses: ['5x CAN @ 1Mbps', '1x CAN @ 500kbps'],
      sensors: ['2MP monocular camera', '6 DOF IMU', 'quad microphone array', 'joint states'],
    },
    gateway: {
      connectRoute: '/api/robot/connect',
      taskRoute: '/api/robot/task',
      liveExecutionEnabled: ROBOT_LIVE_ENABLED,
      defaultMode: ROBOT_LIVE_ENABLED ? 'operator_approval_required' : 'dry_run',
      paymentRails: ['x402', 'mpp', 'pay-sh'],
    },
  };
}

function buildRobotPaymentIntent(input: {
  robotId: string;
  objective: string;
  amountUsd: string;
  service: string;
  payGateway?: string;
  mppProxy?: string;
  rails?: Array<'x402' | 'mpp' | 'pay-sh'>;
}) {
  const rails = input.rails?.length ? input.rails : ['x402', 'mpp', 'pay-sh'];
  const payGateway = safeRobotUrl(input.payGateway) ?? PAY_SH_GATEWAY_URL;
  const mppProxy = safeRobotUrl(input.mppProxy) ?? MPP_PROXY_URL;
  return {
    protocol: 'x402',
    accepted_rails: rails,
    chain: 'solana',
    asset: 'USDC',
    amount_usd: input.amountUsd,
    service: input.service,
    pay_gateway: payGateway,
    mpp_proxy: mppProxy,
    credential_model: 'payment-proof-as-credential',
    settlement: ROBOT_LIVE_ENABLED ? 'operator_approval_required' : 'dry_run',
    memo: `openclawd:${input.robotId}:${input.objective.slice(0, 64)}`,
  };
}

function buildRobotTaskEnvelope(body: RobotTaskRequest) {
  const robotId = assertRobotId(body.robot_id);
  const objective = assertSafeRobotText(body.objective ?? body.task, 'objective');
  const robotUrl = safeRobotUrl(body.robot_url);
  const amountUsd = normalizeAmountUsd(body.amount_usd);
  const service = assertSafeRobotText(body.service ?? 'robotics-task-plugin', 'service');
  const now = new Date().toISOString();
  const executeRequested = body.execute === true;
  const liveAllowed = ROBOT_LIVE_ENABLED && executeRequested;

  return {
    ok: true,
    robot: {
      robot_id: robotId,
      robot_url: robotUrl,
      wallet: body.wallet && BASE58.test(body.wallet) ? body.wallet : null,
      model: body.model ?? 'ocasv1',
      capabilities: body.capabilities ?? ['telemetry', 'camera', 'imu', 'can-bus', 'motion-control', 'x402', 'mpp', 'pay-sh'],
    },
    command_envelope: {
      robot_id: robotId,
      agent_id: 'openclawd-robotics-commander',
      timestamp: now,
      objective,
      command_plan: {
        action: 'paid_robot_task_intent',
        task: objective,
        requires_human: true,
        requires_payment: true,
        max_speed_mps: 0,
      },
      policy: {
        decision: liveAllowed ? 'allow_after_operator_approval' : 'dry_run_only',
        allowed: ['connect', 'telemetry', 'quote_task', 'request_payment', 'operator_review'],
        blocked: liveAllowed ? [] : ['physical_motion', 'funds_transfer', 'private_key_use'],
        reason: liveAllowed
          ? 'OPENCLAWD_ROBOT_LIVE=1 and execute=true, still requiring downstream operator confirmation'
          : 'robotics gateway defaults to public-safe dry-run mode',
      },
    },
    payment_intent: buildRobotPaymentIntent({
      robotId,
      objective,
      amountUsd,
      service,
      payGateway: body.pay_gateway,
      mppProxy: body.mpp_proxy,
      rails: body.payment_rails,
    }),
    proxy: {
      robot_target: robotUrl,
      gateway_route: '/api/robot/task',
      mpp_proxy: safeRobotUrl(body.mpp_proxy) ?? MPP_PROXY_URL,
      pay_gateway: safeRobotUrl(body.pay_gateway) ?? PAY_SH_GATEWAY_URL,
    },
    execution: {
      requested: executeRequested,
      live_enabled: ROBOT_LIVE_ENABLED,
      mode: liveAllowed ? 'operator_approval_required' : 'dry_run',
    },
  };
}

// ── Router ──────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders());
    res.end();
    return;
  }

  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
  const route = `${req.method} ${url.pathname}`;

  try {
    if (route === 'GET /healthz') {
      // Lightweight probe used by @openclawdsolana/service-registry → scripts/doctor.mjs.
      json(res, 200, { ok: true, service: '@openclawdsolana/gateway' });
      return;
    }

    if (route === 'GET /health') {
      json(res, 200, {
        ok: true,
        service: '@openclawdsolana/gateway',
        version: '1.0.0',
        birdeye: Boolean(BIRDEYE_KEY),
        birdeyeWss: Boolean(BIRDEYE_WSS_URL),
        helius: Boolean(HELIUS_KEY),
        robotics: {
          hardware: 'Robotics/',
          payShGateway: PAY_SH_GATEWAY_URL,
          mppProxy: MPP_PROXY_URL,
          liveExecutionEnabled: ROBOT_LIVE_ENABLED,
        },
        codex: {
          configured: codex.isConfigured(),
          model: process.env.OPENAI_CODEX_MODEL || 'gpt-5',
          tasks: codex.listTasks(100).length,
        },
        srcBridge: SRC_DISABLED ? 'disabled' : 'live',
        srcModules: {
          runtime: srcBridge.runtime ? 'ok' : SRC_ERRORS.runtime ?? 'lazy',
          clone:   srcBridge.clone   ? 'ok' : SRC_ERRORS.clone   ?? 'lazy',
          helius:  srcBridge.helius  ? 'ok' : SRC_ERRORS.helius  ?? 'lazy',
        },
        time: Date.now(),
      });
      return;
    }

    // ── Codex task dispatcher ────────────────────────────────────────
    if (route === 'GET /api/codex/tasks') {
      const limit = Number.parseInt(url.searchParams.get('limit') ?? '20', 10);
      json(res, 200, { tasks: codex.listTasks(Number.isFinite(limit) ? limit : 20) });
      return;
    }

    if (route === 'POST /api/codex/tasks') {
      const body = (await readBody(req)) as
        | (CodexTaskRequest & { runAsync?: boolean })
        | undefined;
      if (!body) return json(res, 400, { error: 'missing JSON body' });
      const prompt = body.prompt?.trim();
      if (!prompt) return json(res, 400, { error: 'missing "prompt"' });
      const taskBody = body;

      const reqBody: CodexTaskRequest = {
        prompt,
        source: taskBody.source ?? 'http',
        chatId: taskBody.chatId,
        userId: taskBody.userId,
        username: taskBody.username,
        repoPath: taskBody.repoPath,
        mode: taskBody.mode,
      };

      if (taskBody.runAsync) {
        const task = codex.createTask(reqBody);
        void codex.runTask(task.id);
        json(res, 202, { task });
      } else {
        const task = await codex.dispatch(reqBody);
        json(res, task.status === 'failed' ? 502 : 200, { task });
      }
      return;
    }

    const codexTaskMatch = url.pathname.match(/^\/api\/codex\/tasks\/([^/]+)$/);
    if (req.method === 'GET' && codexTaskMatch) {
      const task = codex.getTask(decodeURIComponent(codexTaskMatch[1]));
      json(res, task ? 200 : 404, task ? { task } : { error: 'task not found' });
      return;
    }

    // ── /src bridge — agent runtime ──────────────────────────────────
    if (route === 'GET /api/agent/runtime') {
      const rt = await ensureRuntime();
      if (!rt) return json(res, 503, { error: `runtime unavailable: ${SRC_ERRORS.runtime}` });
      json(res, 200, rt.describeRuntime(rt.getRuntime()));
      return;
    }

    if (route === 'GET /api/agent/skills') {
      const rt = await ensureRuntime();
      if (!rt) return json(res, 503, { error: `runtime unavailable: ${SRC_ERRORS.runtime}` });
      const r = rt.getRuntime() as { skills: { list: () => unknown } };
      json(res, 200, { skills: r.skills.list() });
      return;
    }

    if (route === 'POST /api/agent/text') {
      const rt = await ensureRuntime();
      if (!rt) return json(res, 503, { error: `runtime unavailable: ${SRC_ERRORS.runtime}` });
      const body = (await readBody(req)) as
        | { prompt?: string; model?: string; instructions?: string }
        | undefined;
      if (!body?.prompt) return json(res, 400, { error: 'missing "prompt"' });
      const r = rt.getRuntime() as {
        openrouter: { generateText: (p: string, o?: unknown) => Promise<string> };
      };
      const text = await r.openrouter.generateText(body.prompt, {
        model: body.model,
        instructions: body.instructions,
      });
      json(res, 200, { text });
      return;
    }

    if (route === 'POST /api/agent/clone') {
      const c = await ensureClone();
      if (!c) return json(res, 503, { error: `clone unavailable: ${SRC_ERRORS.clone}` });
      const body = (await readBody(req)) as { type?: string } | undefined;
      const type = body?.type;
      if (!type || !['trader', 'scanner', 'analyst', 'monitor'].includes(type)) {
        return json(res, 400, { error: 'type must be one of trader|scanner|analyst|monitor' });
      }
      c.cloneAgent(type);
      json(res, 200, { ok: true, cloned: type });
      return;
    }

    if (route === 'GET /api/helius/asset') {
      const h = await ensureHelius();
      if (!h) return json(res, 503, { error: `helius unavailable: ${SRC_ERRORS.helius}` });
      const id = url.searchParams.get('id')?.trim() ?? '';
      if (!BASE58.test(id)) return json(res, 400, { error: 'invalid base58 id' });
      const data = await h.getAsset(id);
      json(res, 200, data);
      return;
    }

    if (route === 'GET /api/token/overview') {
      const address = url.searchParams.get('address')?.trim() ?? '';
      if (!BASE58.test(address)) return json(res, 400, { error: 'invalid base58 address' });
      const data = await birdeyeOverview(address);
      json(res, 200, data);
      return;
    }

    if (route === 'GET /api/token/price') {
      const address = url.searchParams.get('address')?.trim() ?? '';
      if (!BASE58.test(address)) return json(res, 400, { error: 'invalid base58 address' });
      const data = await birdeyePrice(address);
      json(res, 200, data);
      return;
    }

    if (route === 'GET /api/token/multi-price') {
      const addresses = parseAddressList(url.searchParams.get('addresses') ?? url.searchParams.get('list_address') ?? '');
      const data = await birdeyeMultiPrice(addresses);
      json(res, 200, data);
      return;
    }

    if (route === 'GET /api/token/ohlcv') {
      const data = await birdeyeOhlcv(url);
      json(res, 200, data);
      return;
    }

    if (route === 'GET /api/token/base-quote-ohlcv') {
      const data = await birdeyeBaseQuoteOhlcv(url);
      json(res, 200, data);
      return;
    }

    if (route === 'GET /api/token/price-stats') {
      const address = url.searchParams.get('address')?.trim() ?? '';
      if (!BASE58.test(address)) return json(res, 400, { error: 'invalid base58 address' });
      const data = await birdeyePriceStats(address, url.searchParams.get('list_timeframe') ?? '1m,5m,30m,1h,4h,24h');
      json(res, 200, data);
      return;
    }

    if (route === 'GET /api/token/trade-data') {
      const address = url.searchParams.get('address')?.trim() ?? '';
      if (!BASE58.test(address)) return json(res, 400, { error: 'invalid base58 address' });
      const data = await birdeyeTradeData(address);
      json(res, 200, data);
      return;
    }

    if (route === 'GET /api/market/search') {
      const data = await birdeyeSearch(url);
      json(res, 200, data);
      return;
    }

    if (route === 'GET /api/smart-money/tokens') {
      const data = await birdeyeSmartMoney(url);
      json(res, 200, data);
      return;
    }

    if (route === 'GET /api/wallet/portfolio') {
      const address = url.searchParams.get('address')?.trim() ?? '';
      if (!BASE58.test(address)) return json(res, 400, { error: 'invalid base58 address' });
      // Birdeye first (richer data when the plan supports it), Helius DAS
      // as fallback for free-tier or rate-limited keys.
      try {
        const data = await birdeyeWalletPortfolio(address);
        json(res, 200, data);
      } catch (birdeyeErr) {
        if (!HELIUS_KEY) throw birdeyeErr;
        const data = await heliusWalletPortfolio(address);
        json(res, 200, data);
      }
      return;
    }

    if (route === 'POST /api/wallet/submit') {
      const body = (await readBody(req)) as { signed?: string } | undefined;
      const signed = body?.signed?.trim();
      if (!signed) return json(res, 400, { error: 'missing "signed" base58 string' });
      const data = await heliusSendTransaction(signed);
      json(res, 200, data);
      return;
    }

    if (route === 'POST /api/wallet/swap/build') {
      // Placeholder — wire to Jupiter / your own router when ready.
      json(res, 501, { error: 'swap build not implemented yet' });
      return;
    }

    if (route === 'GET /api/robotics/hardware') {
      json(res, 200, robotHardwareManifest());
      return;
    }

    if (route === 'POST /api/robot/connect') {
      const body = (await readBody(req)) as RobotConnection | undefined;
      if (!body) return json(res, 400, { error: 'missing JSON body' });
      const robotId = assertRobotId(body.robot_id);
      const robotUrl = safeRobotUrl(body.robot_url);
      json(res, 200, {
        ok: true,
        robot_id: robotId,
        robot_url: robotUrl,
        wallet: body.wallet && BASE58.test(body.wallet) ? body.wallet : null,
        model: body.model ?? 'ocasv1',
        capabilities: body.capabilities ?? ['telemetry', 'camera', 'imu', 'can-bus', 'motion-control'],
        hardware: robotHardwareManifest(),
        liveExecutionEnabled: ROBOT_LIVE_ENABLED,
      });
      return;
    }

    if (route === 'POST /api/robot/task') {
      const body = (await readBody(req)) as RobotTaskRequest | undefined;
      if (!body) return json(res, 400, { error: 'missing JSON body' });
      json(res, 200, buildRobotTaskEnvelope(body));
      return;
    }

    // ── Honcho ──────────────────────────────────────────────────────────
    if (route.startsWith('GET /api/honcho/') || route.startsWith('POST /api/honcho/')) {
      const honcho = await loadHoncho();
      if (!honcho) return json(res, 503, { error: 'honcho bridge not loaded' });

      if (route === 'GET /api/honcho/config') {
        const cfg = honcho.loadHonchoConfig();
        const redact = (s: string) =>
          !s ? '(unset)' : s.length <= 12 ? '****' : `${s.slice(0, 6)}…${s.slice(-4)}`;
        return json(res, 200, {
          enabled: cfg.enabled,
          url: cfg.url,
          apiKey: redact(cfg.apiKey),
          workspaceId: cfg.workspaceId,
          agentPeerId: cfg.agentPeerId,
          reasoningLevel: cfg.reasoningLevel,
          contextTokens: cfg.contextTokens,
          contextSummary: cfg.contextSummary,
          syncMessages: cfg.syncMessages,
          webhookSecret: redact(cfg.webhookSecret),
          webhooks: cfg.webhooks.map((w: { index: number; url: string; secret: string; workspace?: string }) => ({
            index: w.index,
            url: w.url,
            workspace: w.workspace,
            secret: redact(w.secret),
          })),
        });
      }

      if (route === 'POST /api/honcho/webhook') {
        const cfg = honcho.loadHonchoConfig();
        const raw = await readRawBody(req);
        const headers: Record<string, string | string[] | undefined> = req.headers as never;
        const peeked = (() => {
          try {
            const parsed = JSON.parse(raw.toString('utf8')) as { workspace_id?: string; workspaceId?: string };
            return parsed.workspace_id ?? parsed.workspaceId;
          } catch {
            return undefined;
          }
        })();
        const secret = honcho.secretForRequest(cfg, peeked);
        const verdict = honcho.verifyHonchoWebhook({ headers, rawBody: raw }, secret);
        if (!verdict.ok) return json(res, verdict.status, { error: verdict.reason });
        // Server-side dispatcher hook would go here. For now we ack so the
        // platform can confirm delivery; downstream subscribers can run via
        // services/pump-scanner-cron or skills/* by reading the same env.
        json(res, 200, { ok: true, type: verdict.event.type, receivedAt: verdict.event.receivedAt });
        return;
      }

      const engine = honcho.createHonchoEngine();

      if (route === 'POST /api/honcho/remember') {
        const body = (await readBody(req)) as
          | { peer?: string; agent?: string; role?: 'owner' | 'agent'; channel?: { thread: string; platform: string }; content?: string }
          | undefined;
        if (!body?.peer || !body.role || !body.channel?.thread || !body.content) {
          return json(res, 400, { error: 'peer, role, channel.thread, content required' });
        }
        await engine.remember({
          ownerId: body.peer,
          agentId: body.agent,
          role: body.role,
          channel: { thread: body.channel.thread, platform: body.channel.platform ?? 'web' },
          content: body.content,
        });
        return json(res, 200, { ok: true });
      }

      if (route === 'POST /api/honcho/context') {
        const body = (await readBody(req)) as
          | { peer?: string; agent?: string; channel?: { thread: string; platform?: string }; tokens?: number; summary?: boolean }
          | undefined;
        if (!body?.peer || !body.channel?.thread) {
          return json(res, 400, { error: 'peer, channel.thread required' });
        }
        const messages = await engine.contextFor({
          ownerId: body.peer,
          agentId: body.agent,
          channel: { thread: body.channel.thread, platform: body.channel.platform ?? 'web' },
          tokens: body.tokens,
          summary: body.summary,
        });
        return json(res, 200, { messages });
      }

      if (route === 'POST /api/honcho/ask') {
        const body = (await readBody(req)) as { peer?: string; query?: string } | undefined;
        if (!body?.peer || !body.query) {
          return json(res, 400, { error: 'peer, query required' });
        }
        const reply = await engine.describe(body.peer, body.query);
        return json(res, 200, { reply });
      }
    }

    json(res, 404, { error: `unknown route ${route}` });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    json(res, 500, { error: msg });
  }
});

server.listen(PORT, async () => {
  console.log(`🦞 OpenClawd Gateway HTTP listening on ${REGISTRY_GATEWAY.url}`);
  console.log(`   registry override: ${REGISTRY_GATEWAY.envOverride} (or ${REGISTRY_GATEWAY.portEnvOverride ?? '—'})`);
  console.log(`   birdeye: ${BIRDEYE_KEY ? '✓' : '✗ (set BIRDEYE_API_KEY)'}`);
  console.log(`   birdeye wss: ${BIRDEYE_WSS_URL ? '✓' : '✗ (set BIRDEYE_WSS_URL for stream clients)'}`);
  console.log(`   helius:  ${HELIUS_KEY ? '✓' : '✗ (set HELIUS_API_KEY)'}`);
  await probeSrc();
  if (!SRC_DISABLED) {
    const status = (k: string, ok: boolean, err: string | null) =>
      `${ok ? '✓' : '✗'} ${k.padEnd(8)}${ok ? '' : ' — ' + (err ?? 'unknown').slice(0, 80)}`;
    console.log('   /src bridge:');
    console.log('     ' + status('runtime', !!srcBridge.runtime, SRC_ERRORS.runtime));
    console.log('     ' + status('clone',   !!srcBridge.clone,   SRC_ERRORS.clone));
    console.log('     ' + status('helius',  !!srcBridge.helius,  SRC_ERRORS.helius));
  }
  console.log('   routes:');
  console.log('     GET  /health');
  console.log('     GET  /api/token/overview?address=<mint>           Birdeye');
  console.log('     GET  /api/token/price?address=<mint>              Birdeye');
  console.log('     GET  /api/token/multi-price?addresses=<mints>     Birdeye');
  console.log('     GET  /api/token/ohlcv?address=<mint>&type=15m     Birdeye');
  console.log('     GET  /api/token/base-quote-ohlcv                  Birdeye');
  console.log('     GET  /api/token/price-stats?address=<mint>        Birdeye');
  console.log('     GET  /api/token/trade-data?address=<mint>         Birdeye');
  console.log('     GET  /api/market/search?keyword=<symbol>          Birdeye');
  console.log('     GET  /api/smart-money/tokens                      Birdeye');
  console.log('     GET  /api/wallet/portfolio?address=<wallet>       Birdeye → Helius DAS');
  console.log('     POST /api/wallet/submit          { signed: ... }   Helius RPC');
  console.log('     POST /api/wallet/swap/build                       (501 stub)');
  console.log('     GET  /api/robotics/hardware                       OCASV1 hardware manifest');
  console.log('     POST /api/robot/connect          { robot_id, robot_url? }');
  console.log('     POST /api/robot/task             { robot_id, objective, amount_usd? }');
  console.log('     GET  /api/agent/runtime                           /src runtime');
  console.log('     GET  /api/agent/skills                            /src skills');
  console.log('     POST /api/agent/text             { prompt: ... }   /src OpenRouter');
  console.log('     POST /api/agent/clone            { type: ... }     /src cloneAgent');
  console.log('     GET  /api/helius/asset?id=<id>                    /src Helius DAS');
  console.log('     POST /api/honcho/webhook                          Honcho HMAC-verified webhook');
  console.log('     POST /api/honcho/remember        { peer, role, channel, content }');
  console.log('     POST /api/honcho/context         { peer, channel, tokens? }');
  console.log('     POST /api/honcho/ask             { peer, query }');
  console.log('     GET  /api/honcho/config                           Honcho resolved config (redacted)');
  console.log('     POST /api/codex/tasks            { prompt, mode? } OpenAI Responses task dispatch');
  console.log('     GET  /api/codex/tasks                             list Codex tasks');
  console.log('     GET  /api/codex/tasks/<id>                        inspect Codex task');
});
