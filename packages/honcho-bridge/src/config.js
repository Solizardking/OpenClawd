/**
 * Unified Honcho configuration for OpenClawd.
 *
 * Reads the canonical HONCHO_* env shape used across the OpenClawd build
 * (gateway, automaton, llm-wiki-tang, services/pump-scanner-cron, clawdhub).
 *
 * All values can be overridden per-call; this loader is just the default.
 *
 * Env vars (canonical names — see .env.example for descriptions):
 *
 *   HONCHO_ENABLED           "true" to opt into the full integration
 *   HONCHO_URL               control-plane base, e.g. https://api.honcho.dev
 *   HONCHO_API_KEY           bearer token (hch-v3-…)
 *   HONCHO_WORKSPACE_ID      default workspace, e.g. "openclawd"
 *   HONCHO_AGENT_PEER_ID     the agent peer used when no peer is named
 *   HONCHO_REASONING_LEVEL   minimal | low | medium | high | max
 *   HONCHO_CONTEXT_TOKENS    default token budget for session.context()
 *   HONCHO_CONTEXT_SUMMARY   include summary in context() (true/false)
 *   HONCHO_SYNC_MESSAGES     auto-mirror agent/owner messages
 *   HONCHO_WEBHOOK_SECRET    primary webhook HMAC secret (default verifier)
 *
 * Per-webhook overrides (multi-channel fan-out):
 *
 *   HONCHO_WEBHOOK1_URL / HONCHO_WEBHOOK1_SECRET / HONCHO_WEBHOOK1_WORKSPACE
 *   HONCHO_WEBHOOK2_URL / HONCHO_WEBHOOK2_SECRET / HONCHO_WEBHOOK2_WORKSPACE
 *   HONCHO_WEBHOOK3_URL / HONCHO_WEBHOOK3_SECRET / HONCHO_WEBHOOK3_WORKSPACE
 *   HONCHO_WEBHOOK4_URL / HONCHO_WEBHOOK4_SECRET / HONCHO_WEBHOOK4_WORKSPACE
 *
 * Legacy aliases (still honored for backwards compat):
 *
 *   HONCHO_WEBHOOK_URL1 / HONCHO_WEBHOOKSECRET1
 */
const DEFAULT_URL = "https://api.honcho.dev";
const DEFAULT_WORKSPACE = "openclawd";
const DEFAULT_AGENT_PEER = "openclawd";
const DEFAULT_REASONING = "low";
const DEFAULT_CONTEXT_TOKENS = 4000;
function envBool(name, fallback) {
    const raw = process.env[name];
    if (raw === undefined || raw === "")
        return fallback;
    return /^(1|true|yes|on)$/i.test(raw.trim());
}
function envInt(name, fallback) {
    const raw = process.env[name];
    if (!raw)
        return fallback;
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : fallback;
}
function envReasoning(name, fallback) {
    const raw = process.env[name]?.toLowerCase().trim();
    switch (raw) {
        case "minimal":
        case "low":
        case "medium":
        case "high":
        case "max":
            return raw;
        default:
            return fallback;
    }
}
/** Load a single webhook entry with the canonical + legacy variable shapes. */
function loadWebhook(i) {
    const url = process.env[`HONCHO_WEBHOOK${i}_URL`] ||
        process.env[`HONCHO_WEBHOOK_URL${i}`] || // legacy
        "";
    const secret = process.env[`HONCHO_WEBHOOK${i}_SECRET`] ||
        process.env[`HONCHO_WEBHOOKSECRET${i}`] || // legacy (no underscore)
        process.env[`HONCHO_WEBHOOK_URL${i}_SECRET`] || // legacy
        "";
    const workspace = process.env[`HONCHO_WEBHOOK${i}_WORKSPACE`] || undefined;
    if (!url)
        return null;
    return { index: i, url, secret, workspace };
}
/**
 * Load the canonical OpenClawd Honcho configuration from `process.env`.
 * Returns a complete config object — callers should check `enabled` before acting.
 */
export function loadHonchoConfig(overrides = {}) {
    const apiKey = overrides.apiKey ?? process.env.HONCHO_API_KEY ?? "";
    const enabled = overrides.enabled ??
        (envBool("HONCHO_ENABLED", true) && apiKey.length > 0);
    return {
        enabled,
        url: overrides.url ?? process.env.HONCHO_URL ?? DEFAULT_URL,
        apiKey,
        workspaceId: overrides.workspaceId ??
            process.env.HONCHO_WORKSPACE_ID ??
            DEFAULT_WORKSPACE,
        agentPeerId: overrides.agentPeerId ??
            process.env.HONCHO_AGENT_PEER_ID ??
            DEFAULT_AGENT_PEER,
        reasoningLevel: overrides.reasoningLevel ??
            envReasoning("HONCHO_REASONING_LEVEL", DEFAULT_REASONING),
        contextTokens: overrides.contextTokens ??
            envInt("HONCHO_CONTEXT_TOKENS", DEFAULT_CONTEXT_TOKENS),
        contextSummary: overrides.contextSummary ?? envBool("HONCHO_CONTEXT_SUMMARY", true),
        syncMessages: overrides.syncMessages ?? envBool("HONCHO_SYNC_MESSAGES", true),
        webhookSecret: overrides.webhookSecret ?? process.env.HONCHO_WEBHOOK_SECRET ?? "",
        webhooks: overrides.webhooks ??
            [1, 2, 3, 4]
                .map(loadWebhook)
                .filter((w) => w !== null),
    };
}
/**
 * Throw a friendly error if the config is missing things actually required to
 * talk to Honcho. Use at startup of any Honcho-dependent service.
 */
export function assertHonchoUsable(cfg) {
    if (!cfg.enabled) {
        throw new Error("Honcho is disabled. Set HONCHO_ENABLED=true and HONCHO_API_KEY to enable.");
    }
    if (!cfg.apiKey) {
        throw new Error("HONCHO_API_KEY is not set. Get one at https://app.honcho.dev (free $100 credits).");
    }
    if (!cfg.workspaceId) {
        throw new Error("HONCHO_WORKSPACE_ID is empty.");
    }
}
/** Find a webhook entry by workspace name, falling back to the default. */
export function pickWebhookForWorkspace(cfg, workspaceId) {
    const exact = cfg.webhooks.find((w) => w.workspace === workspaceId);
    if (exact)
        return exact;
    return cfg.webhooks[0] ?? null;
}
