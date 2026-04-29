/**
 * PumpFunService — read-only client for the pump.fun API.
 *
 * Surfaces the two feeds Scanner agent needs: trending and recent
 * launches. Each token comes with the metrics the classifier requires
 * (marketCap, bondingPercent, ageMinutes). Real production code can
 * subclass this and override the fetch URLs as the API evolves.
 */

const PUMPFUN_BASE = 'https://frontend-api-v3.pump.fun'

export interface PumpFunTokenRaw {
  mint: string
  name?: string
  symbol?: string
  description?: string
  image_uri?: string
  twitter?: string
  telegram?: string
  website?: string
  market_cap?: number
  usd_market_cap?: number
  bonding_curve_progress?: number     // 0–100
  king_of_the_hill_timestamp?: number
  reply_count?: number
  created_timestamp?: number          // unix ms
  is_currently_live?: boolean
  raydium_pool?: string | null
}

export interface PumpFunToken {
  mint: string
  name: string
  symbol: string
  marketCap: number
  bondingPercent: number
  ageMinutes: number
  image?: string
  description?: string
  twitter?: string
  telegram?: string
  website?: string
  raydiumPool?: string | null
  raw?: PumpFunTokenRaw
}

function normalize(raw: PumpFunTokenRaw): PumpFunToken {
  const created = raw.created_timestamp ?? Date.now()
  return {
    mint: raw.mint,
    name: raw.name ?? '',
    symbol: raw.symbol ?? '',
    marketCap: raw.usd_market_cap ?? raw.market_cap ?? 0,
    bondingPercent: raw.bonding_curve_progress ?? 0,
    ageMinutes: Math.max(0, Math.floor((Date.now() - created) / 60_000)),
    image: raw.image_uri,
    description: raw.description,
    twitter: raw.twitter,
    telegram: raw.telegram,
    website: raw.website,
    raydiumPool: raw.raydium_pool ?? null,
    raw,
  }
}

export class PumpFunService {
  private base: string

  constructor(opts: { baseUrl?: string } = {}) {
    this.base = opts.baseUrl ?? PUMPFUN_BASE
  }

  async getTrending(opts: { limit?: number } = {}): Promise<PumpFunToken[]> {
    const limit = Math.max(1, Math.min(100, opts.limit ?? 50))
    const url = new URL(`${this.base}/coins/trending`)
    url.searchParams.set('limit', String(limit))
    return this.fetchAndNormalize(url)
  }

  async getRecent(opts: { limit?: number } = {}): Promise<PumpFunToken[]> {
    const limit = Math.max(1, Math.min(100, opts.limit ?? 50))
    const url = new URL(`${this.base}/coins`)
    url.searchParams.set('offset', '0')
    url.searchParams.set('limit', String(limit))
    url.searchParams.set('sort', 'created_timestamp')
    url.searchParams.set('order', 'DESC')
    return this.fetchAndNormalize(url)
  }

  async getKingOfTheHill(): Promise<PumpFunToken | null> {
    const url = `${this.base}/coins/king-of-the-hill`
    const res = await fetch(url, { headers: { accept: 'application/json' } })
    if (!res.ok) return null
    const raw = (await res.json()) as PumpFunTokenRaw
    return raw?.mint ? normalize(raw) : null
  }

  async getMint(mint: string): Promise<PumpFunToken | null> {
    const url = `${this.base}/coins/${encodeURIComponent(mint)}`
    const res = await fetch(url, { headers: { accept: 'application/json' } })
    if (!res.ok) return null
    const raw = (await res.json()) as PumpFunTokenRaw
    return raw?.mint ? normalize(raw) : null
  }

  private async fetchAndNormalize(url: URL): Promise<PumpFunToken[]> {
    const res = await fetch(url, { headers: { accept: 'application/json' } })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`pump.fun ${res.status}: ${body.slice(0, 200)}`)
    }
    const items = (await res.json()) as PumpFunTokenRaw[] | { coins?: PumpFunTokenRaw[] }
    const list = Array.isArray(items) ? items : (items.coins ?? [])
    return list.map(normalize)
  }
}
