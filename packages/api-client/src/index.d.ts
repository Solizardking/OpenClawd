import type { Agent, Content, UUID } from '@openclawdsolana/core';
export interface ApiClientConfig {
    baseUrl: string;
    apiKey?: string;
    timeout?: number;
    headers?: Record<string, string>;
}
export interface ApiErrorPayload {
    message: string;
    code?: string;
    details?: unknown;
}
export interface ApiResponse<T> {
    data?: T;
    error?: ApiErrorPayload;
}
export type TransportType = 'http' | 'sse' | 'socket.io';
export interface MessageServerMetadata {
    [key: string]: unknown;
}
export interface ChannelMetadata {
    [key: string]: unknown;
}
export interface MessageMetadata {
    thought?: string;
    actions?: string[];
    attachments?: unknown;
    [key: string]: unknown;
}
export interface Message {
    id?: UUID;
    content: string | Content;
    authorId?: UUID;
    channelId?: UUID;
    metadata?: MessageMetadata;
    createdAt?: string | number | Date;
    [key: string]: unknown;
}
export interface AgentStartPayload {
    characterJson?: unknown;
    characterPath?: string;
    [key: string]: unknown;
}
export interface ListRunsParams {
    limit?: number;
    cursor?: string;
    status?: string;
    since?: string;
    until?: string;
    [key: string]: string | number | boolean | undefined;
}
export interface RunEvent {
    id?: UUID;
    type: string;
    name?: string;
    timestamp?: string | number;
    startedAt?: string | number;
    endedAt?: string | number;
    durationMs?: number;
    parentId?: UUID;
    input?: unknown;
    output?: unknown;
    error?: unknown;
    metadata?: Record<string, unknown>;
    [key: string]: unknown;
}
export interface RunSummary {
    id: UUID;
    agentId?: UUID;
    roomId?: UUID;
    status?: string;
    startedAt?: string | number;
    endedAt?: string | number;
    durationMs?: number;
    eventCount?: number;
    input?: unknown;
    output?: unknown;
    error?: unknown;
    metadata?: Record<string, unknown>;
    [key: string]: unknown;
}
export interface RunDetail extends RunSummary {
    events: RunEvent[];
}
type RequestBody = BodyInit | Record<string, unknown> | unknown[] | null | undefined;
export declare class ApiClientBase {
    protected readonly config: ApiClientConfig;
    constructor(config: ApiClientConfig);
    protected request<T>(path: string, init?: RequestInit & {
        body?: RequestBody;
    }): Promise<T>;
}
export declare class AgentsService extends ApiClientBase {
    listAgents(): Promise<{
        agents: Agent[];
    }>;
    getAgent(agentId: UUID): Promise<Agent>;
    createAgent(payload: AgentStartPayload | Record<string, unknown>): Promise<Agent>;
    updateAgent(agentId: UUID, payload: Record<string, unknown>): Promise<Agent>;
    deleteAgent(agentId: UUID): Promise<void>;
    startAgent(agentId: UUID): Promise<{
        id?: UUID;
        name?: string;
        status: string;
    }>;
    stopAgent(agentId: UUID): Promise<{
        id?: UUID;
        name?: string;
        status: string;
    }>;
    listPanels(agentId: UUID): Promise<unknown>;
    getLogs(agentId: UUID): Promise<unknown>;
}
export declare class MemoryService extends ApiClientBase {
    clearAgentMemories(agentId: UUID): Promise<{
        deleted: number;
    }>;
}
export declare class RunsService extends ApiClientBase {
    listRuns(agentId: UUID, params?: ListRunsParams): Promise<{
        runs: RunSummary[];
        total: number;
        hasMore: boolean;
    }>;
    getRun(agentId: UUID, runId: UUID, roomId?: UUID): Promise<RunDetail>;
}
export declare class MessagesService extends ApiClientBase {
    sendMessage(channelId: UUID, message: Message): Promise<Message>;
    listMessages(channelId: UUID): Promise<{
        messages: Message[];
    }>;
}
export declare class OpenClawdClient extends ApiClientBase {
    readonly agents: AgentsService;
    readonly memory: MemoryService;
    readonly runs: RunsService;
    readonly messages: MessagesService;
    static create(config: ApiClientConfig): OpenClawdClient;
    constructor(config: ApiClientConfig);
}
export type { Agent, Content, UUID };
//# sourceMappingURL=index.d.ts.map