/**
 * Gateway RPC handlers for OpenRouter.
 *
 * Register these on the gateway server so the UI's `request("openrouter.X")`
 * calls reach the shared AgentRuntime.
 */
import { type AgentRuntime } from '../agents/runtime.js';
export type GatewayHandler = (params: unknown) => Promise<unknown>;
export declare function createOpenRouterHandlers(runtime?: AgentRuntime): Record<string, GatewayHandler>;
//# sourceMappingURL=openrouter-handlers.d.ts.map