export type UUID = string & { readonly __uuidBrand: unique symbol };

export type Content = {
  text?: string;
  source?: string;
  actions?: string[];
  [key: string]: unknown;
};

export type Memory = {
  id: UUID;
  entityId: UUID;
  agentId: UUID;
  roomId: UUID;
  content: Content;
  embedding?: number[];
  createdAt: number;
};

export type Character = {
  id?: UUID;
  name: string;
  username?: string;
  system?: string;
  bio?: string | string[];
};

export const EventType = {
  EMBEDDING_GENERATION_REQUESTED: "EMBEDDING_GENERATION_REQUESTED",
} as const;

export type EventType = (typeof EventType)[keyof typeof EventType];
