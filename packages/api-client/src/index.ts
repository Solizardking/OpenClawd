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

export class ApiClientBase {
  protected readonly config: ApiClientConfig;

  constructor(config: ApiClientConfig) {
    this.config = {
      ...config,
      baseUrl: config.baseUrl.replace(/\/+$/, ''),
    };
  }

  protected async request<T>(path: string, init: RequestInit & { body?: RequestBody } = {}): Promise<T> {
    const controller = new AbortController();
    const timeout = this.config.timeout ?? 30000;
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...this.config.headers,
      ...(init.headers as Record<string, string> | undefined),
    };

    if (this.config.apiKey) {
      headers.Authorization = `Bearer ${this.config.apiKey}`;
      headers['X-API-Key'] = this.config.apiKey;
    }

    let body = init.body;
    if (body && typeof body === 'object' && !(body instanceof FormData) && !(body instanceof URLSearchParams)) {
      headers['Content-Type'] = headers['Content-Type'] ?? 'application/json';
      body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${this.config.baseUrl}${path}`, {
        ...init,
        headers,
        body: body as BodyInit | undefined,
        signal: init.signal ?? controller.signal,
      });

      const contentType = response.headers.get('content-type') ?? '';
      const payload = contentType.includes('application/json') ? await response.json() : await response.text();

      if (!response.ok) {
        const message =
          typeof payload === 'object' && payload && 'error' in payload
            ? String((payload as { error?: { message?: string } }).error?.message ?? response.statusText)
            : response.statusText;
        throw new Error(message || `Request failed with status ${response.status}`);
      }

      if (typeof payload === 'object' && payload && 'data' in payload) {
        return (payload as ApiResponse<T>).data as T;
      }

      return payload as T;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

export class AgentsService extends ApiClientBase {
  listAgents(): Promise<{ agents: Agent[] }> {
    return this.request('/api/agents');
  }

  getAgent(agentId: UUID): Promise<Agent> {
    return this.request(`/api/agents/${agentId}`);
  }

  createAgent(payload: AgentStartPayload | Record<string, unknown>): Promise<Agent> {
    return this.request('/api/agents', { method: 'POST', body: payload });
  }

  updateAgent(agentId: UUID, payload: Record<string, unknown>): Promise<Agent> {
    return this.request(`/api/agents/${agentId}`, { method: 'PATCH', body: payload });
  }

  deleteAgent(agentId: UUID): Promise<void> {
    return this.request(`/api/agents/${agentId}`, { method: 'DELETE' });
  }

  startAgent(agentId: UUID): Promise<{ id?: UUID; name?: string; status: string }> {
    return this.request(`/api/agents/${agentId}/start`, { method: 'POST' });
  }

  stopAgent(agentId: UUID): Promise<{ id?: UUID; name?: string; status: string }> {
    return this.request(`/api/agents/${agentId}/stop`, { method: 'POST' });
  }

  listPanels(agentId: UUID): Promise<unknown> {
    return this.request(`/api/agents/${agentId}/panels`);
  }

  getLogs(agentId: UUID): Promise<unknown> {
    return this.request(`/api/agents/${agentId}/logs`);
  }
}

export class MemoryService extends ApiClientBase {
  clearAgentMemories(agentId: UUID): Promise<{ deleted: number }> {
    return this.request(`/api/memory/${agentId}/memories`, { method: 'DELETE' });
  }
}

export class RunsService extends ApiClientBase {
  listRuns(agentId: UUID, params?: ListRunsParams): Promise<{ runs: RunSummary[]; total: number; hasMore: boolean }> {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    return this.request(`/api/agents/${agentId}/runs${query}`);
  }

  getRun(agentId: UUID, runId: UUID, roomId?: UUID): Promise<RunDetail> {
    const query = roomId ? `?roomId=${encodeURIComponent(roomId)}` : '';
    return this.request(`/api/agents/${agentId}/runs/${runId}${query}`);
  }
}

export class MessagesService extends ApiClientBase {
  sendMessage(channelId: UUID, message: Message): Promise<Message> {
    return this.request(`/api/messaging/channels/${channelId}/messages`, {
      method: 'POST',
      body: message,
    });
  }

  listMessages(channelId: UUID): Promise<{ messages: Message[] }> {
    return this.request(`/api/messaging/channels/${channelId}/messages`);
  }
}

export class OpenClawdClient extends ApiClientBase {
  readonly agents: AgentsService;
  readonly memory: MemoryService;
  readonly runs: RunsService;
  readonly messages: MessagesService;

  static create(config: ApiClientConfig): OpenClawdClient {
    return new OpenClawdClient(config);
  }

  constructor(config: ApiClientConfig) {
    super(config);
    this.agents = new AgentsService(config);
    this.memory = new MemoryService(config);
    this.runs = new RunsService(config);
    this.messages = new MessagesService(config);
  }
}

export type { Agent, Content, UUID };
