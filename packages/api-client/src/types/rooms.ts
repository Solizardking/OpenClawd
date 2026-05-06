import { ChannelType, type UUID } from '@openclawdsolana/core';

export interface Room {
  id: string;
  name: string;
  type: ChannelType;
  entities: { id: string; agentId?: string }[];
}
