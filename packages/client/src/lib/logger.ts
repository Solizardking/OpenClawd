import { openclawdLogger } from '@openclawdsolana/core';

// Add client-specific context to logs
const clientLogger = {
  info: (msg: string, ...args: unknown[]) => {
    openclawdLogger.info({ source: 'client' }, msg, ...args);
  },
  error: (msg: string, ...args: unknown[]) => {
    openclawdLogger.error({ source: 'client' }, msg, ...args);
  },
  warn: (msg: string, ...args: unknown[]) => {
    openclawdLogger.warn({ source: 'client' }, msg, ...args);
  },
  debug: (msg: string, ...args: unknown[]) => {
    openclawdLogger.debug({ source: 'client' }, msg, ...args);
  },
};

export default clientLogger;
