import path from 'node:path';

import { defineConfig } from 'vitest/config';

// Point the SDK alias at the in-repo source so tests don't depend on the
// already-published tarball (which has historically shipped with parts of
// the source tree missing). Once the SDK is republished with the corrected
// `files` field, this alias still works and remains the source of truth
// for cross-package monorepo testing.
const SDK_DIR = path.resolve(__dirname, '../sdk');

export default defineConfig({
  test: {
    alias: {
      '@': 'src',
      '@openclawdsolana/chat-plugins-gateway': 'src',
      '@openclawdsolana/plugin-sdk': SDK_DIR,
      '@openclawdsolana/plugin-sdk/openapi': path.join(SDK_DIR, 'openapi'),
      '@openclawdsolana/plugin-sdk/client': path.join(SDK_DIR, 'client'),
      '@openclawdsolana/plugin-sdk/schema': path.join(SDK_DIR, 'schema'),
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'lcov', 'text-summary'],
    },
    environment: 'node',
    globals: true,
  },
});

