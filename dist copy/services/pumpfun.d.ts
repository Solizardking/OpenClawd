/**
 * Pump.fun Service — Token discovery and bonding curve trading
 */
export interface PumpFunToken {
    mint: string;
    name: string;
    symbol: string;
    marketCap: number;
    bondingPercent: number;
    ageMinutes: number;
    volume24h: number;
}
export declare class PumpFunService {
    getTrending(): Promise<PumpFunToken[]>;
    getRecent(): Promise<PumpFunToken[]>;
    getToken(mint: string): Promise<{
        mint: string;
        marketCap: number;
        bondingPercent: number;
    }>;
    getGraduationProgress(mint: string): Promise<{
        bonding: number;
        graduated: boolean;
    }>;
}
//# sourceMappingURL=pumpfun.d.ts.map