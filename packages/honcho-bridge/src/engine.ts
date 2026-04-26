import { HonchoBridge, type ChannelKey } from "./bridge.js";

export interface HonchoEngine {
  remember(input: {
    ownerId: string;
    agentId: string;
    role: "owner" | "agent";
    content: string;
    channel: ChannelKey;
  }): Promise<void>;

  contextFor(input: {
    ownerId: string;
    agentId: string;
    channel: ChannelKey;
    tokens?: number;
  }): Promise<Array<{ role: string; content: string }>>;

  describe(ownerId: string, query: string): Promise<string>;
}

export interface CreateEngineConfig {
  apiKey?: string;
  workspaceId?: string;
  baseURL?: string;
  bridge?: HonchoBridge;
}

export function createHonchoEngine(cfg: CreateEngineConfig = {}): HonchoEngine {
  const apiKey = cfg.apiKey ?? process.env.HONCHO_API_KEY;
  if (!cfg.bridge && !apiKey) {
    throw new Error(
      "HONCHO_API_KEY not set. Get one at https://app.honcho.dev or pass apiKey/bridge.",
    );
  }
  const bridge =
    cfg.bridge ??
    new HonchoBridge({
      apiKey: apiKey!,
      workspaceId: cfg.workspaceId ?? process.env.HONCHO_WORKSPACE_ID ?? "openclawd",
      baseURL: cfg.baseURL,
    });

  return {
    async remember({ ownerId, agentId, role, content, channel }) {
      if (role === "owner") {
        await bridge.recordOwnerMessage({ ownerId, content, channel }, agentId);
      } else {
        await bridge.recordAgentMessage({ agentId, ownerId, content, channel });
      }
    },
    async contextFor({ ownerId, agentId, channel, tokens }) {
      const { messages } = await bridge.getContext(channel, ownerId, agentId, { tokens });
      return messages;
    },
    async describe(ownerId, query) {
      return bridge.chatAboutOwner(ownerId, query);
    },
  };
}
