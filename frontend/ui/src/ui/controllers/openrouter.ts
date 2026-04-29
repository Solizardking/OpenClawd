/**
 * OpenRouter UI controller — bridges Sign In with OpenRouter (PKCE) and the
 * gateway. Stores the user's API key in localStorage (browser-managed) and
 * pushes it to the gateway so server-side agents can use it. Falls back to
 * the server-side env key when no user key is present.
 */

import type { GatewayBrowserClient } from '../gateway';
import {
    clearApiKey as clearLocalKey,
    consumeOAuthCallbackFromUrl,
    getApiKey,
    onAuthChange,
    setApiKey,
} from '../openrouter-auth';

export interface OpenRouterModelView {
    id: string;
    name: string;
    contextLength: number;
    pricing?: { prompt: string; completion: string };
}

export interface OpenRouterState {
    client: GatewayBrowserClient | null;
    connected: boolean;
    hasUserKey: boolean;
    hasServerKey: boolean;
    models: OpenRouterModelView[];
    busy: boolean;
    error: string | null;
}

function getError(err: unknown): string {
    return err instanceof Error ? err.message : String(err);
}

export function createOpenRouterState(): OpenRouterState {
    return {
        client: null,
        connected: false,
        hasUserKey: Boolean(getApiKey()),
        hasServerKey: false,
        models: [],
        busy: false,
        error: null,
    };
}

export function bindOpenRouterAuth(state: OpenRouterState, onChange: () => void): () => void {
    const off = onAuthChange(() => {
        state.hasUserKey = Boolean(getApiKey());
        void pushKeyToGateway(state).then(onChange);
    });
    return off;
}

export async function bootstrapOpenRouter(
    state: OpenRouterState,
    onChange: () => void,
): Promise<void> {
    try {
        const consumed = await consumeOAuthCallbackFromUrl();
        if (consumed) state.hasUserKey = Boolean(getApiKey());
    } catch (err) {
        state.error = getError(err);
    }
    await refreshOpenRouterStatus(state);
    await pushKeyToGateway(state);
    onChange();
}

export async function refreshOpenRouterStatus(state: OpenRouterState): Promise<void> {
    if (!state.client || !state.connected) return;
    state.busy = true;
    state.error = null;
    try {
        const status = await state.client.request<{ hasKey: boolean }>('openrouter.status', {});
        state.hasServerKey = Boolean(status.hasKey);
    } catch (err) {
        state.error = getError(err);
    } finally {
        state.busy = false;
    }
}

async function pushKeyToGateway(state: OpenRouterState): Promise<void> {
    if (!state.client || !state.connected) return;
    try {
        const key = getApiKey();
        await state.client.request('openrouter.setKey', { key });
        await refreshOpenRouterStatus(state);
    } catch (err) {
        state.error = getError(err);
    }
}

export async function loadOpenRouterModels(
    state: OpenRouterState,
    modality?: 'text' | 'image' | 'audio',
): Promise<void> {
    if (!state.client || !state.connected) return;
    state.busy = true;
    try {
        const res = await state.client.request<{ models: OpenRouterModelView[] }>(
            'openrouter.models',
            { modality },
        );
        state.models = res.models;
    } catch (err) {
        state.error = getError(err);
    } finally {
        state.busy = false;
    }
}

export async function generateText(
    state: OpenRouterState,
    prompt: string,
    opts: { model?: string; instructions?: string } = {},
): Promise<string> {
    if (!state.client || !state.connected) throw new Error('Gateway not connected');
    const res = await state.client.request<{ text: string }>('openrouter.text', {
        prompt,
        ...opts,
    });
    return res.text;
}

export async function generateImage(
    state: OpenRouterState,
    prompt: string,
    opts: { model?: string; aspectRatio?: string } = {},
): Promise<string[]> {
    if (!state.client || !state.connected) throw new Error('Gateway not connected');
    const res = await state.client.request<{ images: string[] }>('openrouter.image', {
        prompt,
        ...opts,
    });
    return res.images;
}

export function signOut(): void {
    clearLocalKey();
}

export function applyExternalKey(key: string): void {
    setApiKey(key);
}
