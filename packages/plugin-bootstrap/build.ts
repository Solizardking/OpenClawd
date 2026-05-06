#!/usr/bin/env bun
/**
 * Build script for @openclawdsolana/plugin-bootstrap using standardized build utilities
 */

import { createBuildRunner } from '../../build-utils';

// Create and run the standardized build runner
const run = createBuildRunner({
  packageName: '@openclawdsolana/plugin-bootstrap',
  buildOptions: {
    entrypoints: ['src/index.ts'],
    outdir: 'dist',
    target: 'node',
    format: 'esm',
    external: [
      'dotenv',
      'fs',
      'path',
      '@reflink/reflink',
      'agentkeepalive',
      'zod',
      '@openclawdsolana/core',
      '@openclawdsolana/plugin-sql',
    ],
    sourcemap: true,
    minify: false,
    generateDts: true,
  },
});

// Execute the build
run().catch((error) => {
  console.error('Build script error:', error);
  process.exit(1);
});
