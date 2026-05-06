import type { OpenClawd } from '@openclawdsolana/core';
import express from 'express';
import type { AgentServer } from '../../index';
import { createAgentCrudRouter } from './crud';
import { createAgentLifecycleRouter } from './lifecycle';
import { createAgentWorldsRouter } from './worlds';
import { createAgentPanelsRouter } from './panels';
import { createAgentLogsRouter } from './logs';
import { createAgentRunsRouter } from './runs';
import { createAgentMemoryRouter } from '../memory/agents';
import { createRoomManagementRouter } from '../memory/rooms';

/**
 * Creates the agents router for agent lifecycle and management operations
 */
export function agentsRouter(OpenClawd: OpenClawd, serverInstance: AgentServer): express.Router {
  const router = express.Router();

  // Mount CRUD operations at root level
  router.use('/', createAgentCrudRouter(OpenClawd, serverInstance));

  // Mount lifecycle operations
  router.use('/', createAgentLifecycleRouter(OpenClawd, serverInstance));

  // Mount world management operations
  router.use('/', createAgentWorldsRouter(OpenClawd));

  // Mount panels operations
  router.use('/', createAgentPanelsRouter(OpenClawd));

  // Mount logs operations
  router.use('/', createAgentLogsRouter(OpenClawd));

  // Mount runs operations
  router.use('/', createAgentRunsRouter(OpenClawd));

  // Mount memory operations
  router.use('/', createAgentMemoryRouter(OpenClawd));
  // Mount room management (list rooms and room details) under agents
  router.use('/', createRoomManagementRouter(OpenClawd));

  return router;
}
