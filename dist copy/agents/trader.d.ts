/**
 * Trader Agent — Jupiter DEX execution, position management
 */
import type { AgentRuntime } from './runtime.js';
export declare class TraderAgent {
    private jupiter;
    private memory;
    private openrouter;
    private skills;
    constructor(runtime?: AgentRuntime);
    run(): Promise<void>;
    observe(): Promise<{
        prices: Record<string, number>;
        trending: unknown[];
        balance: number;
    }>;
    orient(): Promise<{
        confidence: number;
        trend?: number;
        momentum?: number;
        liquidity?: number;
    }[]>;
    scoreOportunity(opp: {
        trend?: number;
        momentum?: number;
        liquidity?: number;
    }): number;
    private asOpportunity;
    decide(): Promise<{
        confidence: number;
        trend?: number;
        momentum?: number;
        liquidity?: number;
    }[]>;
    narrate(prompt: string): Promise<string>;
    executeSwap(inputMint: string, outputMint: string, amount: number): Promise<{
        success: boolean;
        signature: string;
    } | null>;
}
//# sourceMappingURL=trader.d.ts.map