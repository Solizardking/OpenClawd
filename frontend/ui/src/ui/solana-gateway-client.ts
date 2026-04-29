// Typed client for the OpenClawd HTTP gateway (gateway/src/http.ts).
// Persists base URL in localStorage so the panel boots in the right state.

const LS_KEY = "openclawd-solana-gateway-base";
const DEFAULT_BASE = "http://127.0.0.1:8788";

export type Health = {
  ok: boolean;
  service: string;
  version: string;
  birdeye: boolean;
  helius: boolean;
  srcBridge: "live" | "disabled";
  srcModules: { runtime: string; clone: string; helius: string };
  time: number;
};

export type AssetCard = {
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
  content?: { metadata?: { name?: string; description?: string; symbol?: string } };
  _source?: "birdeye" | "helius";
};

export type WalletPortfolio = {
  wallet?: string;
  totalUsd?: number;
  items?: Array<{
    address: string;
    symbol?: string;
    name?: string;
    decimals?: number;
    balance?: number;
    uiAmount?: number;
    priceUsd?: number;
    valueUsd?: number;
  }>;
  nativeBalance?: { lamports?: number; total_price?: number; price_per_sol?: number };
  source?: string;
};

export type AgentSkill = {
  key?: string;
  name?: string;
  description?: string;
  kind?: string;
  enabled?: boolean;
  hasTool?: boolean;
};

export type RuntimeInfo = {
  hasOpenRouterKey?: boolean;
  skills?: AgentSkill[];
};

export class SolanaGatewayClient {
  private _base: string;

  constructor(base?: string) {
    this._base = base ?? localStorage.getItem(LS_KEY) ?? DEFAULT_BASE;
  }

  get base(): string {
    return this._base;
  }

  set base(value: string) {
    this._base = value.trim().replace(/\/+$/, "") || DEFAULT_BASE;
    localStorage.setItem(LS_KEY, this._base);
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(this._base + (path.startsWith("/") ? path : "/" + path), {
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

  health(): Promise<Health> {
    return this.request("/health");
  }

  asset(idOrMint: string): Promise<AssetCard> {
    // Try Helius DAS first (works for any asset), fall back to Birdeye overview
    return this.request<AssetCard>("/api/helius/asset?id=" + encodeURIComponent(idOrMint))
      .then((d) => ({ ...d, _source: "helius" as const }))
      .catch(() =>
        this.request<AssetCard>(
          "/api/token/overview?address=" + encodeURIComponent(idOrMint),
        ).then((d) => ({ ...d, _source: "birdeye" as const })),
      );
  }

  walletPortfolio(address: string): Promise<WalletPortfolio> {
    return this.request("/api/wallet/portfolio?address=" + encodeURIComponent(address));
  }

  agentRuntime(): Promise<RuntimeInfo> {
    return this.request("/api/agent/runtime");
  }

  agentSkills(): Promise<{ skills: AgentSkill[] }> {
    return this.request("/api/agent/skills");
  }

  agentClone(type: "trader" | "scanner" | "analyst" | "monitor"): Promise<{ ok: boolean; cloned: string }> {
    return this.request("/api/agent/clone", {
      method: "POST",
      body: JSON.stringify({ type }),
    });
  }

  agentText(prompt: string, opts: { model?: string; instructions?: string } = {}): Promise<{ text: string }> {
    return this.request("/api/agent/text", {
      method: "POST",
      body: JSON.stringify({ prompt, ...opts }),
    });
  }
}
