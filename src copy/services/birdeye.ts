/**
 * Birdeye Service — Token data, trending, OHLCV charts
 */

export class BirdeyeService {
    private apiKey = process.env.BIRDEYE_API_KEY || '';
    
    async getPrice(mint: string): Promise<number> {
        return 0;
    }
    
    async getVolume(mint: string): Promise<number> {
        return 0;
    }
    
    async getTokenInfo(mint: string) {
        return {};
    }
    
    async getOHLCV(mint: string) {
        return [];
    }
    
    async getTrending() {
        return [];
    }
}