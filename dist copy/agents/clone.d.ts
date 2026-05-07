/**
 * cloneAgent — spawn a new agent of the given type, injecting the runtime
 * (and therefore the full skill set) at birth.
 *
 * If you pass an existing runtime the clone shares its memory and OpenRouter
 * key with its parent; otherwise a fresh runtime is created.
 */
import { TraderAgent } from './trader.js';
import { ScannerAgent } from './scanner.js';
import { AnalystAgent } from './analyst.js';
import { MonitorAgent } from './monitor.js';
import { type AgentRuntime } from './runtime.js';
export type AgentType = 'trader' | 'scanner' | 'analyst' | 'monitor';
export type AnyAgent = TraderAgent | ScannerAgent | AnalystAgent | MonitorAgent;
export interface CloneOptions {
    runtime?: AgentRuntime;
    isolated?: boolean;
}
export declare function cloneAgent(type: 'trader', opts?: CloneOptions): TraderAgent;
export declare function cloneAgent(type: 'scanner', opts?: CloneOptions): ScannerAgent;
export declare function cloneAgent(type: 'analyst', opts?: CloneOptions): AnalystAgent;
export declare function cloneAgent(type: 'monitor', opts?: CloneOptions): MonitorAgent;
export declare function cloneAgent(type: AgentType, opts?: CloneOptions): AnyAgent;
export declare function cloneAll(opts?: CloneOptions): {
    trader: TraderAgent;
    scanner: ScannerAgent;
    analyst: AnalystAgent;
    monitor: MonitorAgent;
};
//# sourceMappingURL=clone.d.ts.map