/**
 * Public surface of the OpenClawd Plugin SDK.
 *
 * Extensions reach the *types* via [`types.ts`](./types.ts) and the
 * framework reaches the *loader* via [`registry.ts`](./registry.ts).
 * This file is the single import-anchor for the rest of the runtime.
 */

export * from "./types.js";
export {
    PluginRegistry,
    getPluginRegistry,
    type LoadOptions,
    type LoadReport,
    type RegisteredPlugin,
} from "./registry.js";
