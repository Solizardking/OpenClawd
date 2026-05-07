#!/usr/bin/env node
// Build the plugin.delivery sub-monorepo (sdk + gateway). Uses pnpm if
// available, falls back to per-package builds via npm scripts.

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const candidates = [
  resolve(REPO, 'plugins/plugin.delivery'),
  resolve(REPO, 'plugin.delivery'),
];
const PD = candidates.find((candidate) => existsSync(candidate));

if (!PD) {
  console.error(`✖ plugin.delivery not found at ${candidates.join(' or ')}`);
  process.exit(1);
}

function has(cmd) {
  try {
    execSync(`command -v ${cmd}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function run(cmd, cwd) {
  console.log(`  $ ${cmd}  (cwd: ${cwd.replace(REPO, '.')})`);
  execSync(cmd, { stdio: 'inherit', cwd });
}

const usePnpm = has('pnpm');

// SDK first — gateway depends on it
const sdk = resolve(PD, 'packages/sdk');
if (existsSync(resolve(sdk, 'package.json'))) {
  if (usePnpm) run('pnpm --filter @openclawdsolana/plugin-sdk build', PD);
  else run('npm run build --if-present', sdk);
}

const gateway = resolve(PD, 'packages/gateway');
if (existsSync(resolve(gateway, 'package.json'))) {
  if (usePnpm) run('pnpm --filter @openclawdsolana/chat-plugins-gateway build', PD);
  else run('npm run build --if-present', gateway);
}

console.log('  ✓ plugin.delivery build complete');
