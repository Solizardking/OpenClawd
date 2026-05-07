export type UUID = string & { readonly __uuidBrand: unique symbol };

export type Content = {
  text?: string;
  source?: string;
  actions?: string[];
  channelType?: string;
  [key: string]: unknown;
};

export type Memory = {
  id?: UUID;
  entityId: UUID;
  agentId?: UUID;
  roomId: UUID;
  content: Content;
  embedding?: number[];
  createdAt?: number;
};

export type State = Record<string, unknown>;

export type Character = {
  id?: UUID;
  name: string;
  username?: string;
  plugins?: string[];
  system?: string;
  bio?: string | string[];
  topics?: string[];
  messageExamples?: Array<Array<{ name: string; content: Content }>>;
  style?: Record<string, string[]>;
  adjectives?: string[];
  settings?: Record<string, unknown>;
};

export type HandlerCallback = (content: Content) => Promise<Memory[] | void>;

export type ActionResult = {
  text?: string;
  values?: Record<string, unknown>;
  data?: Record<string, unknown>;
  success?: boolean;
  error?: Error;
};

export type Action = {
  name: string;
  similes?: string[];
  description?: string;
  validate?: (runtime: unknown, message: Memory, state: State) => Promise<boolean> | boolean;
  handler?: (
    runtime: unknown,
    message: Memory,
    state: State,
    options: Record<string, unknown>,
    callback: HandlerCallback,
    responses: Memory[],
  ) => Promise<ActionResult> | ActionResult;
  examples?: Array<Array<{ name: string; content: Content }>>;
};

export type ProviderResult = {
  text?: string;
  values?: Record<string, unknown>;
  data?: Record<string, unknown>;
};

export type Provider = {
  name: string;
  description?: string;
  get: (runtime: unknown, message: Memory, state: State) => Promise<ProviderResult> | ProviderResult;
};

export type GenerateTextParams = {
  prompt: string;
  stopSequences?: string[];
  maxTokens?: number;
  temperature?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
};

export type RouteRequest = {
  [key: string]: unknown;
};

export type RouteResponse = {
  json: (body: unknown) => unknown;
  [key: string]: unknown;
};

export type Route = {
  name: string;
  path: string;
  type: string;
  handler: (req: RouteRequest, res: RouteResponse) => Promise<void> | void;
};

export type Plugin = {
  name: string;
  description?: string;
  priority?: number;
  config?: Record<string, unknown>;
  init?: (config: Record<string, string>, runtime?: unknown) => Promise<void> | void;
  models?: Record<string, (runtime: unknown, params: GenerateTextParams) => Promise<string> | string>;
  routes?: Route[];
  events?: Record<string, Array<(params: Record<string, unknown>) => Promise<void> | void>>;
  services?: Array<typeof Service>;
  actions?: Action[];
  providers?: Provider[];
};

export type ProjectAgent = {
  character: Character;
  init?: (runtime: unknown) => Promise<void> | void;
  plugins?: Plugin[];
};

export type Project = {
  agents: ProjectAgent[];
};

export type IDatabaseAdapter = {
  init?: () => Promise<void>;
  close?: () => Promise<void>;
  getDatabase?: () => unknown;
  [key: string]: unknown;
};

export const ChannelType = {
  DM: "DM",
} as const;

export type ChannelType = (typeof ChannelType)[keyof typeof ChannelType];

export const EventType = {
  EMBEDDING_GENERATION_REQUESTED: "EMBEDDING_GENERATION_REQUESTED",
} as const;

export type EventType = (typeof EventType)[keyof typeof EventType];

export const ModelType = {
  TEXT_SMALL: "TEXT_SMALL",
  TEXT_LARGE: "TEXT_LARGE",
  TEXT_EMBEDDING: "TEXT_EMBEDDING",
} as const;

export type ModelType = (typeof ModelType)[keyof typeof ModelType];

export const logger = {
  info: (...args: unknown[]) => console.info(...args),
  warn: (...args: unknown[]) => console.warn(...args),
  error: (...args: unknown[]) => console.error(...args),
  debug: (...args: unknown[]) => console.debug(...args),
};

export class Service {
  static serviceType = "service";

  protected runtime: unknown;

  constructor(runtime?: unknown) {
    this.runtime = runtime;
  }

  static async start(runtime: unknown): Promise<Service> {
    return new Service(runtime);
  }

  static async stop(_runtime: unknown): Promise<void> {
    // Services can override this.
  }

  async stop(): Promise<void> {
    // Services can override this.
  }
}
