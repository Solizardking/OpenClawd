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

let sharedRuntime: AgentRuntime | null = null;

export function createRuntime(): AgentRuntime {
    const openrouter = new OpenRouterService();
    const memory = new MemoryService();
    const jupiter = new JupiterService();
    const skills = new SkillRegistry({ openrouter, memory, jupiter });
    return { openrouter, jupiter, memory, skills };
}

export function getRuntime(): AgentRuntime {
    if (!sharedRuntime) sharedRuntime = createRuntime();
    return sharedRuntime;
}

export function describeRuntime(runtime: AgentRuntime): {
    hasOpenRouterKey: boolean;
    skills: SkillRegistryView[];
} {
    return {
        hasOpenRouterKey: runtime.openrouter.hasKey(),
        skills: runtime.skills.list(),
    };
}
