import type { OpenClawd } from '@openclawdsolana/core';
import express from 'express';
import type { AgentServer } from '../../index';
import { createMessagingCoreRouter } from './core';
import { createMessageServersRouter } from './messageServers';
import { createChannelsRouter } from './channels';
import { createSessionsRouter } from './sessions';
import { createJobsRouter } from './jobs';

/**
 * Creates the messaging router for all communication functionality
 */
export function messagingRouter(OpenClawd: OpenClawd, serverInstance: AgentServer): express.Router {
  const router = express.Router();

  if (!serverInstance) {
    throw new Error('ServerInstance is required for messaging router');
  }

  // Mount core messaging functionality at root level
  router.use('/', createMessagingCoreRouter(serverInstance));

  // Mount server management functionality
  router.use('/', createMessageServersRouter(serverInstance));

  // Mount channel management functionality
  router.use('/', createChannelsRouter(OpenClawd, serverInstance));

  // Mount unified sessions API for simplified messaging
  router.use('/', createSessionsRouter(OpenClawd, serverInstance));

  // Mount jobs API for one-off messaging
  router.use('/', createJobsRouter(OpenClawd, serverInstance));

  return router;
}
