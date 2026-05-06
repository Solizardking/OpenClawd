import type { OpenClawd } from '@openclawdsolana/core';
import express from 'express';
import { createAudioProcessingRouter } from './processing';
import { createSynthesisRouter } from './synthesis';
import { createConversationRouter } from './conversation';

/**
 * Creates the audio router for speech and audio processing
 */
export function audioRouter(OpenClawd: OpenClawd): express.Router {
  const router = express.Router();

  // Mount audio processing (upload, transcription)
  router.use('/', createAudioProcessingRouter(OpenClawd));

  // Mount text-to-speech synthesis
  router.use('/', createSynthesisRouter(OpenClawd));

  // Mount speech conversation functionality
  router.use('/', createConversationRouter(OpenClawd));

  return router;
}
