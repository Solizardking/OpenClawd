/**
 * BirdeyeService — agent-facing Birdeye wrapper.
 *
 * Surfaces the methods Analyst/Monitor agents call. Each call returns
 * undefined/empty on transport error (agents continue rather than crash).
 * Uses the public Birdeye API at public-api.birdeye.so with the
 * x-chain: solana convention and the BIRDEYE_API_KEY header.
 */

const BIRDEYE_BASE = 'https://public-api.birdeye.so'

export interface OHLCVCandle {
  unixTime: number
  o: number
  h: number
  l: number
  c: number
  v: number
}

export interface TokenInfo {
  address: string
  symbol?: string
  name?: string
  decimals?: number
  logoURI?: string
  liquidity?: number
  marketCap?: number
  fdv?: number
  v24hUSD?: number
  holder?: number
  price?: number
}

export class BirdeyeService {
  private apiKey: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey ?? process.env.BIRDEYE_API_KEY ?? ''
  }

  hasKey(): boolean {
    return Boolean(this.apiKey)
  }

  private async get<T>(path: string, params: Record<string, string | number> = {}): Promise<T | null> {
    if (!this.apiKey) return null
    const url = new URL(BIRDEYE_BASE + path)
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v))
    try {
      const res = await fetch(url, {
        headers: {
          accept: 'application/json',
          'x-chain': 'solana',
          'X-API-KEY': this.apiKey,
        },
      })
      if (!res.ok) return null
      const json = (await res.json()) as { success?: boolean; data?: T }
      if (json.success === false) return null
      return (json.data ?? (json as unknown as T)) as T
    } catch {
      return null
    }
  }

  async getPrice(mint: string): Promise<number | null> {
    const data = await this.get<{ value?: number }>('/defi/price', { address: mint })
    return data?.value ?? null
  }

  async getTokenInfo(mint: string): Promise<TokenInfo | null> {
    return this.get<TokenInfo>('/defi/token_overview', {
      address: mint,
      ui_amount_mode: 'scaled',
    })
  }

  async getOHLCV(
    mint: string,
    opts: { type?: '1m' | '5m' | '15m' | '1H' | '4H' | '1D'; limit?: number } = {},
  ): Promise<OHLCVCandle[]> {
    const type = opts.type ?? '1H'
    const limit = opts.limit ?? 100
    const now = Math.floor(Date.now() / 1000)
    const interval = { '1m': 60, '5m': 300, '15m': 900, '1H': 3600, '4H': 14400, '1D': 86400 }[type]
    const from = now - interval * limit
    const data = await this.get<{ items?: OHLCVCandle[] }>('/defi/ohlcv', {
      address: mint,
      type,
      time_from: from,
      time_to: now,
    })
    return data?.items ?? []
  }

  async getVolume(mint: string): Promise<number | null> {
    const info = await this.getTokenInfo(mint)
    return info?.v24hUSD ?? null
  }

  async getTrending(opts: { limit?: number } = {}): Promise<TokenInfo[]> {
    const limit = opts.limit ?? 20
    const data = await this.get<{ tokens?: TokenInfo[] }>('/defi/token_trending', {
      sort_by: 'rank',
      sort_type: 'asc',
      offset: 0,
      limit,
    })
    return data?.tokens ?? []
  }
}
