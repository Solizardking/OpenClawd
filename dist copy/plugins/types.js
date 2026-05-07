/**
 * OpenClawd Plugin SDK — type surface consumed by every extension under
 * [`extensions/`](../../extensions/) and by the framework's loader in
 * [`registry.ts`](./registry.ts).
 *
 * Extensions import these types via:
 *
 *   import type { OpenClawdPluginApi } from "../../src/plugins/types.js";
 *
 * The shape mirrors the legacy `openclawd/plugin-sdk` package so existing
 * channel/provider/tool plugins compile unchanged.
 */
export function emptyPluginConfigSchema() {
    return { type: "object", properties: {}, additionalProperties: true };
}
//# sourceMappingURL=types.js.map