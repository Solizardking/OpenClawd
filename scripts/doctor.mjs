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

function main() {
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
    console.log('');
    process.exit(0);
  } else {
    console.log('❌ Some checks failed\n');
    console.log('Please review the issues above before continuing.');
    process.exit(1);
  }
}

main();
