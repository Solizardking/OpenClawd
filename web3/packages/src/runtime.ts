import type { EmbeddingPriority } from "./types/events.ts";
import { EventType, type Character, type Content, type IDatabaseAdapter, type Memory, type UUID } from "./types/index.ts";

export type AgentRuntimeOptions = {
  agentId?: UUID;
  character: Character;
  adapter?: unknown;
  conversationLength?: number;
  plugins?: unknown[];
  settings?: Record<string, unknown>;
};

export class AgentRuntime {
  agentId: UUID;
  character: Character;
  adapter: unknown;
  conversationLength: number;
  plugins: unknown[];
  settings: Record<string, unknown>;
  messageService: {
    handleMessage: (
      runtime: AgentRuntime,
      message: Memory,
      callback: (content: Content) => Promise<Memory[]>,
    ) => Promise<{ responseContent?: Content }>;
  };

  constructor(options: AgentRuntimeOptions) {
    this.agentId = options.agentId ?? (`agent-${options.character.name}` as UUID);
    this.character = options.character;
    this.adapter = options.adapter;
    this.conversationLength = options.conversationLength ?? 32;
    this.plugins = options.plugins ?? [];
    this.settings = options.settings ?? {};
    this.messageService = {
      handleMessage: async (_runtime, message, callback) => {
        const text = `OpenClawd received: ${message.content.text ?? ""}`;
        const content = { text };
        await callback(content);
        return { responseContent: content };
      },
    };
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

  registerDatabaseAdapter(adapter: IDatabaseAdapter): void {
    this.adapter = adapter;
  }

  async initialize(): Promise<void> {
    if (this.adapter && typeof (this.adapter as IDatabaseAdapter).init === "function") {
      await (this.adapter as IDatabaseAdapter).init?.();
    }
  }

  async stop(): Promise<void> {
    if (this.adapter && typeof (this.adapter as IDatabaseAdapter).close === "function") {
      await (this.adapter as IDatabaseAdapter).close?.();
    }
  }

  async ensureConnection(_connection: Record<string, unknown>): Promise<void> {
    // The embedded Web3 examples use an in-memory runtime, so no remote connection is required.
  }

  async generateText(prompt: string, options: Record<string, unknown> = {}): Promise<{ text: string }> {
    const modelResult = await this.useModel("TEXT_LARGE", { prompt, ...options }).catch(() => null);
    if (typeof modelResult === "string") {
      return { text: modelResult };
    }
    return { text: `${this.character.name}: ${prompt}` };
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
