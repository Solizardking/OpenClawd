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

export type Character = {
  id?: UUID;
  name: string;
  username?: string;
  system?: string;
  bio?: string | string[];
  style?: Record<string, string[]>;
  adjectives?: string[];
  settings?: Record<string, unknown>;
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
