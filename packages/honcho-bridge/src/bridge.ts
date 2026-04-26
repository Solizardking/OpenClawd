import { Honcho } from "@honcho-ai/sdk";

export interface ChannelKey {
  thread: string;
  platform: "x" | "telegram" | "discord" | "slack" | "web" | string;
}

export interface OwnerMessage {
  ownerId: string;
  content: string;
  channel: ChannelKey;
}

export interface AgentMessage {
  agentId: string;
  ownerId: string;
  content: string;
  channel: ChannelKey;
}

export interface HonchoBridgeConfig {
  apiKey: string;
  workspaceId?: string;
  baseURL?: string;
}

const sessionKey = (c: ChannelKey) => `${c.thread}-${c.platform}`;

export class HonchoBridge {
  private honcho: Honcho;
  private workspaceId: string;
  private peerCache = new Map<string, unknown>();
  private sessionCache = new Map<string, unknown>();

  constructor(cfg: HonchoBridgeConfig) {
    this.workspaceId = cfg.workspaceId ?? "openclawd";
    this.honcho = new Honcho({
      apiKey: cfg.apiKey,
      workspaceId: this.workspaceId,
      ...(cfg.baseURL ? { baseURL: cfg.baseURL } : {}),
    } as ConstructorParameters<typeof Honcho>[0]);
  }

  private async owner(ownerId: string) {
    const k = `owner:${ownerId}`;
    let p = this.peerCache.get(k);
    if (!p) {
      p = await (this.honcho as any).peer(ownerId, {
        configuration: { observeMe: true, observeOthers: false },
      });
      this.peerCache.set(k, p);
    }
    return p as any;
  }

  private async agent(agentId: string) {
    const k = `agent:${agentId}`;
    let p = this.peerCache.get(k);
    if (!p) {
      p = await (this.honcho as any).peer(agentId, {
        configuration: { observeMe: false, observeOthers: true },
      });
      this.peerCache.set(k, p);
    }
    return p as any;
  }

  private async session(channel: ChannelKey, ownerId: string, agentId: string) {
    const key = sessionKey(channel);
    let s = this.sessionCache.get(key);
    if (!s) {
      const owner = await this.owner(ownerId);
      const agent = await this.agent(agentId);
      s = await (this.honcho as any).session(key);
      await (s as any).addPeers([
        [owner.id ?? ownerId, { observeMe: true, observeOthers: false }],
        [agent.id ?? agentId, { observeMe: false, observeOthers: true }],
      ]);
      this.sessionCache.set(key, s);
    }
    return s as any;
  }

  async recordOwnerMessage(m: OwnerMessage, agentId: string): Promise<void> {
    const owner = await this.owner(m.ownerId);
    const session = await this.session(m.channel, m.ownerId, agentId);
    await session.addMessages([owner.message(m.content)]);
  }

  async recordAgentMessage(m: AgentMessage): Promise<void> {
    const agent = await this.agent(m.agentId);
    const session = await this.session(m.channel, m.ownerId, m.agentId);
    await session.addMessages([agent.message(m.content)]);
  }

  async getContext(
    channel: ChannelKey,
    ownerId: string,
    agentId: string,
    opts: { tokens?: number; summary?: boolean } = {},
  ): Promise<{ messages: Array<{ role: string; content: string }> }> {
    const session = await this.session(channel, ownerId, agentId);
    const ctx = await session.context({
      tokens: opts.tokens ?? 2000,
      summary: opts.summary ?? true,
      peerTarget: ownerId,
    });
    const messages = ctx.toOpenAI(await this.agent(agentId));
    return { messages };
  }

  async chatAboutOwner(ownerId: string, query: string): Promise<string> {
    const owner = await this.owner(ownerId);
    const r = await owner.chat(query);
    return typeof r === "string" ? r : (r?.content ?? "");
  }

  async listOwnerConclusions(
    ownerId: string,
    opts: { since?: Date; limit?: number } = {},
  ): Promise<Conclusion[]> {
    const owner = await this.owner(ownerId);
    const list = (owner as any).representation
      ? await (owner as any).representation({
          since: opts.since,
          limit: opts.limit ?? 50,
        })
      : [];
    return (list as any[]).map(normalizeConclusion).filter(Boolean) as Conclusion[];
  }
}

export interface Conclusion {
  id: string;
  content: string;
  kind: "deductive" | "inductive" | "abductive" | "explicit" | "summary";
  createdAt: string;
  premises?: string[];
}

function normalizeConclusion(raw: any): Conclusion | null {
  if (!raw) return null;
  const content = raw.conclusion ?? raw.content ?? raw.text;
  if (!content) return null;
  return {
    id: String(raw.id ?? raw.uuid ?? `${raw.kind ?? "x"}-${raw.created_at ?? Date.now()}`),
    content: String(content),
    kind: (raw.kind ?? raw.type ?? "deductive") as Conclusion["kind"],
    createdAt: String(raw.created_at ?? raw.createdAt ?? new Date().toISOString()),
    premises: Array.isArray(raw.premises) ? raw.premises.map(String) : undefined,
  };
}
