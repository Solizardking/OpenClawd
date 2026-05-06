import { Honcho } from "@honcho-ai/sdk";
import type { Peer, Session } from "@honcho-ai/sdk";
import type {
  AgentTurn,
  AutomatonConfig,
  AutomatonIdentity,
  HonchoMemoryClient,
  HonchoReasoningLevel,
  ToolCallResult,
} from "../types.js";

interface HonchoRuntime {
  client: Honcho;
  user: Peer;
  agent: Peer;
  session: Session;
}

function resolveHonchoApiKey(config: AutomatonConfig): string {
  return (config.honchoApiKey || process.env.HONCHO_API_KEY || "").trim();
}

function cleanId(value: string, fallback: string): string {
  const cleaned = value
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160);
  return cleaned || fallback;
}

function compactToolSummary(toolCalls: ToolCallResult[]): string | undefined {
  if (toolCalls.length === 0) return undefined;
  const lines = toolCalls.slice(0, 10).map((call) => {
    const status = call.error ? `error: ${call.error}` : "ok";
    const preview = (call.error || call.result || "").replace(/\s+/g, " ").slice(0, 240);
    return `- ${call.name}: ${status}${preview ? ` | ${preview}` : ""}`;
  });
  return `Tool calls this turn:\n${lines.join("\n")}`;
}

function formatUnknown(value: unknown): string {
  if (typeof value === "string") return value;
  return JSON.stringify(value, null, 2);
}

function formatSessionContext(context: Awaited<ReturnType<Session["context"]>>): string {
  const sections: string[] = [];
  if (context.peerCard?.length) {
    sections.push(`Peer card:\n${context.peerCard.map((item) => `- ${item}`).join("\n")}`);
  }
  if (context.peerRepresentation) {
    sections.push(`Representation:\n${context.peerRepresentation}`);
  }
  if (context.summary?.content) {
    sections.push(`Session summary:\n${context.summary.content}`);
  }
  if (context.messages.length > 0) {
    sections.push(
      `Recent messages:\n${context.messages
        .map((message) => `- ${message.peerId}: ${message.content}`)
        .join("\n")}`,
    );
  }
  return sections.join("\n\n").trim() || "No Honcho context is available yet.";
}

export function isHonchoConfigured(config: AutomatonConfig): boolean {
  return config.honchoEnabled !== false && Boolean(resolveHonchoApiKey(config));
}

export async function createHonchoMemory(
  config: AutomatonConfig,
  identity: AutomatonIdentity,
): Promise<HonchoMemoryClient | undefined> {
  if (!isHonchoConfigured(config)) return undefined;

  const workspaceId = cleanId(
    config.honchoWorkspaceId || `openclawd-${config.name}`,
    "openclawd-automaton",
  );
  const userPeerId = cleanId(
    config.honchoUserPeerId || `creator-${identity.creatorAddress}`,
    "creator",
  );
  const agentPeerId = cleanId(
    config.honchoAgentPeerId || `agent-${identity.address}`,
    "agent",
  );
  const sessionId = cleanId(
    config.honchoSessionId || `automaton-${identity.address}`,
    "automaton-session",
  );

  const client = new Honcho({
    apiKey: resolveHonchoApiKey(config),
    workspaceId,
    ...(config.honchoEnvironment ? { environment: config.honchoEnvironment } : {}),
    ...(config.honchoBaseUrl ? { baseURL: config.honchoBaseUrl } : {}),
  });

  let runtimePromise: Promise<HonchoRuntime> | undefined;

  async function runtime(): Promise<HonchoRuntime> {
    if (!runtimePromise) {
      runtimePromise = (async () => {
        const [user, agent, session] = await Promise.all([
          client.peer(userPeerId, {
            metadata: { role: "creator", address: identity.creatorAddress },
            configuration: { observeMe: true },
          }),
          client.peer(agentPeerId, {
            metadata: { role: "automaton", address: identity.address, name: identity.name },
            configuration: { observeMe: false },
          }),
          client.session(sessionId, {
            metadata: {
              automaton: identity.name,
              address: identity.address,
              sandboxId: identity.sandboxId,
            },
          }),
        ]);
        await session.addPeers([user, agent]);
        return { client, user, agent, session };
      })();
    }
    return runtimePromise;
  }

  return {
    enabled: true,
    workspaceId,
    userPeerId,
    agentPeerId,
    sessionId,
    async rememberTurn(turn) {
      const { user, agent, session } = await runtime();
      const messages = [];
      if (
        turn.input &&
        (turn.inputSource === "creator" || turn.inputSource === "agent")
      ) {
        messages.push(
          user.message(turn.input, {
            metadata: {
              turnId: turn.id,
              source: turn.inputSource,
              state: turn.state,
            },
            createdAt: turn.timestamp,
          }),
        );
      }

      const thinking = turn.thinking.trim();
      if (thinking) {
        messages.push(
          agent.message(thinking.slice(0, 8000), {
            metadata: { turnId: turn.id, source: "thinking", state: turn.state },
            createdAt: turn.timestamp,
          }),
        );
      }

      const toolSummary = compactToolSummary(turn.toolCalls);
      if (toolSummary) {
        messages.push(
          agent.message(toolSummary, {
            metadata: { turnId: turn.id, source: "tool-summary", state: turn.state },
            configuration: { reasoning: { enabled: false } },
            createdAt: turn.timestamp,
          }),
        );
      }

      if (messages.length > 0) {
        await session.addMessages(messages);
      }
    },
    async insight(query, reasoningLevel: HonchoReasoningLevel = "low") {
      const { user } = await runtime();
      const response = await user.chat(query, { reasoningLevel });
      return response || "Honcho does not have enough relevant memory to answer yet.";
    },
    async context(options) {
      const { session, user } = await runtime();
      const context = await session.context({
        summary: true,
        tokens: options?.tokens,
        peerTarget: user,
        representationOptions: options?.query
          ? { searchQuery: options.query, maxConclusions: 25, includeMostFrequent: true }
          : undefined,
      });
      return formatSessionContext(context);
    },
    async queueStatus() {
      const { client, session } = await runtime();
      const [workspaceStatus, sessionStatus] = await Promise.all([
        client.queueStatus().catch((err) => ({ error: formatUnknown(err) })),
        session.queueStatus().catch((err) => ({ error: formatUnknown(err) })),
      ]);
      return [
        `Workspace queue:\n${JSON.stringify(workspaceStatus, null, 2)}`,
        `Session queue:\n${JSON.stringify(sessionStatus, null, 2)}`,
      ].join("\n\n");
    },
  };
}
