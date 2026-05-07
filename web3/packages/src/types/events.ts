import type { Memory } from "./index.ts";

export type EmbeddingPriority = "high" | "normal" | "low";

export type EmbeddingGenerationPayload = {
  runtime: unknown;
  memory: Memory;
  priority: EmbeddingPriority;
  source: "runtime";
  retryCount: number;
  maxRetries: number;
};
