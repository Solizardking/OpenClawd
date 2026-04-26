#!/usr/bin/env node
/**
 * Install git hooks for OpenClawd
 * Blocks accidental secret commits
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const gitHooksDir = join(__dirname, '..', '.git', 'hooks');

const preCommitHook = `#!/bin/sh
# OpenClawd pre-commit hook - blocks secret commits

echo "🔒 Checking for secrets..."

# Run guard-secrets on staged files
node scripts/guard-secrets.mjs --staged

if [ $? -ne 0 ]; then
  echo "❌ Commit blocked: secrets detected in staged files"
  exit 1
fi

echo "✅ No secrets detected"
exit 0
`;

const prePushHook = `#!/bin/sh
# OpenClawd pre-push hook - runs hygiene checks

echo "🔍 Running pre-push hygiene checks..."

node scripts/guard-secrets.mjs --worktree
if [ $? -ne 0 ]; then
  echo "❌ Push blocked: secrets detected"
  exit 1
fi

node scripts/brand-check.mjs
if [ $? -ne 0 ]; then
  echo "❌ Push blocked: brand check failed"
  exit 1
fi

echo "✅ Pre-push checks passed"
exit 0
`;

function install() {
  if (!existsSync(gitHooksDir)) {
    mkdirSync(gitHooksDir, { recursive: true });
  }

  // Install pre-commit hook
  writeFileSync(join(gitHooksDir, 'pre-commit'), preCommitHook, { mode: 0o755 });
  console.log('✅ Installed pre-commit hook');

  // Install pre-push hook
  writeFileSync(join(gitHooksDir, 'pre-push'), prePushHook, { mode: 0o755 });
  console.log('✅ Installed pre-push hook');

  console.log('\\n🛡️  OpenClawd git hooks installed successfully');
  console.log('   - pre-commit: blocks secrets in staged files');
  console.log('   - pre-push: runs hygiene checks');
}

install();
