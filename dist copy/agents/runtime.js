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
import { SkillRegistry } from './skill-registry.js';
let sharedRuntime = null;
export function createRuntime() {
    const openrouter = new OpenRouterService();
    const memory = new MemoryService();
    const jupiter = new JupiterService();
    const skills = new SkillRegistry({ openrouter, memory, jupiter });
    return { openrouter, jupiter, memory, skills };
}
export function getRuntime() {
    if (!sharedRuntime)
        sharedRuntime = createRuntime();
    return sharedRuntime;
}
export function describeRuntime(runtime) {
    return {
        hasOpenRouterKey: runtime.openrouter.hasKey(),
        skills: runtime.skills.list(),
    };
}
//# sourceMappingURL=runtime.js.map