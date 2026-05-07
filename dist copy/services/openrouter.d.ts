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
import { tool } from '@openrouter/agent/tool';
import { stepCountIs, hasToolCall, maxCost } from '@openrouter/agent/stop-conditions';
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
    pricing: {
        prompt: string;
        completion: string;
    };
}
export declare class OpenRouterService {
    private envKey;
    private userKey;
    constructor(envKey?: string | undefined);
    setUserKey(key: string | null): void;
    hasKey(): boolean;
    private resolveKey;
    private clientFor;
    generateText(input: string, opts?: CallOptions): Promise<string>;
    streamText(input: string, opts?: CallOptions): AsyncIterable<string>;
    generateImage(prompt: string, opts?: ImageGenOptions): Promise<string[]>;
    listModels(modality?: ModalityFilter): Promise<ResolvedModel[]>;
    resolveModel(query: string): Promise<ResolvedModel | null>;
}
export { tool, stepCountIs, hasToolCall, maxCost, z };
//# sourceMappingURL=openrouter.d.ts.map