/**
 * OpenRouter Service — Unified inference, image generation, and model discovery.
 *
 * Wraps @openrouter/agent so every agent/clone gets a single injectable LLM
 * surface: callModel for text + tools, generateImage for images, listModels
 * for catalog discovery. Resolves API key in this order:
 *
 *   1. Explicitly passed `apiKey` (per-call override)
 *   2. Per-user key from PKCE OAuth (set via setUserKey)
 *   3. process.env.OPENROUTER_API_KEY
 */

import { OpenRouter } from '@openrouter/agent';
import { tool } from '@openrouter/agent/tool';
import {
    stepCountIs,
    hasToolCall,
    maxCost,
} from '@openrouter/agent/stop-conditions';
import { z } from 'zod';

export type ModalityFilter = 'text' | 'image' | 'audio';

export interface ImageGenOptions {
    model?: string;
    aspectRatio?: string;
    size?: string;
}

export interface CallOptions {
    model?: string;
    instructions?: string;
    temperature?: number;
    maxOutputTokens?: number;
    tools?: ReturnType<typeof tool>[];
    maxSteps?: number;
    maxCostUsd?: number;
    apiKey?: string;
}

export interface ResolvedModel {
    id: string;
    name: string;
    contextLength: number;
    pricing: { prompt: string; completion: string };
}

const DEFAULT_MODEL = 'anthropic/claude-sonnet-4';
const DEFAULT_IMAGE_MODEL = 'google/gemini-3.1-flash-image-preview';

export class OpenRouterService {
    private userKey: string | null = null;

    constructor(private envKey: string | undefined = process.env.OPENROUTER_API_KEY) {}

    setUserKey(key: string | null): void {
        this.userKey = key;
    }

    hasKey(): boolean {
        return Boolean(this.userKey ?? this.envKey);
    }

    private resolveKey(override?: string): string {
        const key = override ?? this.userKey ?? this.envKey;
        if (!key) {
            throw new Error(
                'OpenRouter API key missing. Set OPENROUTER_API_KEY or sign in via PKCE.',
            );
        }
        return key;
    }

    private clientFor(apiKey?: string): OpenRouter {
        return new OpenRouter({ apiKey: this.resolveKey(apiKey) });
    }

    async generateText(input: string, opts: CallOptions = {}): Promise<string> {
        const client = this.clientFor(opts.apiKey);
        const stopWhen = [
            stepCountIs(opts.maxSteps ?? 10),
            ...(opts.maxCostUsd != null ? [maxCost(opts.maxCostUsd)] : []),
        ];
        const result = client.callModel({
            model: opts.model ?? DEFAULT_MODEL,
            instructions: opts.instructions,
            input,
            temperature: opts.temperature,
            maxOutputTokens: opts.maxOutputTokens,
            tools: opts.tools,
            stopWhen,
        });
        return await result.getText();
    }

    streamText(input: string, opts: CallOptions = {}): AsyncIterable<string> {
        const client = this.clientFor(opts.apiKey);
        const stopWhen = [
            stepCountIs(opts.maxSteps ?? 10),
            ...(opts.maxCostUsd != null ? [maxCost(opts.maxCostUsd)] : []),
        ];
        const result = client.callModel({
            model: opts.model ?? DEFAULT_MODEL,
            instructions: opts.instructions,
            input,
            temperature: opts.temperature,
            maxOutputTokens: opts.maxOutputTokens,
            tools: opts.tools,
            stopWhen,
        });
        return result.getTextStream();
    }

    async generateImage(prompt: string, opts: ImageGenOptions = {}): Promise<string[]> {
        const apiKey = this.resolveKey();
        const body: Record<string, unknown> = {
            model: opts.model ?? DEFAULT_IMAGE_MODEL,
            input: [{ role: 'user', content: prompt }],
            modalities: ['image', 'text'],
        };
        if (opts.aspectRatio) body.aspect_ratio = opts.aspectRatio;
        if (opts.size) body.image_size = opts.size;

        const res = await fetch('https://openrouter.ai/api/v1/responses', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            throw new Error(`OpenRouter image generation failed: ${res.status} ${await res.text()}`);
        }
        const data = await res.json() as {
            output?: Array<{
                content?: Array<{ type: string; image_url?: { url: string }; data?: string }>;
            }>;
        };
        const urls: string[] = [];
        for (const message of data.output ?? []) {
            for (const part of message.content ?? []) {
                if (part.image_url?.url) urls.push(part.image_url.url);
                else if (part.data) urls.push(`data:image/png;base64,${part.data}`);
            }
        }
        return urls;
    }

    async listModels(modality?: ModalityFilter): Promise<ResolvedModel[]> {
        const res = await fetch('https://openrouter.ai/api/v1/models');
        if (!res.ok) throw new Error(`Models fetch failed: ${res.status}`);
        const data = await res.json() as {
            data: Array<{
                id: string;
                name: string;
                context_length: number;
                pricing: { prompt: string; completion: string };
                architecture?: { input_modalities?: string[] };
            }>;
        };
        return data.data
            .filter((m) =>
                !modality || (m.architecture?.input_modalities ?? ['text']).includes(modality),
            )
            .map((m) => ({
                id: m.id,
                name: m.name,
                contextLength: m.context_length,
                pricing: m.pricing,
            }));
    }

    async resolveModel(query: string): Promise<ResolvedModel | null> {
        const all = await this.listModels();
        const q = query.toLowerCase().trim();
        const exact = all.find((m) => m.id.toLowerCase() === q);
        if (exact) return exact;
        const startsWith = all.find((m) => m.id.toLowerCase().startsWith(q));
        if (startsWith) return startsWith;
        const contains = all.find(
            (m) => m.id.toLowerCase().includes(q) || m.name.toLowerCase().includes(q),
        );
        return contains ?? null;
    }
}

export { tool, stepCountIs, hasToolCall, maxCost, z };
