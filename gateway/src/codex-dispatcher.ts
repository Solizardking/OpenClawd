export type CodexTaskStatus = 'queued' | 'running' | 'completed' | 'failed';

export interface CodexTaskRequest {
  prompt: string;
  source?: 'telegram' | 'http' | 'gateway';
  chatId?: number | string;
  userId?: number | string;
  username?: string;
  repoPath?: string;
  mode?: 'ask' | 'code' | 'review';
}

export interface CodexTask {
  id: string;
  prompt: string;
  source: 'telegram' | 'http' | 'gateway';
  chatId?: string;
  userId?: string;
  username?: string;
  repoPath: string;
  mode: 'ask' | 'code' | 'review';
  status: CodexTaskStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  model?: string;
  responseText?: string;
  error?: string;
}

export interface CodexDispatcherConfig {
  openaiApiKey?: string;
  model?: string;
  repoPath?: string;
  maxStoredTasks?: number;
  fetchImpl?: typeof fetch;
}

type ResponsesApiOutputItem =
  | {
      type?: string;
      content?: Array<{ type?: string; text?: string }>;
    }
  | Record<string, unknown>;

interface ResponsesApiResult {
  id?: string;
  output_text?: string;
  output?: ResponsesApiOutputItem[];
  error?: { message?: string };
}

const DEFAULT_MODEL = 'gpt-5';
const DEFAULT_REPO_PATH = '/Users/8bit/fraud/OpenClawd';
const MAX_TELEGRAM_CHARS = 3600;

export class CodexDispatcher {
  private tasks = new Map<string, CodexTask>();
  private readonly config: Required<Omit<CodexDispatcherConfig, 'openaiApiKey' | 'fetchImpl'>> &
    Pick<CodexDispatcherConfig, 'openaiApiKey' | 'fetchImpl'>;
  private counter = 0;

  constructor(config: CodexDispatcherConfig = {}) {
    this.config = {
      openaiApiKey: config.openaiApiKey ?? process.env.OPENAI_API_KEY,
      model: config.model ?? process.env.OPENAI_CODEX_MODEL ?? DEFAULT_MODEL,
      repoPath: config.repoPath ?? process.env.OPENCLAWD_REPO_PATH ?? DEFAULT_REPO_PATH,
      maxStoredTasks: config.maxStoredTasks ?? 100,
      fetchImpl: config.fetchImpl,
    };
  }

  isConfigured(): boolean {
    return Boolean(this.config.openaiApiKey);
  }

  createTask(req: CodexTaskRequest): CodexTask {
    const now = new Date().toISOString();
    const task: CodexTask = {
      id: this.nextId(),
      prompt: req.prompt.trim(),
      source: req.source ?? 'gateway',
      chatId: req.chatId == null ? undefined : String(req.chatId),
      userId: req.userId == null ? undefined : String(req.userId),
      username: req.username,
      repoPath: req.repoPath ?? this.config.repoPath,
      mode: req.mode ?? 'ask',
      status: 'queued',
      createdAt: now,
      updatedAt: now,
      model: this.config.model,
    };
    this.tasks.set(task.id, task);
    this.trimTasks();
    return task;
  }

  getTask(id: string): CodexTask | undefined {
    return this.tasks.get(id);
  }

  listTasks(limit = 20): CodexTask[] {
    return Array.from(this.tasks.values())
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, Math.max(1, Math.min(limit, 100)));
  }

  async dispatch(req: CodexTaskRequest): Promise<CodexTask> {
    const task = this.createTask(req);
    await this.runTask(task.id);
    return this.getTask(task.id) ?? task;
  }

  async runTask(id: string): Promise<CodexTask> {
    const task = this.tasks.get(id);
    if (!task) throw new Error(`unknown codex task: ${id}`);
    if (!this.config.openaiApiKey) {
      return this.updateTask(id, {
        status: 'failed',
        error: 'OPENAI_API_KEY is not set in the gateway environment.',
        completedAt: new Date().toISOString(),
      });
    }

    this.updateTask(id, { status: 'running', error: undefined });

    try {
      const result = await this.callResponsesApi(task);
      return this.updateTask(id, {
        status: 'completed',
        responseText: result,
        completedAt: new Date().toISOString(),
      });
    } catch (error) {
      return this.updateTask(id, {
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
        completedAt: new Date().toISOString(),
      });
    }
  }

  formatTelegramTask(task: CodexTask): string {
    const header = [
      `Codex task ${task.id}`,
      `status: ${task.status}`,
      `mode: ${task.mode}`,
      `model: ${task.model ?? this.config.model}`,
    ].join('\n');

    const body = task.responseText
      ? `\n\n${task.responseText}`
      : task.error
        ? `\n\nError: ${task.error}`
        : `\n\nPrompt: ${task.prompt}`;

    return `${header}${body}`.slice(0, MAX_TELEGRAM_CHARS);
  }

  private async callResponsesApi(task: CodexTask): Promise<string> {
    const f = this.config.fetchImpl ?? fetch;
    const response = await f('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${this.config.openaiApiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model,
        instructions: this.instructions(task),
        input: task.prompt,
      }),
    });

    const raw = await response.text();
    let parsed: ResponsesApiResult;
    try {
      parsed = JSON.parse(raw) as ResponsesApiResult;
    } catch {
      throw new Error(`OpenAI Responses ${response.status}: ${raw.slice(0, 500)}`);
    }

    if (!response.ok) {
      throw new Error(`OpenAI Responses ${response.status}: ${parsed.error?.message ?? raw.slice(0, 500)}`);
    }

    return extractResponseText(parsed).trim() || '(no response text)';
  }

  private instructions(task: CodexTask): string {
    return [
      'You are the OpenClawd Codex task dispatcher.',
      'The user is sending a software task from Telegram or the OpenClawd gateway.',
      'Return a concise actionable dispatch brief for a coding agent.',
      'Do not claim that you changed files, ran commands, opened pull requests, or deployed anything.',
      'Classify risk and call out any approval gates before write, shell, deploy, or wallet actions.',
      'Use this format:',
      'Title: <short title>',
      'Mode: ask | code | review',
      'Risk: low | medium | high',
      'Dispatch: <one paragraph>',
      'Steps:',
      '1. <step>',
      '2. <step>',
      'Approval needed: <yes/no + why>',
      '',
      `Repository path: ${task.repoPath}`,
      `Requested mode: ${task.mode}`,
      `Source: ${task.source}`,
      task.username ? `Telegram user: ${task.username}` : '',
    ]
      .filter(Boolean)
      .join('\n');
  }

  private updateTask(id: string, patch: Partial<CodexTask>): CodexTask {
    const existing = this.tasks.get(id);
    if (!existing) throw new Error(`unknown codex task: ${id}`);
    const updated = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    this.tasks.set(id, updated);
    return updated;
  }

  private nextId(): string {
    this.counter += 1;
    return `codex-${Date.now().toString(36)}-${this.counter.toString(36)}`;
  }

  private trimTasks(): void {
    const excess = this.tasks.size - this.config.maxStoredTasks;
    if (excess <= 0) return;
    const ids = Array.from(this.tasks.values())
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .slice(0, excess)
      .map((task) => task.id);
    for (const id of ids) this.tasks.delete(id);
  }
}

function extractResponseText(result: ResponsesApiResult): string {
  if (typeof result.output_text === 'string') return result.output_text;
  const chunks: string[] = [];
  for (const item of result.output ?? []) {
    if (!('content' in item) || !Array.isArray(item.content)) continue;
    for (const part of item.content) {
      if (typeof part.text === 'string') chunks.push(part.text);
    }
  }
  return chunks.join('\n');
}
