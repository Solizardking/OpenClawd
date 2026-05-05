#!/usr/bin/env node
/**
 * Doctor - verify OpenClawd bootstrap path
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = join(__dirname, '..');

const checks = [
  {
    name: 'Node.js version',
    check: () => {
      const version = process.version.slice(1);
      const [major] = version.split('.').map(Number);
      if (major >= 20) return { ok: true, message: `v${version}` };
      return { ok: false, message: `v${version} (need 20+)` };
    },
  },
  {
    name: 'package.json exists',
    check: () => {
      const exists = existsSync(join(rootDir, 'package.json'));
      return { ok: exists, message: exists ? 'found' : 'missing' };
    },
  },
  {
    name: 'README.md exists',
    check: () => {
      const exists = existsSync(join(rootDir, 'README.md'));
      return { ok: exists, message: exists ? 'found' : 'missing' };
    },
  },
  {
    name: 'LICENSE exists',
    check: () => {
      const exists = existsSync(join(rootDir, 'LICENSE.md'));
      return { ok: exists, message: exists ? 'MIT' : 'missing' };
    },
  },
  {
    name: '.gitignore exists',
    check: () => {
      const exists = existsSync(join(rootDir, '.gitignore'));
      return { ok: exists, message: exists ? 'found' : 'missing' };
    },
  },
  {
    name: 'AGENTS directory exists',
    check: () => {
      const exists = existsSync(join(rootDir, 'agents'));
      return { ok: exists, message: exists ? 'found' : 'missing' };
    },
  },
  {
    name: 'skills directory exists',
    check: () => {
      const exists = existsSync(join(rootDir, 'skills'));
      return { ok: exists, message: exists ? 'found' : 'missing' };
    },
  },
  {
    name: 'scripts directory exists',
    check: () => {
      const exists = existsSync(join(rootDir, 'scripts'));
      return { ok: exists, message: exists ? 'found' : 'missing' };
    },
  },
];

async function registryMode() {
  // Live health check across every service in @openclawdsolana/service-registry.
  // Loaded lazily via dynamic import so the default doctor run doesn't pay the cost.
  const registryEntry = join(rootDir, 'packages/service-registry/dist/index.js');
  const registrySrc = join(rootDir, 'packages/service-registry/src/index.ts');
  if (!existsSync(registryEntry)) {
    if (!existsSync(registrySrc)) {
      console.error('❌ service-registry package missing at packages/service-registry/');
      process.exit(2);
    }
    console.error('⚠️  service-registry not built yet — run: npm --prefix packages/service-registry run build');
    process.exit(2);
  }

  const { healthAll, SERVICES } = await import(registryEntry);

  console.log('🏥 OpenClawd Doctor — service registry health\n');
  const results = await healthAll();
  const nameW = Math.max(...results.map((r) => r.name.length));
  const urlW  = Math.max(...Object.values(SERVICES).map((s) => s.url.length));

  let allOk = true;
  for (const r of results) {
    const cfg = SERVICES[r.name];
    const icon = r.ok ? '🟢' : '🔴';
    const detail = r.ok ? `${r.status} (${r.latencyMs}ms)` : (r.error || 'down');
    console.log(`  ${icon} ${r.name.padEnd(nameW)}  ${cfg.url.padEnd(urlW)}  ${cfg.healthPath.padEnd(14)} ${detail}`);
    if (!r.ok) allOk = false;
  }

  console.log('\n' + '='.repeat(40));
  if (allOk) {
    console.log('✅ All registered services responded.');
    process.exit(0);
  } else {
    console.log('⚠️  Some services are down. Set the relevant env override or start them locally.');
    console.log('    See packages/service-registry/README.md for the env var per service.');
    process.exit(1);
  }
}

async function main() {
  if (process.argv.includes('--registry')) {
    await registryMode();
    return;
  }

  console.log('🏥 OpenClawd Doctor\n');
  console.log('Checking bootstrap requirements...\n');

  let allPassed = true;

  for (const { name, check } of checks) {
    const result = check();
    const status = result.ok ? '✅' : '❌';
    console.log(`  ${status} ${name}: ${result.message}`);
    if (!result.ok) allPassed = false;
  }

  console.log('\n' + '='.repeat(40));

  if (allPassed) {
    console.log('✅ All checks passed - ready to install!\n');
    console.log('Next steps:');
    console.log('  1. npm run install:all');
    console.log('  2. npm run build:catalog');
    console.log('  3. npm run hooks:install');
    console.log('  4. npm run doctor -- --registry   # ping every running service');
    console.log('');
    process.exit(0);
  } else {
    console.log('❌ Some checks failed\n');
    console.log('Please review the issues above before continuing.');
    process.exit(1);
  }
}

main();
