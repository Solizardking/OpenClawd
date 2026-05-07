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
import { createRuntime, getRuntime } from './runtime.js';
export function cloneAgent(type, opts = {}) {
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
export function cloneAll(opts = {}) {
    const runtime = opts.runtime ?? (opts.isolated ? createRuntime() : getRuntime());
    return {
        trader: cloneAgent('trader', { runtime }),
        scanner: cloneAgent('scanner', { runtime }),
        analyst: cloneAgent('analyst', { runtime }),
        monitor: cloneAgent('monitor', { runtime }),
    };
}
//# sourceMappingURL=clone.js.map