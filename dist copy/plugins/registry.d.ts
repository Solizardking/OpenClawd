/**
 * OpenClawd Plugin Registry — discovers extensions on disk under
 * [`extensions/`](../../extensions/), loads each one's `index.ts`,
 * and registers its tools/channels/providers against the supplied
 * [`AgentRuntime`](../agents/runtime.ts).
 *
 * The registry is intentionally tolerant: a missing `index.ts`,
 * unresolved peer import, or thrown `register()` does NOT take down
 * the whole framework. Each failure is reported on the returned
 * `LoadReport` so the operator can triage.
 */
import type { AgentRuntime } from "../agents/runtime.js";
import type { JsonObject, OpenClawdChannelDefinition, OpenClawdLogger, OpenClawdPluginCommandDefinition, OpenClawdPluginToolDefinition, OpenClawdProviderDefinition } from "./types.js";
export interface RegisteredPlugin {
    id: string;
    name: string;
    dir: string;
    tools: OpenClawdPluginToolDefinition[];
    channels: OpenClawdChannelDefinition[];
    providers: OpenClawdProviderDefinition[];
    commands: OpenClawdPluginCommandDefinition[];
}
export interface LoadReport {
    loaded: RegisteredPlugin[];
    skipped: Array<{
        id: string;
        reason: string;
    }>;
    failed: Array<{
        id: string;
        error: string;
    }>;
}
export interface LoadOptions {
    extensionsDir?: string;
    runtime: AgentRuntime;
    config?: JsonObject;
    pluginConfigs?: Record<string, JsonObject>;
    logger?: OpenClawdLogger;
    only?: string[];
    skip?: string[];
}
export declare class PluginRegistry {
    private readonly plugins;
    list(): RegisteredPlugin[];
    get(id: string): RegisteredPlugin | undefined;
    add(plugin: RegisteredPlugin): void;
    loadAll(opts: LoadOptions): Promise<LoadReport>;
}
export declare function getPluginRegistry(): PluginRegistry;
//# sourceMappingURL=registry.d.ts.map