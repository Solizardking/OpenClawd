/**
 * AgentRuntime — injection container handed to every agent at birth.
 *
 * Every agent (or clone) receives the same runtime instance, giving it the
 * full skill catalog, OpenRouter inference, memory, and on-chain services
 * without each agent having to wire its own dependencies.
 */
import { OpenRouterService } from '../services/openrouter.js';
import { JupiterService } from '../services/jupiter.js';
import { MemoryService } from '../services/memory.js';
import { SkillRegistry, type SkillRegistryView } from './skill-registry.js';
export interface AgentRuntime {
    openrouter: OpenRouterService;
    jupiter: JupiterService;
    memory: MemoryService;
    skills: SkillRegistry;
}
export declare function createRuntime(): AgentRuntime;
export declare function getRuntime(): AgentRuntime;
export declare function describeRuntime(runtime: AgentRuntime): {
    hasOpenRouterKey: boolean;
    skills: SkillRegistryView[];
};
//# sourceMappingURL=runtime.d.ts.map