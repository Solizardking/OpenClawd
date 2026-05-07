/**
 * Gateway RPC handlers for OpenRouter.
 *
 * Register these on the gateway server so the UI's `request("openrouter.X")`
 * calls reach the shared AgentRuntime.
 */

import { z } from 'zod';
import { getRuntime, type AgentRuntime } from '../agents/runtime.js';

const TextSchema = z.object({
    prompt: z.string(),
    model: z.string().optional(),
    instructions: z.string().optional(),
    temperature: z.number().min(0).max(2).optional(),
    maxOutputTokens: z.number().int().positive().optional(),
});

const ImageSchema = z.object({
    prompt: z.string(),
    model: z.string().optional(),
    aspectRatio: z.enum(['1:1', '4:3', '16:9', '9:16', '3:4']).optional(),
    size: z.string().optional(),
});

const KeySchema = z.object({
    key: z.string().nullable(),
});

const ModelsSchema = z.object({
    modality: z.enum(['text', 'image']).optional(),
    query: z.string().optional(),
});

const SkillToggleSchema = z.object({
    skillKey: z.string(),
    enabled: z.boolean(),
});

export type GatewayHandler = (params: unknown) => Promise<unknown>;

export function createOpenRouterHandlers(
    runtime: AgentRuntime = getRuntime(),
): Record<string, GatewayHandler> {
    return {
        'openrouter.status': async () => ({
            hasKey: runtime.openrouter.hasKey(),
            skills: runtime.skills.list(),
        }),

        'openrouter.setKey': async (raw) => {
            const { key } = KeySchema.parse(raw);
            runtime.openrouter.setUserKey(key);
            return { ok: true, hasKey: runtime.openrouter.hasKey() };
        },

        'openrouter.text': async (raw) => {
            const params = TextSchema.parse(raw);
            const text = await runtime.openrouter.generateText(params.prompt, {
                model: params.model,
                instructions: params.instructions,
                temperature: params.temperature,
                maxTokens: params.maxOutputTokens,
            });
            return { text };
        },

        'openrouter.image': async (raw) => {
            const params = ImageSchema.parse(raw);
            const images = await runtime.openrouter.generateImage(params.prompt, {
                model: params.model,
                aspectRatio: params.aspectRatio,
                size: params.size,
            });
            return { images };
        },

        'openrouter.models': async (raw) => {
            const params = ModelsSchema.parse(raw ?? {});
            const all = await runtime.openrouter.listModels({
                modality: params.modality,
                query: params.query,
            });
            return { models: all.slice(0, 100) };
        },

        'skills.list': async () => ({ skills: runtime.skills.list() }),

        'skills.setEnabled': async (raw) => {
            const { skillKey, enabled } = SkillToggleSchema.parse(raw);
            runtime.skills.setEnabled(skillKey, enabled);
            return { ok: true, skills: runtime.skills.list() };
        },
    };
}
