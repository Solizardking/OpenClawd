/**
 * Birdeye API Service
 * Token analytics, price data, trending tokens
 */

export interface TokenPrice {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
}

export interface TrendingToken {
  symbol: string;
  address: string;
  price: number;
  change24h: number;
  volume24h: number;
}

export class BirdeyeService {
  private apiKey: string;
  private baseUrl = 'https://api.birdeye.so';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(`${url}&api_key=${this.apiKey}`);
    
    if (!response.ok) {
      throw new Error(`Birdeye API error: ${response.status}`);
    }
    
    return response.json();
  }

  async getPrice(symbol: string): Promise<number> {
    try {
      // Resolve symbol to address
      const search = await this.request<{ data: { address: string } }>(
        `/v1/token/search?q=${symbol}&network=solana`
      );
      
      if (!search.data?.address) {
        return 0;
      }

      const price = await this.request<{ data: { price: number } }>(
        `/v1/token/price?address=${search.data.address}&network=solana`
      );
      
      return price.data?.price || 0;
    } catch (error) {
      console.error(`Failed to get price for ${symbol}:`, error);
      return 0;
    }
  }

  async getTrending(): Promise<TrendingToken[]> {
    try {
      const data = await this.request<{ data: TrendingToken[] }>(
        `/v1/trending/token?network=solana&sort=volume24h&order=desc&limit=10`
      );
      
      return data.data || [];
    } catch (error) {
      console.error('Failed to get trending:', error);
      return [];
    }
  }

  async getTokenList(symbols: string[]): Promise<Map<string, TokenPrice>> {
    const results = new Map<string, TokenPrice>();
    
    await Promise.all(
      symbols.map(async (symbol) => {
        const price = await this.getPrice(symbol);
        results.set(symbol, {
          symbol,
          price,
          change24h: 0,
          volume24h: 0,
        });
      })
    );
    
    return results;
  }
}