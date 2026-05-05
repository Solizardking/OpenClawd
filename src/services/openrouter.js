/**
 * OpenRouterService — single injection point for LLM inference.
 *
 * Every clone receives a shared instance via AgentRuntime so no agent has
 * to wire its own client. Reads OPENROUTER_API_KEY from env by default;
 * supports per-user PKCE keys via setUserKey() for browser-signed-in flows.
 */
const DEFAULT_TEXT_MODEL = 'anthropic/claude-sonnet-4';
const DEFAULT_IMAGE_MODEL = 'google/gemini-3.1-flash-image-preview';
const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';
export class OpenRouterService {
    envKey;
    userKey = null;
    constructor() {
        this.envKey = process.env.OPENROUTER_API_KEY ?? '';
    }
    hasKey() {
        return Boolean(this.userKey || this.envKey);
    }
    setUserKey(key) {
        this.userKey = key && key.trim() ? key.trim() : null;
    }
    requireKey() {
        const key = this.userKey || this.envKey;
        if (!key) {
            throw new Error('OpenRouter key not set. Either export OPENROUTER_API_KEY or call openrouter.setUserKey(key).');
        }
        return key;
    }
    async generateText(prompt, opts = {}) {
        const key = this.requireKey();
        const messages = [];
        if (opts.instructions)
            messages.push({ role: 'system', content: opts.instructions });
        messages.push({ role: 'user', content: prompt });
        const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                authorization: `Bearer ${key}`,
                'http-referer': 'https://solanaclawd.com',
                'x-title': 'OpenClawd',
            },
            body: JSON.stringify({
                model: opts.model ?? DEFAULT_TEXT_MODEL,
                messages,
                temperature: opts.temperature,
                max_tokens: opts.maxTokens,
                tools: opts.tools,
            }),
        });
        if (!res.ok) {
            const body = await res.text().catch(() => '');
            throw new Error(`OpenRouter ${res.status}: ${body.slice(0, 200)}`);
        }
        const json = (await res.json());
        if (json.error)
            throw new Error(json.error.message ?? 'OpenRouter error');
        return json.choices?.[0]?.message?.content ?? '';
    }
    async generateImage(prompt, opts = {}) {
        const key = this.requireKey();
        const res = await fetch(`${OPENROUTER_BASE}/images/generations`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                authorization: `Bearer ${key}`,
                'http-referer': 'https://solanaclawd.com',
                'x-title': 'OpenClawd',
            },
            body: JSON.stringify({
                model: opts.model ?? DEFAULT_IMAGE_MODEL,
                prompt,
                size: opts.size ?? aspectRatioToSize(opts.aspectRatio ?? '1:1'),
                n: 1,
            }),
        });
        if (!res.ok) {
            const body = await res.text().catch(() => '');
            throw new Error(`OpenRouter ${res.status}: ${body.slice(0, 200)}`);
        }
        const json = (await res.json());
        if (json.error)
            throw new Error(json.error.message ?? 'OpenRouter error');
        return (json.data ?? [])
            .map((d) => d.url ?? (d.b64_json ? `data:image/png;base64,${d.b64_json}` : ''))
            .filter(Boolean);
    }
    async listModels(opts = {}) {
        const key = this.requireKey();
        const res = await fetch(`${OPENROUTER_BASE}/models`, {
            headers: { authorization: `Bearer ${key}` },
        });
        if (!res.ok)
            throw new Error(`OpenRouter ${res.status}: ${await res.text().catch(() => '')}`);
        const json = (await res.json());
        let models = json.data ?? [];
        if (opts.modality === 'image') {
            models = models.filter((m) => /image|dall|gemini.*image|midjourney|flux/i.test(m.id));
        }
        if (opts.query) {
            const q = opts.query.toLowerCase();
            models = models.filter((m) => m.id.toLowerCase().includes(q) ||
                m.name?.toLowerCase().includes(q) ||
                m.description?.toLowerCase().includes(q));
        }
        return models;
    }
}
function aspectRatioToSize(ratio) {
    switch (ratio) {
        case '1:1':
            return '1024x1024';
        case '4:3':
            return '1024x768';
        case '16:9':
            return '1792x1024';
        case '9:16':
            return '1024x1792';
        case '3:4':
            return '768x1024';
        default:
            return '1024x1024';
    }
}
