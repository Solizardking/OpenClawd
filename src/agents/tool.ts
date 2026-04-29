/**
 * Local `tool()` shim — drop-in for `@openrouter/agent/tool`.
 *
 * Mirrors the surface skill-registry.ts uses: a typed builder that
 * binds a name/description/Zod schema to an execute function so the
 * agent runtime can register skills without importing the whole
 * @openrouter/agent SDK at the repo root.
 */

import type { ZodTypeAny, z } from 'zod'

export interface ToolDefinition<S extends ZodTypeAny, R = unknown> {
  name: string
  description: string
  inputSchema: S
  execute: (args: z.infer<S>) => R | Promise<R>
}

export interface Tool<S extends ZodTypeAny = ZodTypeAny, R = unknown> {
  name: string
  description: string
  inputSchema: S
  execute: (args: z.infer<S>) => Promise<R>
}

export function tool<S extends ZodTypeAny, R>(def: ToolDefinition<S, R>): Tool<S, R> {
  return {
    name: def.name,
    description: def.description,
    inputSchema: def.inputSchema,
    execute: async (args: z.infer<S>) => def.execute(args),
  }
}
