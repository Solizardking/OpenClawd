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
import { createRuntime, getRuntime, type AgentRuntime } from './runtime.js';

export type AgentType = 'trader' | 'scanner' | 'analyst' | 'monitor';
export type AnyAgent = TraderAgent | ScannerAgent | AnalystAgent | MonitorAgent;

export interface CloneOptions {
    runtime?: AgentRuntime;
    isolated?: boolean;
}

export function cloneAgent(type: 'trader', opts?: CloneOptions): TraderAgent;
export function cloneAgent(type: 'scanner', opts?: CloneOptions): ScannerAgent;
export function cloneAgent(type: 'analyst', opts?: CloneOptions): AnalystAgent;
export function cloneAgent(type: 'monitor', opts?: CloneOptions): MonitorAgent;
export function cloneAgent(type: AgentType, opts?: CloneOptions): AnyAgent;
export function cloneAgent(type: AgentType, opts: CloneOptions = {}): AnyAgent {
    const runtime = opts.runtime ?? (opts.isolated ? createRuntime() : getRuntime());
    switch (type) {
        case 'trader':
            return new TraderAgent(runtime);
        case 'scanner':
            return new ScannerAgent(runtime);
        case 'analyst':
            return new AnalystAgent(runtime);
        case 'monitor':
            return new MonitorAgent(runtime);
    }
}

export function cloneAll(opts: CloneOptions = {}): {
    trader: TraderAgent;
    scanner: ScannerAgent;
    analyst: AnalystAgent;
    monitor: MonitorAgent;
} {
    const runtime = opts.runtime ?? (opts.isolated ? createRuntime() : getRuntime());
    return {
        trader: cloneAgent('trader', { runtime }),
        scanner: cloneAgent('scanner', { runtime }),
        analyst: cloneAgent('analyst', { runtime }),
        monitor: cloneAgent('monitor', { runtime }),
    };
}
