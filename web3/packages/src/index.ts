export { AgentRuntime } from "./runtime.ts";
export type { AgentRuntimeOptions } from "./runtime.ts";
export type { EmbeddingGenerationPayload, EmbeddingPriority } from "./types/events.ts";
export { ChannelType, EventType, logger, ModelType, Service } from "./types/index.ts";
export type {
  Action,
  ActionResult,
  Character,
  Content,
  GenerateTextParams,
  HandlerCallback,
  IDatabaseAdapter,
  Memory,
  Plugin,
  Project,
  ProjectAgent,
  Provider,
  ProviderResult,
  RouteRequest,
  RouteResponse,
  State,
  UUID,
} from "./types/index.ts";
export type { AgentRuntime as IAgentRuntime } from "./runtime.ts";
export { stringToUuid } from "./utils.ts";

import { AgentRuntime } from "./runtime.ts";
import type { Character, Memory } from "./types/index.ts";
import { stringToUuid } from "./utils.ts";

export function createMessageMemory(input: Memory): Memory {
  return {
    ...input,
    createdAt: input.createdAt ?? Date.now(),
  };
}

export class OpenClawd {
  private runtimes: AgentRuntime[] = [];

  async addAgents(
    agents: Array<{ character: Character; plugins?: unknown[] }>,
    _options: Record<string, unknown> = {},
  ): Promise<AgentRuntime[]> {
    this.runtimes = agents.map(
      (agent) =>
        new AgentRuntime({
          agentId: stringToUuid(agent.character.name),
          character: agent.character,
          plugins: agent.plugins,
        }),
    );
    return this.runtimes;
  }

  async sendMessage(runtime: AgentRuntime, message: Memory) {
    const responseContent = {
      text: `OpenClawd received: ${message.content.text ?? ""}`,
      actions: [],
      providers: [],
    };
    return {
      processing: {
        mode: "sync",
        responseContent,
      },
    };
  }

  async stopAgents(): Promise<void> {
    await Promise.all(this.runtimes.map((runtime) => runtime.stop()));
    this.runtimes = [];
  }
}
