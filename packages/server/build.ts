#!/usr/bin/env bun
/**
 * Build script for @openclawdsolana/server using standardized build utilities
 */

import { createBuildRunner, copyAssets } from '../../build-utils';
import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import { join } from 'node:path';

const packageJson = JSON.parse(await fs.readFile('./package.json', 'utf8')) as {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
};

const packageExternals = [
  ...Object.keys(packageJson.dependencies ?? {}),
  ...Object.keys(packageJson.devDependencies ?? {}),
  ...Object.keys(packageJson.peerDependencies ?? {}),
  ...Object.keys(packageJson.optionalDependencies ?? {}),
];

// Create and run the standardized build runner
const run = createBuildRunner({
  packageName: '@openclawdsolana/server',
  buildOptions: {
    entrypoints: ['src/index.ts'],
    outdir: 'dist',
    target: 'node',
    format: 'esm',
    external: [
      ...packageExternals,
      '@openclawdsolana/core',
      '@openclawdsolana/client',
      'express',
      'cors',
      'multer',
      'swagger-ui-express',
      '@openclawdsolana/plugin-sql',
      'lancedb',
      'vectordb',
      'socket.io',
      'discord.js',
    ],
    sourcemap: false,
    minify: false,
    generateDts: false,
  },
  onBuildComplete: async (success) => {
    if (success) {
      // Prepare asset copy tasks
      const copyTasks: Promise<void>[] = [];
      const clientDistPath = join(process.cwd(), '../client/dist');
      let resolvedClientDist: string | null = null;

      // Check if client assets exist and add to copy tasks
      if (existsSync(clientDistPath)) {
        resolvedClientDist = clientDistPath;
      } else {
        // Fallback: try to resolve installed @openclawdsolana/client dist from node_modules
        try {
          const clientPkgPath = require.resolve('@openclawdsolana/client/package.json', {
            paths: [process.cwd()],
          });
          const clientPkgDir = clientPkgPath.substring(0, clientPkgPath.lastIndexOf('/'));
          const installedClientDist = join(clientPkgDir, 'dist');
          if (existsSync(installedClientDist)) {
            resolvedClientDist = installedClientDist;
          }
        } catch (_) {
          // ignore resolution errors; no installed client
        }
      }

      if (resolvedClientDist) {
        console.log('\nCopying client assets...');
        copyTasks.push(
          copyAssets([{ from: resolvedClientDist, to: './dist/client' }]).then(() =>
            console.log('✓ Client assets copied')
          )
        );
      } else {
        console.warn(
          '⚠️  Client assets not found. The web UI will not be bundled into @openclawdsolana/server.'
        );
      }

      // Check if static assets exist and add to copy tasks
      if (existsSync('./public')) {
        console.log('Copying static assets...');
        copyTasks.push(
          copyAssets([{ from: './public', to: './dist/public' }]).then(() =>
            console.log('✓ Static assets copied')
          )
        );
      }

      // Copy all assets in parallel
      if (copyTasks.length > 0) {
        const copyStart = performance.now();
        await Promise.all(copyTasks);
        const copyDuration = ((performance.now() - copyStart) / 1000).toFixed(2);
        console.log(`✅ All assets copied in parallel (${copyDuration}s)`);
      }
    }
  },
});

// Execute the build
run().catch((error) => {
  console.error('Build script error:', error);
  process.exit(1);
});
