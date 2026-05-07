#!/usr/bin/env bash
# Idempotent installer for OpenClawd's git hooks.
# Run automatically by `pnpm install` / `npm install` via the `prepare` script,
# and on demand by `pnpm run hooks:install`. Safe to run repeatedly.
set -euo pipefail

repo_root=$(git rev-parse --show-toplevel 2>/dev/null || true)
if [ -z "${repo_root:-}" ]; then
  # Not inside a git checkout (e.g. installed as a tarball dep). Skip silently.
  exit 0
fi

# Don't fight other tooling: if a non-default hooksPath is already set
# (Husky, lefthook, pre-commit framework, etc.), leave it alone but warn so
# the user knows they must wire scan-secrets.mjs into their existing setup.
existing=$(git -C "$repo_root" config --local --get core.hooksPath || true)
if [ -n "${existing:-}" ] && [ "$existing" != ".githooks" ]; then
  echo "openclawd: core.hooksPath already set to '$existing' — leaving as-is."
  echo "openclawd: add a call to 'node scripts/scan-secrets.mjs --staged' from your pre-commit hook to keep secret-scanning enabled."
  exit 0
fi

git -C "$repo_root" config --local core.hooksPath .githooks
chmod +x "$repo_root"/.githooks/pre-commit "$repo_root"/.githooks/pre-push 2>/dev/null || true

echo "openclawd: git hooks installed (.githooks/) — secret scanner active on commit and push."
