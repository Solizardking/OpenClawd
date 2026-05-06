#!/usr/bin/env bun
/**
 * Build script for @openclawdsolana/config using standardized build utilities
 */

import { createBuildRunner } from '../../goat/build-utils';

// Create and run the standardized build runner
const run = createBuildRunner({
  packageName: '@openclawdsolana/config',
  buildOptions: {
    entrypoints: ['src/index.ts'],
    outdir: 'dist',
    target: 'node',
    format: 'esm',
    external: ['fs', 'path'],
    sourcemap: false,
    minify: false,
    generateDts: true,
  },
});

// Execute the build
run().catch((error) => {
  console.error('Build script error:', error);
  process.exit(1);
});
