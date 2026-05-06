import { afterEach, describe, expect, it, vi } from "vitest";
import { createBuiltinTools, executeTool } from "../agent/tools.js";
import {
  MockConwayClient,
  MockInferenceClient,
  createTestConfig,
  createTestDb,
  createTestIdentity,
} from "./mocks.js";

describe("Parallel Search tool", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls Parallel Search and formats excerpts", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        search_id: "search_test",
        session_id: "session_test",
        warnings: null,
        usage: [{ name: "sku_search", count: 1 }],
        results: [
          {
            title: "Parallel Search API",
            url: "https://parallel.ai/products/search",
            publish_date: null,
            excerpts: ["Parallel Search returns excerpts optimized for agents."],
          },
        ],
      }),
    } as Response);

    const db = createTestDb();
    const tools = createBuiltinTools("test-sandbox-id");
    const result = await executeTool(
      "search_web",
      {
        objective: "Find Parallel Search docs",
        search_queries: ["Parallel Search API"],
        mode: "basic",
        max_results: 1,
      },
      tools,
      {
        identity: createTestIdentity(),
        config: createTestConfig({ parallelApiKey: "test-parallel-key" }),
        db,
        conway: new MockConwayClient(),
        inference: new MockInferenceClient(),
      },
    );

    expect(result.error).toBeUndefined();
    expect(result.result).toContain("Parallel Search API");
    expect(result.result).toContain("https://parallel.ai/products/search");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.parallel.ai/v1/search",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "x-api-key": "test-parallel-key" }),
      }),
    );
    db.close();
  });
});
