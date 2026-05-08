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

find_node() {
  if command -v node >/dev/null 2>&1; then
    command -v node
    return 0
  fi

  for candidate in /opt/homebrew/bin/node /usr/local/bin/node "$HOME"/.nvm/versions/node/*/bin/node; do
    if [ -x "$candidate" ]; then
      echo "$candidate"
      return 0
    fi
  done

  return 1
}

NODE_BIN="$(find_node)"
if [ -z "$NODE_BIN" ]; then
  echo "❌ Commit blocked: node is required to run scripts/guard-secrets.mjs"
  echo "   Install Node.js >=20 or ensure node is on PATH for git hooks."
  exit 127
fi

# Run guard-secrets on staged files
"$NODE_BIN" scripts/guard-secrets.mjs --staged

status=$?
if [ $status -ne 0 ]; then
  echo "❌ Commit blocked: secrets detected in staged files"
  exit $status
fi

echo "✅ No secrets detected"
exit 0
`;

const prePushHook = `#!/bin/sh
# OpenClawd pre-push hook - runs hygiene checks

echo "🔍 Running pre-push hygiene checks..."

find_node() {
  if command -v node >/dev/null 2>&1; then
    command -v node
    return 0
  fi

  for candidate in /opt/homebrew/bin/node /usr/local/bin/node "$HOME"/.nvm/versions/node/*/bin/node; do
    if [ -x "$candidate" ]; then
      echo "$candidate"
      return 0
    fi
  done

  return 1
}

NODE_BIN="$(find_node)"
if [ -z "$NODE_BIN" ]; then
  echo "❌ Push blocked: node is required to run hygiene checks"
  echo "   Install Node.js >=20 or ensure node is on PATH for git hooks."
  exit 127
fi

"$NODE_BIN" scripts/guard-secrets.mjs --worktree
if [ $? -ne 0 ]; then
  echo "❌ Push blocked: secrets detected"
  exit 1
fi

"$NODE_BIN" scripts/brand-check.mjs
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

  console.log('\n🛡️  OpenClawd git hooks installed successfully');
  console.log('   - pre-commit: blocks secrets in staged files');
  console.log('   - pre-push: runs hygiene checks');
}

install();
