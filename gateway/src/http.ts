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

const PORT = Number(process.env.GATEWAY_HTTP_PORT) || 8788;
const BIRDEYE_KEY = process.env.BIRDEYE_API_KEY ?? '';
const HELIUS_KEY = process.env.HELIUS_API_KEY ?? '';
const HELIUS_RPC =
  process.env.HELIUS_RPC_URL ||
  (HELIUS_KEY ? `https://mainnet.helius-rpc.com/?api-key=${HELIUS_KEY}` : '');
const SRC_DISABLED = process.env.OPENCLAWD_SRC_DISABLED === '1';

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
  return loadSrcModule('runtime', () => import('../../src/agents/runtime.js'), (m) => {
    const mod = m as {
      getRuntime: () => unknown;
      describeRuntime: (r: unknown) => unknown;
    };
    return { getRuntime: mod.getRuntime, describeRuntime: mod.describeRuntime };
  });
}
async function ensureClone() {
  return loadSrcModule('clone', () => import('../../src/agents/clone.js'), (m) => {
    const mod = m as { cloneAgent: (t: string, o?: unknown) => unknown };
    return { cloneAgent: mod.cloneAgent };
  });
}
async function ensureHelius() {
  return loadSrcModule('helius', () => import('../../src/helius/index.js'), (m) => {
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
    'access-control-allow-headers': 'content-type, x-api-key, x-chain',
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

// ── Birdeye proxy ────────────────────────────────────────────────────
async function birdeyeOverview(address: string): Promise<unknown> {
  if (!BIRDEYE_KEY) throw new Error('BIRDEYE_API_KEY not set');
  const url = new URL('https://public-api.birdeye.so/defi/token_overview');
  url.searchParams.set('address', address);
  url.searchParams.set('ui_amount_mode', 'scaled');
  const r = await fetch(url, {
    headers: { accept: 'application/json', 'x-chain': 'solana', 'X-API-KEY': BIRDEYE_KEY },
  });
  if (!r.ok) throw new Error(`Birdeye ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const j = (await r.json()) as { success?: boolean; data?: unknown; message?: string };
  if (j.success === false) throw new Error(j.message ?? 'Birdeye request failed');
  return j.data ?? j;
}

async function birdeyeWalletPortfolio(wallet: string): Promise<unknown> {
  if (!BIRDEYE_KEY) throw new Error('BIRDEYE_API_KEY not set');
  const url = new URL('https://public-api.birdeye.so/v1/wallet/token_list');
  url.searchParams.set('wallet', wallet);
  const r = await fetch(url, {
    headers: { accept: 'application/json', 'x-chain': 'solana', 'X-API-KEY': BIRDEYE_KEY },
  });
  if (!r.ok) throw new Error(`Birdeye ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const j = (await r.json()) as { success?: boolean; data?: { items?: unknown[]; totalUsd?: number } };
  if (j.success === false) throw new Error('Birdeye request failed');
  return j.data ?? j;
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
    if (route === 'GET /health') {
      json(res, 200, {
        ok: true,
        service: '@openclawdsolana/gateway',
        version: '1.0.0',
        birdeye: Boolean(BIRDEYE_KEY),
        helius: Boolean(HELIUS_KEY),
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

    json(res, 404, { error: `unknown route ${route}` });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    json(res, 500, { error: msg });
  }
});

server.listen(PORT, async () => {
  console.log(`🦞 OpenClawd Gateway HTTP listening on http://127.0.0.1:${PORT}`);
  console.log(`   birdeye: ${BIRDEYE_KEY ? '✓' : '✗ (set BIRDEYE_API_KEY)'}`);
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
  console.log('     GET  /api/wallet/portfolio?address=<wallet>       Birdeye → Helius DAS');
  console.log('     POST /api/wallet/submit          { signed: ... }   Helius RPC');
  console.log('     POST /api/wallet/swap/build                       (501 stub)');
  console.log('     GET  /api/agent/runtime                           /src runtime');
  console.log('     GET  /api/agent/skills                            /src skills');
  console.log('     POST /api/agent/text             { prompt: ... }   /src OpenRouter');
  console.log('     POST /api/agent/clone            { type: ... }     /src cloneAgent');
  console.log('     GET  /api/helius/asset?id=<id>                    /src Helius DAS');
});
