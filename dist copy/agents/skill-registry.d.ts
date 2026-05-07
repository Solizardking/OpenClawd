/**
 * SkillRegistry — catalog of injectable skills available to every clone.
 *
 * Built-in OpenRouter skills (text, images, models, oauth-doc, agent-migration)
 * are registered at construction so any agent can do
 * `runtime.skills.tool('openrouter.text')` and pass it into callModel — no
 * agent has to import the SDK directly.
 */
import { tool } from '@openrouter/agent/tool';
import type { OpenRouterService } from '../services/openrouter.js';
import type { JupiterService } from '../services/jupiter.js';
import type { MemoryService } from '../services/memory.js';
type ZodTool = ReturnType<typeof tool>;
export type SkillKind = 'inference' | 'image' | 'discovery' | 'auth' | 'doc' | 'onchain' | 'memory';
export interface SkillEntry {
    key: string;
    name: string;
    description: string;
    kind: SkillKind;
    enabled: boolean;
    tool?: ZodTool;
}
export interface SkillRegistryView {
    key: string;
    name: string;
    description: string;
    kind: SkillKind;
    enabled: boolean;
    hasTool: boolean;
}
interface RegistryDeps {
    openrouter: OpenRouterService;
    memory: MemoryService;
    jupiter: JupiterService;
}
export declare class SkillRegistry {
    private deps;
    private entries;
    constructor(deps: RegistryDeps);
    private registerOpenRouterSkills;
    private registerOnChainSkills;
    register(entry: SkillEntry): void;
    get(key: string): SkillEntry | undefined;
    tool(key: string): ZodTool | undefined;
    tools(keys?: string[]): ZodTool[];
    setEnabled(key: string, enabled: boolean): void;
    list(): SkillRegistryView[];
}
export {};
//# sourceMappingURL=skill-registry.d.ts.map