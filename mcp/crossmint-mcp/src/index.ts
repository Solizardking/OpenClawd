#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z, ZodTypeAny } from "zod";
import {
  CrossmintAgentWallet,
  TOOL_DEFINITIONS,
} from "@openclawdsolana/crossmint-agentic-wallet";

const apiKey = process.env.CROSSMINT_SERVERSIDE_API_KEY;
if (!apiKey) {
  console.error(
    "[crossmint-mcp] CROSSMINT_SERVERSIDE_API_KEY is not set. " +
      "Get one at https://crossmint.com/console (sk_staging_* or sk_production_*).",
  );
  process.exit(1);
}

const wallet = new CrossmintAgentWallet(apiKey);

const server = new McpServer({
  name: "crossmint-mcp",
  version: "1.0.0",
});

// Minimal JSON-Schema → Zod converter for the subset used by TOOL_DEFINITIONS.
// The package only emits `string` (with optional enum), `number`, `array`, and `object`.
type JsonSchemaProp = {
  type?: string;
  description?: string;
  enum?: string[];
  default?: unknown;
  items?: JsonSchemaProp;
};

function propToZod(prop: JsonSchemaProp): ZodTypeAny {
  switch (prop.type) {
    case "string": {
      const base = prop.enum && prop.enum.length > 0
        ? z.enum(prop.enum as [string, ...string[]])
        : z.string();
      return prop.description ? base.describe(prop.description) : base;
    }
    case "number":
      return prop.description ? z.number().describe(prop.description) : z.number();
    case "boolean":
      return prop.description ? z.boolean().describe(prop.description) : z.boolean();
    case "array": {
      const inner = prop.items ? propToZod(prop.items) : z.unknown();
      return prop.description ? z.array(inner).describe(prop.description) : z.array(inner);
    }
    default:
      return prop.description ? z.unknown().describe(prop.description) : z.unknown();
  }
}

function buildShape(parameters: {
  properties: Record<string, JsonSchemaProp>;
  required?: string[];
}): Record<string, ZodTypeAny> {
  const required = new Set(parameters.required ?? []);
  const shape: Record<string, ZodTypeAny> = {};
  for (const [key, prop] of Object.entries(parameters.properties)) {
    const zodProp = propToZod(prop);
    shape[key] = required.has(key) ? zodProp : zodProp.optional();
  }
  return shape;
}

for (const [toolName, def] of Object.entries(TOOL_DEFINITIONS)) {
  const shape = buildShape(def.parameters as never);
  server.tool(toolName, def.description, shape, async (params) => {
    const result = await wallet.executeTool(toolName, params as Record<string, unknown>);
    return {
      content: [
        { type: "text", text: JSON.stringify(result, null, 2) },
      ],
      isError: !result.success,
    };
  });
}

const transport = new StdioServerTransport();
await server.connect(transport);
console.error(`[crossmint-mcp] ready — ${Object.keys(TOOL_DEFINITIONS).length} tools registered`);
