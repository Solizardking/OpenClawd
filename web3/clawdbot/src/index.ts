import { logger, type IAgentRuntime, type Project, type ProjectAgent } from '@openclawdsolana/core';
import starterPlugin from './plugin.ts';
import { character } from './character.ts';
import phalaTeePlugin from './teePlugin.ts';

const initCharacter = ({ runtime }: { runtime: IAgentRuntime }) => {
  logger.info('Initializing character');
  logger.info({ name: character.name }, 'Name:');
};

export const projectAgent: ProjectAgent = {
  character,
  init: async (runtime: IAgentRuntime) => await initCharacter({ runtime }),
  plugins: [phalaTeePlugin], // Added Phala TEE support
};

const project: Project = {
  agents: [projectAgent],
};

export { character } from './character.ts';

export default project;
