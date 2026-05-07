/**
 * Monitor Agent — Real-time price alerts, whale tracking
 */
import type { AgentRuntime } from './runtime.js';
interface Alert {
    type: 'price' | 'whale' | 'volume';
    token: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
}
export declare class MonitorAgent {
    private birdeye;
    private helius;
    private memory;
    private openrouter;
    private skills;
    private watchlist;
    private alerts;
    constructor(runtime?: AgentRuntime);
    summarizeAlerts(): Promise<string>;
    run(): Promise<void>;
    addToWatchlist(mint: string): Promise<void>;
    checkPrices(): Promise<void>;
    trackWhales(): Promise<void>;
    estimateTxValue(tx: any): number;
    checkVolume(): Promise<void>;
    getAlerts(): Alert[];
    private latestNumber;
}
export {};
//# sourceMappingURL=monitor.d.ts.map