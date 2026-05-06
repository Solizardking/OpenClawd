import { describe, expect, it, vi } from "vitest";
import { createBuiltinTools, executeTool } from "../agent/tools.js";
import type { HonchoMemoryClient } from "../types.js";
import {
  MockConwayClient,
  MockInferenceClient,
  createTestConfig,
  createTestDb,
  createTestIdentity,
} from "./mocks.js";

describe("Honcho memory tools", () => {
  it("reports when Honcho is not configured", async () => {
    const db = createTestDb();
    const tools = createBuiltinTools("test-sandbox-id");
    const result = await executeTool(
      "honcho_insight",
      { query: "What should I know about the creator?" },
      tools,
      {
        identity: createTestIdentity(),
        config: createTestConfig(),
        db,
        conway: new MockConwayClient(),
        inference: new MockInferenceClient(),
      },
    );

    expect(result.error).toBeUndefined();
    expect(result.result).toContain("Honcho memory is not configured");
    db.close();
  });

  it("delegates insight queries to the configured Honcho client", async () => {
    const db = createTestDb();
    const honcho: HonchoMemoryClient = {
      enabled: true,
      workspaceId: "test-workspace",
      userPeerId: "creator",
      agentPeerId: "agent",
      sessionId: "session",
      rememberTurn: vi.fn(),
      insight: vi.fn().mockResolvedValue("The creator prefers concise status updates."),
      context: vi.fn(),
      queueStatus: vi.fn(),
    };
    const tools = createBuiltinTools("test-sandbox-id");
    const result = await executeTool(
      "honcho_insight",
      {
        query: "What communication style does the creator prefer?",
        reasoning_level: "high",
      },
      tools,
      {
        identity: createTestIdentity(),
        config: createTestConfig(),
        db,
        conway: new MockConwayClient(),
        inference: new MockInferenceClient(),
        honcho,
      },
    );

    expect(result.error).toBeUndefined();
    expect(result.result).toBe("The creator prefers concise status updates.");
    expect(honcho.insight).toHaveBeenCalledWith(
      "What communication style does the creator prefer?",
      "high",
    );
    db.close();
  });
});
