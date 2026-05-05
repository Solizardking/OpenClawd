/**
 * Local `tool()` shim — drop-in for `@openrouter/agent/tool`.
 *
 * Mirrors the surface skill-registry.ts uses: a typed builder that
 * binds a name/description/Zod schema to an execute function so the
 * agent runtime can register skills without importing the whole
 * @openrouter/agent SDK at the repo root.
 */
export function tool(def) {
    return {
        name: def.name,
        description: def.description,
        inputSchema: def.inputSchema,
        execute: async (args) => def.execute(args),
    };
}
