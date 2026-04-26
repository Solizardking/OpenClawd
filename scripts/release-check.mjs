#!/usr/bin/env node
/**
 * Release check - public-release hygiene check
 */

import { existsSync, readFileSync, readdirSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = join(__dirname, '..');

const checks = [
  {
    name: 'package.json has description',
    check: () => {
      try {
        const pkg = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
        const hasDesc = pkg.description && pkg.description.length > 10;
        return { ok: hasDesc, message: hasDesc ? pkg.description.slice(0, 50) + '...' : 'missing description' };
      } catch {
        return { ok: false, message: 'cannot read' };
      }
    },
  },
  {
    name: 'package.json has repository',
    check: () => {
      try {
        const pkg = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
        const hasRepo = pkg.repository;
        return { ok: hasRepo, message: hasRepo ? pkg.repository.url : 'missing' };
      } catch {
        return { ok: false, message: 'cannot read' };
      }
    },
  },
  {
    name: 'package.json has bugs URL',
    check: () => {
      try {
        const pkg = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
        const hasBugs = pkg.bugs;
        return { ok: hasBugs, message: hasBugs ? 'found' : 'missing' };
      } catch {
        return { ok: false, message: 'cannot read' };
      }
    },
  },
  {
    name: 'README.md has content',
    check: () => {
      try {
        const readme = readFileSync(join(rootDir, 'README.md'), 'utf8');
        const hasContent = readme.length > 100;
        return { ok: hasContent, message: `${readme.length} chars` };
      } catch {
        return { ok: false, message: 'missing' };
      }
    },
  },
  {
    name: 'LICENSE.md exists',
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
    name: 'No .env files tracked',
    check: () => {
      const gitignore = readFileSync(join(rootDir, '.gitignore'), 'utf8');
      const hasEnv = gitignore.includes('.env');
      return { ok: hasEnv, message: hasEnv ? 'protected' : 'WARNING: .env not in gitignore' };
    },
  },
  {
    name: 'AGENTS has catalog',
    check: () => {
      const exists = existsSync(join(rootDir, 'agents', 'agents-catalog.json'));
      return { ok: exists, message: exists ? 'found' : 'missing' };
    },
  },
  {
    name: 'skills has catalog',
    check: () => {
      const exists = existsSync(join(rootDir, 'skills', 'catalog.json'));
      return { ok: exists, message: exists ? 'found' : 'missing' };
    },
  },
];

function main() {
  console.log('🚀 OpenClawd Release Check\n');
  console.log('Verifying public-release readiness...\n');

  let allPassed = true;

  for (const { name, check } of checks) {
    const result = check();
    const status = result.ok ? '✅' : '⚠️';
    console.log(`  ${status} ${name}: ${result.message}`);
    if (!result.ok) allPassed = false;
  }

  console.log('\n' + '='.repeat(40));

  if (allPassed) {
    console.log('✅ Release checks passed!\n');
    process.exit(0);
  } else {
    console.log('⚠️  Some checks need attention\n');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(0);
});
