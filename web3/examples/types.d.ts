declare module "@openclawdsolana/plugin-openai" {
  const plugin: unknown;
  export default plugin;
}

declare module "@openclawdsolana/plugin-bootstrap" {
  const plugin: unknown;
  export default plugin;
}

declare module "@openclawdsolana/plugin-sql" {
  import type { IDatabaseAdapter, UUID } from "@openclawdsolana/core";

  const plugin: unknown;
  export default plugin;

  export class DatabaseMigrationService {
    initializeWithDatabase(_database: unknown): Promise<void>;
    discoverAndRegisterPluginSchemas(_plugins: unknown[]): void;
    runAllPluginMigrations(): Promise<void>;
  }

  export function createDatabaseAdapter(
    _config: { dataDir?: string; postgresUrl?: string },
    _agentId: UUID,
  ): IDatabaseAdapter;
}

declare module "@clack/prompts" {
  export function intro(message: string): void;
  export function outro(message: string): void;
  export function note(message: string, title?: string): void;
  export function isCancel(value: unknown): boolean;
  export function text(options: { message: string; placeholder?: string }): Promise<string | symbol>;
  export function spinner(): {
    start(message: string): void;
    stop(message: string): void;
    message(message: string): void;
  };
}

declare module "@openclawdsolana/api-client" {
  export enum JobStatus {
    COMPLETED = "completed",
    FAILED = "failed",
    TIMEOUT = "timeout",
  }

  export const OpenClawdClient: {
    create(options: { baseUrl: string; apiKey?: string }): {
      jobs: any;
    };
  };
}
