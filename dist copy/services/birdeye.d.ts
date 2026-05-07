/**
 * Birdeye Service — Token data, trending, OHLCV charts
 */
export declare class BirdeyeService {
    private apiKey;
    getPrice(mint: string): Promise<number>;
    getVolume(mint: string): Promise<number>;
    getTokenInfo(mint: string): Promise<{}>;
    getOHLCV(mint: string): Promise<never[]>;
    getTrending(): Promise<never[]>;
}
//# sourceMappingURL=birdeye.d.ts.map