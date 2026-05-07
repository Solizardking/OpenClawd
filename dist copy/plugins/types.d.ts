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
import type { AgentRuntime } from "../agents/runtime.js";
export type JsonValue = string | number | boolean | null | JsonValue[] | {
    [key: string]: JsonValue;
};
export type JsonObject = {
    [key: string]: JsonValue;
};
export interface OpenClawdLogger {
    debug?: (...args: unknown[]) => void;
    info?: (...args: unknown[]) => void;
    warn?: (...args: unknown[]) => void;
    error?: (...args: unknown[]) => void;
}
export interface OpenClawdPluginConfigSchema {
    type: "object";
    properties?: Record<string, unknown>;
    required?: string[];
    additionalProperties?: boolean;
}
export interface OpenClawdPluginToolContext {
    pluginId: string;
    runtime: AgentRuntime;
    logger: OpenClawdLogger;
    pluginConfig: JsonObject;
    config: JsonObject;
    abortSignal?: AbortSignal;
}
export interface OpenClawdPluginToolResult {
    content: Array<{
        type: "text";
        text: string;
    } | {
        type: "json";
        json: JsonValue;
    }>;
    isError?: boolean;
}
export interface OpenClawdPluginToolDefinition {
    name: string;
    description: string;
    parameters: unknown;
    execute: (id: string, params: Record<string, unknown>, ctx?: OpenClawdPluginToolContext) => Promise<OpenClawdPluginToolResult> | OpenClawdPluginToolResult;
}
export interface OpenClawdChannelDefinition {
    id: string;
    name?: string;
    plugin: unknown;
}
export interface OpenClawdProviderAuth {
    id: string;
    label: string;
    hint?: string;
    kind: "oauth" | "apiKey" | "device";
    run: (ctx: OpenClawdProviderAuthContext) => Promise<unknown>;
}
export interface OpenClawdProviderAuthContext {
    isRemote: boolean;
    openUrl: (url: string) => Promise<void>;
    runtime: {
        log: (msg: string) => void;
    };
    prompter: {
        text: (opts: {
            message: string;
        }) => Promise<string>;
        progress: (msg: string) => {
            stop: (msg?: string) => void;
        };
        note: (msg: string, title?: string) => Promise<void>;
    };
}
export interface OpenClawdProviderDefinition {
    id: string;
    label: string;
    docsPath?: string;
    aliases?: string[];
    envVars?: string[];
    auth: OpenClawdProviderAuth[];
}
export interface OpenClawdPluginCommandDefinition {
    name: string;
    description: string;
    handler: (args: string[]) => Promise<void> | void;
}
export interface OpenClawdPluginApi {
    pluginId: string;
    pluginConfig: JsonObject;
    config: JsonObject;
    logger: OpenClawdLogger;
    runtime: AgentRuntime;
    registerTool: (tool: OpenClawdPluginToolDefinition) => void;
    registerChannel: (channel: OpenClawdChannelDefinition) => void;
    registerProvider: (provider: OpenClawdProviderDefinition) => void;
    registerCommand?: (command: OpenClawdPluginCommandDefinition) => void;
}
export interface OpenClawdPluginDefinition {
    id: string;
    name: string;
    description?: string;
    configSchema?: OpenClawdPluginConfigSchema;
    register: (api: OpenClawdPluginApi) => void | Promise<void>;
}
export interface OpenClawdPluginManifest {
    id: string;
    kind?: "channel" | "provider" | "tool" | "memory" | "skill";
    name?: string;
    description?: string;
    main?: string;
    uiHints?: Record<string, unknown>;
}
export declare function emptyPluginConfigSchema(): OpenClawdPluginConfigSchema;
export type OpenClawdPluginRegister = (api: OpenClawdPluginApi) => void | Promise<void>;
//# sourceMappingURL=types.d.ts.map