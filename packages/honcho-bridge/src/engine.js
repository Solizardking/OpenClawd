import { HonchoBridge } from "./bridge.js";
import { loadHonchoConfig, } from "./config.js";
/**
 * Create an opinionated HonchoEngine that respects the canonical
 * OpenClawd HONCHO_* env shape. Pass overrides for tests.
 *
 * If `HONCHO_ENABLED=false` (or HONCHO_API_KEY is missing), the returned
 * engine is a no-op that returns empty results — callers don't have to
 * branch on availability.
 */
export function createHonchoEngine(cfg = {}) {
    const config = loadHonchoConfig({
        apiKey: cfg.apiKey,
        workspaceId: cfg.workspaceId,
        url: cfg.baseURL,
        agentPeerId: cfg.agentPeerId,
    });
    if (!config.enabled || !config.apiKey) {
        return makeNoopEngine(config);
    }
    const bridge = cfg.bridge ??
        new HonchoBridge({
            apiKey: config.apiKey,
            workspaceId: config.workspaceId,
            baseURL: config.url,
        });
    return {
        enabled: true,
        config,
        reasoningLevel: () => config.reasoningLevel,
        async remember({ ownerId, agentId, role, content, channel }) {
            const agent = agentId ?? config.agentPeerId;
            if (!config.syncMessages)
                return;
            if (role === "owner") {
                await bridge.recordOwnerMessage({ ownerId, content, channel }, agent);
            }
            else {
                await bridge.recordAgentMessage({ agentId: agent, ownerId, content, channel });
            }
        },
        async contextFor({ ownerId, agentId, channel, tokens, summary }) {
            const agent = agentId ?? config.agentPeerId;
            const { messages } = await bridge.getContext(channel, ownerId, agent, {
                tokens: tokens ?? config.contextTokens,
                summary: summary ?? config.contextSummary,
            });
            return messages;
        },
        async describe(ownerId, query) {
            return bridge.chatAboutOwner(ownerId, query);
        },
    };
}
function makeNoopEngine(config) {
    return {
        enabled: false,
        config,
        reasoningLevel: () => config.reasoningLevel,
        async remember() {
            /* noop when disabled */
        },
        async contextFor() {
            return [];
        },
        async describe() {
            return "";
        },
    };
}
