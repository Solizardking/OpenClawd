import { createSolanaClawdPluginGateway } from '@openclawdsolana/chat-plugins-gateway';

export const config = {
  runtime: 'edge',
};

export default createSolanaClawdPluginGateway();

