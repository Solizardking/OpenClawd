/**
 * Client-side API service for Birdeye features.
 * All calls go through Nitro server routes so the API key stays server-side.
 */

const BASE = '/api/birdeye'

async function fetchJson<T = unknown>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<T> {
  const url = new URL(`${BASE}${path}`, window.location.origin)
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== '') url.searchParams.set(k, String(v))
    }
  }
  const res = await fetch(url.toString())
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Birdeye API ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

export interface BirdeyeOHLCVItem {
  o: number
  h: number
  l: number
  c: number
  v: number
  unixTime: number
  address: string
  type: string
}

export interface BirdeyeTokenOverview {
  address: string
  symbol: string
  name: string
  decimals: number
  logoURI: string
  price: number
  marketCap: number
  fdv: number
  liquidity: number
  holder: number
  priceChange1mPercent: number
  priceChange5mPercent: number
  priceChange30mPercent: number
  priceChange1hPercent: number
  priceChange2hPercent: number
  priceChange4hPercent: number
  priceChange8hPercent: number
  priceChange12hPercent: number
  priceChange24hPercent: number
  uniqueWallet1h: number
  uniqueWallet4h: number
  uniqueWallet24h: number
  volume24hUSD: number
  extensions?: {
    website?: string
    twitter?: string
    discord?: string
    telegram?: string
    description?: string
  }
}

export interface BirdeyeMarketData {
  address: string
  price: number
  liquidity: number
  total_supply: number
  circulating_supply: number
  market_cap: number
  fdv: number
  holder: number
}

export interface BirdeyeMultiPriceItem {
  value: number
  updateUnixTime: number
  priceChange24h: number
  priceInNative: number
  liquidity: number
}

export interface BirdeyeTrendingToken {
  address: string
  symbol: string
  name: string
  decimals: number
  logoURI: string
  price: number
  volume24hUSD: number
  rank: number
}

export interface BirdeyeTradeData {
  address: string
  price: number
  liquidity: number
  holder: number
  volume_24h_usd: number
  buy_24h: number
  sell_24h: number
  trade_24h: number
  unique_wallet_24h: number
  priceChange24hPercent: number
  [key: string]: unknown
}

export interface BirdeyeSmartMoneyToken {
  token: string
  price: number
  liquidity: number
  market_cap: number
  net_flow: number
  smart_traders_no: number
  trader_style: string
  volume_usd: number
  volume_buy_usd: number
  volume_sell_usd: number
  symbol: string
  name: string
  logo_uri: string
  price_change_percent: number
}

export const birdeyeApi = {
  /**
   * Get OHLCV candlestick data for a token.
   * Birdeye timeframes: 1m, 3m, 5m, 15m, 30m, 1H, 2H, 4H, 6H, 8H, 12H, 1D, 3D, 1W, 1M
   */
  getOHLCV: (
    address: string,
    type = '1m',
    timeFrom?: number,
    timeTo?: number,
    currency?: string,
  ) =>
    fetchJson<{ items: BirdeyeOHLCVItem[] }>('/ohlcv', {
      address,
      type,
      timeFrom,
      timeTo,
      currency,
    }),

  /** Get comprehensive token overview (price, mcap, liquidity, holders, etc.) */
  getToken: (address: string) =>
    fetchJson<BirdeyeTokenOverview>('/token', { address }),

  /** Get token market data (price, supply, mcap, fdv, holders) */
  getMarketData: (address: string) =>
    fetchJson<BirdeyeMarketData>('/market-data', { address }),

  /** Get price stats across timeframes */
  getPriceStats: (address: string, timeframes?: string) =>
    fetchJson('/price-stats', { address, timeframes }),

  /** Get WebSocket URL for real-time data */
  getWsUrl: () => fetchJson<{ wsUrl: string }>('/ws'),

  /** Get trending tokens from Birdeye */
  getTrending: (limit = 20) =>
    fetchJson<{ tokens: BirdeyeTrendingToken[] }>('/trending', { limit }),

  /** Get newly listed tokens from Birdeye */
  getNewListings: (limit = 50) =>
    fetchJson('/new-listings', { limit }),

  /** Get token security data */
  getSecurity: (address: string) =>
    fetchJson('/security', { address }),

  /** Get trade data (buy/sell volume, wallet counts) */
  getTradeData: (address: string, frames?: string) =>
    fetchJson<BirdeyeTradeData>('/trade-data', { address, frames }),

  /** Get prices for multiple tokens at once (max 100) */
  getMultiPrice: (addresses: string[]) =>
    fetchJson<Record<string, BirdeyeMultiPriceItem>>('/multi-price', {
      addresses: addresses.join(','),
    }),

  /** Get Birdeye smart-money token flow */
  getSmartMoney: (params?: {
    interval?: '1d' | '7d' | '30d'
    traderStyle?: 'all' | 'risk_averse' | 'risk_balancers' | 'trenchers'
    sortBy?: 'net_flow' | 'smart_traders_no' | 'market_cap'
    limit?: number
  }) =>
    fetchJson<BirdeyeSmartMoneyToken[]>('/smart-money', {
      interval: params?.interval,
      trader_style: params?.traderStyle,
      sort_by: params?.sortBy,
      limit: params?.limit,
    }),
}
