/**
 * Scanner Agent — Pump.fun token discovery, graduation tracking
 */
import { type PumpFunToken } from '../services/pumpfun.js';
import type { AgentRuntime } from './runtime.js';
interface TokenSignal {
    mint: string;
    name: string;
    symbol: string;
    marketCap: number;
    bondingPercent: number;
    ageMinutes: number;
    volume24h: number;
    tier: 'SNIPE' | 'BUY' | 'RIDE' | 'AVOID' | 'SCALP' | 'SKIP';
}
export declare class ScannerAgent {
    private pumpfun;
    private memory;
    private openrouter;
    private skills;
    constructor(runtime?: AgentRuntime);
    describeSignals(signals: TokenSignal[]): Promise<string>;
    run(): Promise<TokenSignal[]>;
    scanPumpFun(): Promise<PumpFunToken[]>;
    classifyTokens(tokens: PumpFunToken[]): TokenSignal[];
    classify(token: {
        marketCap: number;
        bondingPercent?: number;
        ageMinutes: number;
    }): TokenSignal['tier'];
}
export {};
//# sourceMappingURL=scanner.d.ts.map