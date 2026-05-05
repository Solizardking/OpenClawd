import { Honcho } from "@honcho-ai/sdk";
const sessionKey = (c) => `${c.thread}-${c.platform}`;
export class HonchoBridge {
    honcho;
    workspaceId;
    peerCache = new Map();
    sessionCache = new Map();
    constructor(cfg) {
        this.workspaceId = cfg.workspaceId ?? "openclawd";
        this.honcho = new Honcho({
            apiKey: cfg.apiKey,
            workspaceId: this.workspaceId,
            ...(cfg.baseURL ? { baseURL: cfg.baseURL } : {}),
        });
    }
    async owner(ownerId) {
        const k = `owner:${ownerId}`;
        let p = this.peerCache.get(k);
        if (!p) {
            p = await this.honcho.peer(ownerId, {
                configuration: { observeMe: true, observeOthers: false },
            });
            this.peerCache.set(k, p);
        }
        return p;
    }
    async agent(agentId) {
        const k = `agent:${agentId}`;
        let p = this.peerCache.get(k);
        if (!p) {
            p = await this.honcho.peer(agentId, {
                configuration: { observeMe: false, observeOthers: true },
            });
            this.peerCache.set(k, p);
        }
        return p;
    }
    async session(channel, ownerId, agentId) {
        const key = sessionKey(channel);
        let s = this.sessionCache.get(key);
        if (!s) {
            const owner = await this.owner(ownerId);
            const agent = await this.agent(agentId);
            s = await this.honcho.session(key);
            await s.addPeers([
                [owner.id ?? ownerId, { observeMe: true, observeOthers: false }],
                [agent.id ?? agentId, { observeMe: false, observeOthers: true }],
            ]);
            this.sessionCache.set(key, s);
        }
        return s;
    }
    async recordOwnerMessage(m, agentId) {
        const owner = await this.owner(m.ownerId);
        const session = await this.session(m.channel, m.ownerId, agentId);
        await session.addMessages([owner.message(m.content)]);
    }
    async recordAgentMessage(m) {
        const agent = await this.agent(m.agentId);
        const session = await this.session(m.channel, m.ownerId, m.agentId);
        await session.addMessages([agent.message(m.content)]);
    }
    async getContext(channel, ownerId, agentId, opts = {}) {
        const session = await this.session(channel, ownerId, agentId);
        const ctx = await session.context({
            tokens: opts.tokens ?? 2000,
            summary: opts.summary ?? true,
            peerTarget: ownerId,
        });
        const messages = ctx.toOpenAI(await this.agent(agentId));
        return { messages };
    }
    async chatAboutOwner(ownerId, query) {
        const owner = await this.owner(ownerId);
        const r = await owner.chat(query);
        return typeof r === "string" ? r : (r?.content ?? "");
    }
    async listOwnerConclusions(ownerId, opts = {}) {
        const owner = await this.owner(ownerId);
        const list = owner.representation
            ? await owner.representation({
                since: opts.since,
                limit: opts.limit ?? 50,
            })
            : [];
        return list.map(normalizeConclusion).filter(Boolean);
    }
}
function normalizeConclusion(raw) {
    if (!raw)
        return null;
    const content = raw.conclusion ?? raw.content ?? raw.text;
    if (!content)
        return null;
    return {
        id: String(raw.id ?? raw.uuid ?? `${raw.kind ?? "x"}-${raw.created_at ?? Date.now()}`),
        content: String(content),
        kind: (raw.kind ?? raw.type ?? "deductive"),
        createdAt: String(raw.created_at ?? raw.createdAt ?? new Date().toISOString()),
        premises: Array.isArray(raw.premises) ? raw.premises.map(String) : undefined,
    };
}
