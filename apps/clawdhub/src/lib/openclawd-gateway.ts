// 🦞 Typed client for the OpenClawd HTTP gateway.
//
// Browser-safe: uses fetch + localStorage so it can talk to a user-supplied
// gateway URL. Default points at localhost dev; users can also point at a
// remote gateway (e.g. https://gateway.solanaclawd.com).

const LS_KEY = "openclawd-gateway-base";
export const DEFAULT_GATEWAY_BASE = "http://127.0.0.1:8788";

export interface GatewayHealth {
  ok: boolean;
  service: string;
  version: string;
  birdeye: boolean;
  helius: boolean;
  srcBridge: "live" | "disabled";
  srcModules: { runtime: string; clone: string; helius: string };
  time: number;
}

export interface AssetCard {
  id?: string;
  address?: string;
  symbol?: string;
  name?: string;
  decimals?: number;
  price?: number;
  marketCap?: number;
  liquidity?: number;
  v24hUSD?: number;
  priceChange24hPercent?: number;
  token_info?: {
    symbol?: string;
    decimals?: number;
    supply?: number;
    price_info?: { price_per_token?: number };
  };
  content?: {
    metadata?: { name?: string; description?: string; symbol?: string };
    links?: { image?: string };
  };
  _source?: "birdeye" | "helius";
}

export interface WalletPortfolio {
  wallet?: string;
  totalUsd?: number;
  items?: Array<{
    address: string;
    symbol?: string;
    decimals?: number;
    balance?: number;
    uiAmount?: number;
    priceUsd?: number;
    valueUsd?: number;
  }>;
  nativeBalance?: { lamports?: number; total_price?: number; price_per_sol?: number };
  source?: string;
}

export interface AgentSkill {
  key?: string;
  name?: string;
  description?: string;
  kind?: string;
  enabled?: boolean;
  hasTool?: boolean;
}

export function readGatewayBase(): string {
  if (typeof window === "undefined") return DEFAULT_GATEWAY_BASE;
  return localStorage.getItem(LS_KEY)?.trim() || DEFAULT_GATEWAY_BASE;
}

export function writeGatewayBase(value: string): string {
  const normalized = value.trim().replace(/\/+$/, "") || DEFAULT_GATEWAY_BASE;
  if (typeof window !== "undefined") localStorage.setItem(LS_KEY, normalized);
  return normalized;
}

async function gw<T>(path: string, init: RequestInit = {}, base?: string): Promise<T> {
  const url = (base ?? readGatewayBase()) + (path.startsWith("/") ? path : "/" + path);
  const res = await fetch(url, {
    ...init,
    headers: {
      accept: "application/json",
      ...(init.body ? { "content-type": "application/json" } : {}),
      ...(init.headers ?? {}),
    },
  });
  const json = (await res.json().catch(() => ({}))) as { error?: string } & Record<string, unknown>;
  if (!res.ok || (typeof json.error === "string" && json.error)) {
    throw new Error(json.error || `HTTP ${res.status}`);
  }
  return json as T;
}

export const OpenClawdGateway = {
  health(base?: string) {
    return gw<GatewayHealth>("/health", {}, base);
  },
  asset(idOrMint: string, base?: string): Promise<AssetCard> {
    return gw<AssetCard>("/api/helius/asset?id=" + encodeURIComponent(idOrMint), {}, base)
      .then((d) => ({ ...d, _source: "helius" as const }))
      .catch(() =>
        gw<AssetCard>(
          "/api/token/overview?address=" + encodeURIComponent(idOrMint),
          {},
          base,
        ).then((d) => ({ ...d, _source: "birdeye" as const })),
      );
  },
  walletPortfolio(address: string, base?: string) {
    return gw<WalletPortfolio>(
      "/api/wallet/portfolio?address=" + encodeURIComponent(address),
      {},
      base,
    );
  },
  agentSkills(base?: string) {
    return gw<{ skills: AgentSkill[] }>("/api/agent/skills", {}, base);
  },
  agentText(prompt: string, opts: { model?: string } = {}, base?: string) {
    return gw<{ text: string }>(
      "/api/agent/text",
      { method: "POST", body: JSON.stringify({ prompt, model: opts.model }) },
      base,
    );
  },
};
