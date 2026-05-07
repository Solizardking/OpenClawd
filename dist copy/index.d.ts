/**
 * OpenClawd — Financial AI Agent Platform
 *
 * Entry point for the clawd CLI and agent runtime.
 */
import { AnalystAgent } from './agents/analyst.js';
import { cloneAgent, cloneAll, type AgentType } from './agents/clone.js';
import { MonitorAgent } from './agents/monitor.js';
import { createRuntime, describeRuntime, getRuntime, type AgentRuntime } from './agents/runtime.js';
import { ScannerAgent } from './agents/scanner.js';
import { SkillRegistry } from './agents/skill-registry.js';
import { TraderAgent } from './agents/trader.js';
import { getPluginRegistry, PluginRegistry } from './plugins/index.js';
import { OpenRouterService } from './services/openrouter.js';
export { AnalystAgent, cloneAgent, cloneAll, createRuntime, describeRuntime, getPluginRegistry, getRuntime, MonitorAgent, OpenRouterService, PluginRegistry, ScannerAgent, SkillRegistry, TraderAgent, };
export type { AgentRuntime, AgentType };
export * from './plugins/index.js';
//# sourceMappingURL=index.d.ts.map