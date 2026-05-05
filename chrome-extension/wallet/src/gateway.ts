// HTTP client for the OpenClawd Gateway. Read-only by default — the wallet
// adapter is what actually signs. The gateway constructs and broadcasts.

import type {
  GatewayClient,
  Portfolio,
  Pubkey,
  SubmitRequest,
  SubmitResponse,
  SwapBuildRequest,
  SwapBuildResponse,
  TokenHolding,
  TokenOverview,
} from './types.js'

export interface GatewayClientOptions {
  baseUrl?: string             // default http://127.0.0.1:8788
  bearerToken?: string         // optional Authorization: Bearer <token>
  fetch?: typeof globalThis.fetch
}

const DEFAULT_BASE = 'http://127.0.0.1:8788'

export class HttpGatewayClient implements GatewayClient {
  private baseUrl: string
  private headers: Record<string, string>
  private fetchImpl: typeof globalThis.fetch

  constructor(opts: GatewayClientOptions = {}) {
    this.baseUrl = (opts.baseUrl ?? DEFAULT_BASE).replace(/\/$/, '')
    this.headers = { 'content-type': 'application/json' }
    if (opts.bearerToken) this.headers.authorization = `Bearer ${opts.bearerToken}`
    this.fetchImpl = opts.fetch ?? globalThis.fetch.bind(globalThis)
  }

  async health(): Promise<{ ok: boolean; version?: string }> {
    const r = await this.fetchImpl(`${this.baseUrl}/health`, { headers: this.headers })
    if (!r.ok) return { ok: false }
    const j = (await r.json().catch(() => ({}))) as { version?: string }
    return { ok: true, version: j.version }
  }

  async tokenOverview(mint: string): Promise<TokenOverview> {
    const j = await this.get<unknown>(`/api/token/overview?address=${encodeURIComponent(mint)}`)
    return unwrapTokenOverview(j, mint)
  }

  async portfolio(owner: Pubkey): Promise<Portfolio> {
    const j = await this.get<unknown>(`/api/wallet/portfolio?address=${encodeURIComponent(owner)}`)
    return unwrapPortfolio(j, owner)
  }

  async swapBuild(req: SwapBuildRequest): Promise<SwapBuildResponse> {
    return this.post<SwapBuildResponse>('/api/wallet/swap/build', req)
  }

  async submit(req: SubmitRequest): Promise<SubmitResponse> {
    return this.post<SubmitResponse>('/api/wallet/submit', req)
  }

  private async get<T>(path: string): Promise<T> {
    const r = await this.fetchImpl(`${this.baseUrl}${path}`, { headers: this.headers })
    if (!r.ok) throw new Error(`gateway ${path}: ${r.status} ${r.statusText}`)
    return (await r.json()) as T
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const r = await this.fetchImpl(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body),
    })
    if (!r.ok) throw new Error(`gateway ${path}: ${r.status} ${r.statusText}`)
    return (await r.json()) as T
  }
}

// The gateway returns either a bare object or `{ data: {...} }`.
// Tolerate both shapes — the openclawd-chrome-extension/gateway-client.js does the same.
function unwrap<T>(j: unknown): T {
  if (j && typeof j === 'object' && 'data' in (j as Record<string, unknown>)) {
    return (j as { data: T }).data
  }
  return j as T
}

interface RawTokenOverview {
  address?: string
  mint?: string
  symbol?: string
  name?: string
  price?: number
  priceUsd?: number
  marketCap?: number
  marketCapUsd?: number
  liquidity?: number
  liquidityUsd?: number
  priceChange24h?: number
  priceChange24hPercent?: number
  holder?: number
  holders?: number
}

function unwrapTokenOverview(j: unknown, mint: string): TokenOverview {
  const d = unwrap<RawTokenOverview>(j)
  return {
    mint: d.address ?? d.mint ?? mint,
    symbol: d.symbol ?? '???',
    name: d.name,
    priceUsd: d.priceUsd ?? d.price ?? 0,
    marketCapUsd: d.marketCapUsd ?? d.marketCap,
    liquidityUsd: d.liquidityUsd ?? d.liquidity,
    priceChange24h: d.priceChange24h ?? d.priceChange24hPercent,
    holders: d.holders ?? d.holder,
  }
}

interface RawPortfolio {
  solBalance?: number
  sol?: number
  totalUsd?: number
  totalValueUsd?: number
  tokens?: Array<{
    mint?: string
    address?: string
    symbol?: string
    amount?: number
    uiAmount?: number
    decimals?: number
    valueUsd?: number
    usdValue?: number
    logoURI?: string
  }>
}

function unwrapPortfolio(j: unknown, owner: Pubkey): Portfolio {
  const d = unwrap<RawPortfolio>(j)
  const tokens: TokenHolding[] = (d.tokens ?? []).map((t) => ({
    mint: t.mint ?? t.address ?? '',
    symbol: t.symbol,
    amount: t.uiAmount ?? t.amount ?? 0,
    decimals: t.decimals ?? 0,
    usdValue: t.usdValue ?? t.valueUsd,
    logoURI: t.logoURI,
  }))
  return {
    pubkey: owner,
    solBalance: d.solBalance ?? d.sol ?? 0,
    totalUsd: d.totalUsd ?? d.totalValueUsd ?? 0,
    tokens,
    fetchedAt: Date.now(),
  }
}
