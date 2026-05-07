import { reqEnv } from './env.js';

const BASE = 'https://public-api.birdeye.so';

async function req<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const apiKey = reqEnv('BIRDEYE_API_KEY');
  const url = new URL(`${BASE}${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const r = await fetch(url, {
    headers: {
      accept: 'application/json',
      'x-chain': 'solana',
      'X-API-KEY': apiKey,
    },
  });
  if (!r.ok) throw new Error(`Birdeye ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const j: any = await r.json();
  if (j?.success === false) throw new Error(`Birdeye error: ${j?.message || 'unknown'}`);
  return j.data as T;
}

export interface BirdeyeTrendingItem {
  address: string;
  symbol: string;
  name: string;
  price?: number;
  v24hUSD?: number;
  liquidity?: number;
  rank?: number;
}

export async function trending(timeframe: '1h' | '4h' | '24h' = '24h', limit = 10): Promise<BirdeyeTrendingItem[]> {
  const sortBy = timeframe === '1h' ? 'volume1hUSD' : timeframe === '4h' ? 'volume4hUSD' : 'volume24hUSD';
  const data = await req<{ tokens: BirdeyeTrendingItem[] }>('/defi/token_trending', {
    sort_by: sortBy,
    sort_type: 'desc',
    limit: String(limit),
  });
  return data.tokens || [];
}

export async function tokenOverview(mint: string): Promise<any> {
  return req<any>('/defi/token_overview', { address: mint });
}

export async function search(query: string): Promise<any> {
  return req<any>('/defi/v3/search', { keyword: query, limit: '10' });
}

export async function portfolio(wallet: string): Promise<any> {
  return req<any>('/v1/wallet/token_list', { wallet });
}
