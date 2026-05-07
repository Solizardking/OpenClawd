/**
 * SkillRegistry — catalog of injectable skills available to every clone.
 *
 * Built-in OpenRouter skills (text, images, models, oauth-doc, agent-migration)
 * are registered at construction so any agent can do
 * `runtime.skills.tool('openrouter.text')` and pass it into callModel — no
 * agent has to import the SDK directly.
 */
import { z } from 'zod';
import { tool } from '@openrouter/agent/tool';
export class SkillRegistry {
    deps;
    entries = new Map();
    constructor(deps) {
        this.deps = deps;
        this.registerOpenRouterSkills();
        this.registerOnChainSkills();
    }
    registerOpenRouterSkills() {
        const { openrouter, memory } = this.deps;
        this.register({
            key: 'openrouter.text',
            name: 'OpenRouter Text Generation',
            description: 'Generate text or run tool-enabled agents via 300+ models.',
            kind: 'inference',
            enabled: true,
            tool: tool({
                name: 'openrouter_text',
                description: 'Generate text from a prompt using any OpenRouter model.',
                inputSchema: z.object({
                    prompt: z.string(),
                    model: z.string().optional(),
                    instructions: z.string().optional(),
                    temperature: z.number().min(0).max(2).optional(),
                    maxOutputTokens: z.number().int().positive().optional(),
                }),
                outputSchema: z.object({ text: z.string() }),
                execute: async (params) => {
                    const text = await openrouter.generateText(params.prompt, {
                        model: params.model,
                        instructions: params.instructions,
                        temperature: params.temperature,
                        maxOutputTokens: params.maxOutputTokens,
                    });
                    return { text };
                },
            }),
        });
        this.register({
            key: 'openrouter.image',
            name: 'OpenRouter Image Generation',
            description: 'Generate or edit images via Gemini/DALL-E through OpenRouter.',
            kind: 'image',
            enabled: true,
            tool: tool({
                name: 'openrouter_image',
                description: 'Generate an image from a text prompt.',
                inputSchema: z.object({
                    prompt: z.string(),
                    model: z.string().optional(),
                    aspectRatio: z.string().optional(),
                    size: z.string().optional(),
                }),
                outputSchema: z.object({ images: z.array(z.string()) }),
                execute: async (params) => {
                    const images = await openrouter.generateImage(params.prompt, {
                        model: params.model,
                        aspectRatio: params.aspectRatio,
                        size: params.size,
                    });
                    return { images };
                },
            }),
        });
        this.register({
            key: 'openrouter.models',
            name: 'OpenRouter Model Discovery',
            description: 'List, search, and resolve OpenRouter model IDs.',
            kind: 'discovery',
            enabled: true,
            tool: tool({
                name: 'openrouter_models',
                description: 'Search OpenRouter models or resolve an informal name to a model ID.',
                inputSchema: z.object({
                    query: z.string().optional(),
                    modality: z.enum(['text', 'image', 'audio']).optional(),
                }),
                outputSchema: z.object({
                    models: z.array(z.object({
                        id: z.string(),
                        name: z.string(),
                        contextLength: z.number(),
                    })),
                }),
                execute: async (params) => {
                    if (params.query) {
                        const m = await openrouter.resolveModel(params.query);
                        return {
                            models: m
                                ? [{ id: m.id, name: m.name, contextLength: m.contextLength }]
                                : [],
                        };
                    }
                    const all = await openrouter.listModels(params.modality);
                    return {
                        models: all
                            .slice(0, 50)
                            .map((m) => ({ id: m.id, name: m.name, contextLength: m.contextLength })),
                    };
                },
            }),
        });
        this.register({
            key: 'openrouter.oauth',
            name: 'Sign In with OpenRouter',
            description: 'PKCE flow for per-user API keys (browser-managed, no secrets).',
            kind: 'auth',
            enabled: true,
        });
        this.register({
            key: 'openrouter.agent-migration',
            name: 'OpenRouter Agent Migration Reference',
            description: 'Migration guide from @openrouter/sdk to @openrouter/agent.',
            kind: 'doc',
            enabled: true,
        });
        this.register({
            key: 'memory.tiers',
            name: 'KNOWN/LEARNED/INFERRED Memory',
            description: 'Three-tier memory store available to all agents.',
            kind: 'memory',
            enabled: true,
            tool: tool({
                name: 'memory_recall',
                description: 'Recall entries from a memory tier.',
                inputSchema: z.object({
                    tier: z.enum(['KNOWN', 'LEARNED', 'INFERRED']).optional(),
                }),
                outputSchema: z.object({ entries: z.array(z.unknown()) }),
                execute: async ({ tier }) => {
                    const entries = await memory.recall(tier);
                    return { entries };
                },
            }),
        });
    }
    registerOnChainSkills() {
        const { jupiter } = this.deps;
        this.register({
            key: 'jupiter.quote',
            name: 'Jupiter Swap Quote',
            description: 'Get a swap quote from Jupiter aggregator.',
            kind: 'onchain',
            enabled: true,
            tool: tool({
                name: 'jupiter_quote',
                description: 'Get a Jupiter swap quote between two SPL mints.',
                inputSchema: z.object({
                    inputMint: z.string(),
                    outputMint: z.string(),
                    amount: z.number().positive(),
                }),
                outputSchema: z.object({ quote: z.unknown() }),
                execute: async ({ inputMint, outputMint, amount }) => {
                    const quote = await jupiter.getQuote(inputMint, outputMint, amount);
                    return { quote };
                },
            }),
        });
    }
    register(entry) {
        this.entries.set(entry.key, entry);
    }
    get(key) {
        return this.entries.get(key);
    }
    tool(key) {
        return this.entries.get(key)?.tool;
    }
    tools(keys) {
        const source = keys
            ? keys.map((k) => this.entries.get(k)).filter((e) => Boolean(e))
            : Array.from(this.entries.values());
        return source.filter((e) => e.enabled && e.tool).map((e) => e.tool);
    }
    setEnabled(key, enabled) {
        const entry = this.entries.get(key);
        if (entry)
            entry.enabled = enabled;
    }
    list() {
        return Array.from(this.entries.values()).map((e) => ({
            key: e.key,
            name: e.name,
            description: e.description,
            kind: e.kind,
            enabled: e.enabled,
            hasTool: Boolean(e.tool),
        }));
    }
}
//# sourceMappingURL=skill-registry.js.map