/**
 * Analyst Agent — Wallet analysis, PnL tracking, market research
 */
import type { AgentRuntime } from './runtime.js';
export interface WalletProfile {
    address: string;
    solBalance: number;
    tokens: Array<{
        mint: string;
        symbol: string;
        amount: number;
        valueUSD: number;
    }>;
    realizedPnL: number;
    unrealizedPnL: number;
    topTraders: string[];
}
export declare class AnalystAgent {
    private helius;
    private birdeye;
    private memory;
    private openrouter;
    private skills;
    constructor(runtime?: AgentRuntime);
    run(): Promise<void>;
    writeReport(profile: WalletProfile): Promise<string>;
    analyzeWallet(address: string): Promise<WalletProfile>;
    calculatePnL(transactions: any[]): {
        realized: number;
        unrealized: number;
    };
    identifySmartMoney(tokens: any[]): any[];
    researchToken(mint: string): Promise<{
        tokenInfo: {};
        price: number;
        chart: never[];
        topTraders: string[];
    }>;
}
//# sourceMappingURL=analyst.d.ts.map