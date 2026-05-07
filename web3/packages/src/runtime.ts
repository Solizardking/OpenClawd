import type { EmbeddingPriority } from "./types/events.ts";
import { EventType, type Character, type Memory, type UUID } from "./types/index.ts";

export type AgentRuntimeOptions = {
  agentId: UUID;
  character: Character;
  adapter?: unknown;
  conversationLength?: number;
};

export class AgentRuntime {
  agentId: UUID;
  character: Character;
  adapter: unknown;
  conversationLength: number;

  constructor(options: AgentRuntimeOptions) {
    this.agentId = options.agentId;
    this.character = options.character;
    this.adapter = options.adapter;
    this.conversationLength = options.conversationLength ?? 32;
  }

  async emitEvent(_event: string | string[], _payload: unknown): Promise<void> {
    // Event transport is supplied by callers/tests in this lightweight Web3 package.
  }

  async useModel(_modelType: string, _params?: unknown): Promise<unknown> {
    throw new Error("No model provider configured");
  }

  async addEmbeddingToMemory(memory: Memory): Promise<Memory> {
    const embedding = await this.useModel("TEXT_EMBEDDING", {
      text: memory.content?.text,
      memory,
    });

    return {
      ...memory,
      embedding: Array.isArray(embedding) ? (embedding as number[]) : undefined,
    };
  }

  async queueEmbeddingGeneration(
    memory: Memory | null | undefined,
    priority: EmbeddingPriority = "normal",
  ): Promise<void> {
    if (!memory?.content?.text || memory.embedding) {
      return;
    }

    await this.emitEvent(EventType.EMBEDDING_GENERATION_REQUESTED, {
      runtime: this,
      memory,
      priority,
      source: "runtime",
      retryCount: 0,
      maxRetries: 3,
    });
  }
}
