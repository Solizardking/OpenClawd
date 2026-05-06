#!/usr/bin/env bun
/**
 * Dual build script for @openclawdsolana/core.
 */

import { createBuildRunner } from '../build-utils';
import { existsSync, mkdirSync } from 'node:fs';

['dist', 'dist/node', 'dist/browser'].forEach((dir) => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
});

const browserExternals = [
  'sharp',
  '@hapi/shot',
  '@opentelemetry/context-async-hooks',
  'async_hooks',
  'node:diagnostics_channel',
  'node:async_hooks',
  'crypto-browserify',
];

const nodeExternals = ['dotenv', 'sharp', 'zod', '@hapi/shot'];

const sharedConfig = {
  packageName: '@openclawdsolana/core',
  sourcemap: true,
  minify: false,
  generateDts: true,
};

async function buildNode() {
  console.log('Building @openclawdsolana/core for Node.js...');
  const runNode = createBuildRunner({
    ...sharedConfig,
    buildOptions: {
      entrypoints: ['src/index.node.ts'],
      outdir: 'dist/node',
      target: 'node',
      format: 'esm',
      external: nodeExternals,
      sourcemap: true,
      minify: false,
      generateDts: false,
    },
  });

  await runNode();
}

async function buildBrowser() {
  console.log('Building @openclawdsolana/core for browser...');
  const runBrowser = createBuildRunner({
    ...sharedConfig,
    buildOptions: {
      entrypoints: ['src/index.browser.ts'],
      outdir: 'dist/browser',
      target: 'browser',
      format: 'esm',
      external: browserExternals,
      sourcemap: true,
      minify: true,
      generateDts: false,
      plugins: [],
    },
  });

  await runBrowser();
}

async function generateTypeScriptDeclarations() {
  const fs = await import('node:fs/promises');
  const { $ } = await import('bun');

  await $`tsc --project tsconfig.declarations.json`;
  await fs.mkdir('dist/node', { recursive: true });
  await fs.mkdir('dist/browser', { recursive: true });
  await fs.writeFile(
    'dist/node/index.d.ts',
    `// Type definitions for @openclawdsolana/core (Node.js)\nexport * from '../index.node';\n`
  );
  await fs.writeFile(
    'dist/browser/index.d.ts',
    `// Type definitions for @openclawdsolana/core (Browser)\nexport * from '../index.browser';\n`
  );
  await fs.writeFile(
    'dist/index.js',
    `// Main entry point fallback for @openclawdsolana/core\nexport * from './node/index.node.js';\n`
  );
}

await Promise.all([buildNode(), buildBrowser(), generateTypeScriptDeclarations()]);
