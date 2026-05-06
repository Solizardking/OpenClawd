#!/usr/bin/env node
// OpenClawd plugin.delivery dependency installer.
// Install dependencies for the plugin.delivery sub-monorepo.
// plugin.delivery uses pnpm workspaces (its own pnpm-workspace.yaml), not npm
// workspaces, so we shell out to pnpm here. If pnpm isn't available we fall
// back to a per-package npm install loop, which works but is slower.

import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PD = resolve(REPO, 'plugin.delivery');

if (!existsSync(PD)) {
  console.error(`✖ plugin.delivery not found at ${PD}`);
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

if (has('pnpm')) {
  run('pnpm install --frozen-lockfile=false', PD);
} else {
  console.warn('  ! pnpm not found — falling back to per-package npm install');
  console.warn('    For best results: npm install -g pnpm');
  for (const sub of ['packages/sdk', 'packages/gateway']) {
    const dir = resolve(PD, sub);
    if (existsSync(dir)) run('npm install --no-audit --no-fund --legacy-peer-deps', dir);
  }
}

console.log('  ✓ plugin.delivery dependencies installed');
