/**
 * Birdeye Service — Token data, trending, OHLCV charts
 */
export class BirdeyeService {
    apiKey = process.env.BIRDEYE_API_KEY || '';
    async getPrice(mint) {
        return 0;
    }
    async getVolume(mint) {
        return 0;
    }
    async getTokenInfo(mint) {
        return {};
    }
    async getOHLCV(mint) {
        return [];
    }
    async getTrending() {
        return [];
    }
}
//# sourceMappingURL=birdeye.js.map