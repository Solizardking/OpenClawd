#!/usr/bin/env node
/**
 * release-wire — verify the OpenClawd release packages are internally consistent.
 *
 * Walks every package declared in the root package.json `workspaces`, then asserts:
 *
 *   1. Public packages use the @openclawdsolana scope (or are private).
 *   2. No two public packages claim the same `bin` command.
 *   3. Every workspace dep that names another local package resolves to a
 *      sibling listed in `workspaces`.
 *   4. `bin` entries point at files that exist on disk (or under a `dist/`
 *      that the package's `build` script will produce — flagged as a hint,
 *      not a hard fail).
 *
 * Exit 0 = clean. Exit 1 = problems printed to stderr.
 */

import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const ROOT_PKG = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));

const ALLOWED_SCOPES = new Set(['@openclawdsolana']);
const PRIVATE_OK_SCOPES = new Set(['@openclawdsolana']);

const errors = [];
const warnings = [];

function loadWorkspace(rel) {
  const dir = join(ROOT, rel);
  const pkgPath = join(dir, 'package.json');
  if (!existsSync(pkgPath)) {
    errors.push(`workspace ${rel} is listed in root but has no package.json`);
    return null;
  }
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  return { rel, dir, pkg };
}

const workspaces = (ROOT_PKG.workspaces || []).map(loadWorkspace).filter(Boolean);

const byName = new Map();
for (const ws of workspaces) {
  if (!ws.pkg.name) {
    errors.push(`${ws.rel}: package.json has no name`);
    continue;
  }
  if (byName.has(ws.pkg.name)) {
    errors.push(`duplicate package name: ${ws.pkg.name} (in ${byName.get(ws.pkg.name).rel} and ${ws.rel})`);
  }
  byName.set(ws.pkg.name, ws);
}

// 1. Scope check.
for (const ws of workspaces) {
  const { name, private: isPrivate } = ws.pkg;
  if (!name) continue;
  if (name.startsWith('@')) {
    const scope = name.split('/')[0];
    if (isPrivate ? !PRIVATE_OK_SCOPES.has(scope) : !ALLOWED_SCOPES.has(scope)) {
      errors.push(`${ws.rel}: scope ${scope} not in allowed set ${[...ALLOWED_SCOPES].join(', ')}`);
    }
  } else if (!isPrivate) {
    warnings.push(`${ws.rel}: public package "${name}" is unscoped — consider @openclawdsolana/${name}`);
  }
}

// 2. Bin collisions.
const binToPkgs = new Map();
for (const ws of workspaces) {
  const bin = ws.pkg.bin;
  if (!bin) continue;
  const entries = typeof bin === 'string'
    ? [[ws.pkg.name, bin]]
    : Object.entries(bin);
  for (const [cmd, target] of entries) {
    if (!binToPkgs.has(cmd)) binToPkgs.set(cmd, []);
    binToPkgs.get(cmd).push({ pkg: ws.pkg.name, target, rel: ws.rel });
  }
}
for (const [cmd, owners] of binToPkgs) {
  if (owners.length > 1) {
    const intentional = new Set(owners.map((o) => o.pkg));
    // The three runtime bootstrappers (cli/computer/installer) all expose
    // `openclawd`, `openclawdsolana`, `clawd` on purpose — they each install
    // the same Go binary into the same path. That's expected, not a bug.
    const isRuntimeAlias =
      [...intentional].every((n) => n.startsWith('@openclawdsolana/') &&
        ['cli', 'computer', 'installer'].includes(n.split('/')[1]));
    // The TUI surface also publishes a `clawd` bin per v0.2 (the OpenRouter-
    // native lobster terminal). Users can install either the Go bootstrapper
    // OR clawd-tui — npm picks the last-wins, that's the documented contract.
    const isTuiClawd = cmd === 'clawd' &&
      [...intentional].every((n) =>
        n === '@openclawdsolana/clawd-tui' ||
        (n.startsWith('@openclawdsolana/') &&
          ['cli', 'computer', 'installer'].includes(n.split('/')[1])));
    if (!isRuntimeAlias && !isTuiClawd) {
      errors.push(`bin command "${cmd}" claimed by multiple packages: ${owners.map((o) => `${o.pkg} (${o.rel})`).join(', ')}`);
    }
  }
}

// 3. Cross-package deps must resolve to workspaces or external.
function depResolves(name, range) {
  if (!byName.has(name)) return true;
  if (typeof range !== 'string') return false;
  // Internal dep — accept file: links, workspace: protocol, or any range
  // whose stripped version matches the workspace publish version.
  if (range.startsWith('file:') || range.startsWith('workspace:')) return true;
  const peer = byName.get(name).pkg;
  if (range === '*' || range === 'latest' || range === peer.version) return true;
  // Strip leading ^/~/>=/= and compare on the bare version. npm-level
  // resolution will handle the actual range satisfaction; we just want
  // to know it's pointing at the same publish.
  const stripped = range.replace(/^[~^>=<\s]+/, '').trim();
  return stripped === peer.version;
}
for (const ws of workspaces) {
  const deps = { ...(ws.pkg.dependencies || {}), ...(ws.pkg.devDependencies || {}) };
  for (const [name, range] of Object.entries(deps)) {
    if (byName.has(name) && !depResolves(name, range)) {
      warnings.push(`${ws.rel}: depends on ${name}@${range}, but workspace publishes ${byName.get(name).pkg.version} — use file: link or matching version`);
    }
    // catch the historical typo `@openclawd/leviathan` (missing the `solana`)
    if (name === '@openclawd/leviathan') {
      errors.push(`${ws.rel}: depends on @openclawd/leviathan — should be @openclawdsolana/leviathan`);
    }
  }
}

// 4. Bin targets exist.
for (const ws of workspaces) {
  const bin = ws.pkg.bin;
  if (!bin) continue;
  const entries = typeof bin === 'string' ? [[null, bin]] : Object.entries(bin);
  for (const [cmd, target] of entries) {
    const abs = join(ws.dir, target);
    if (!existsSync(abs)) {
      // dist/ files only exist after build — flag as a build prerequisite.
      const cmdLabel = cmd ? `${cmd}→` : '';
      if (target.includes('dist/')) {
        warnings.push(`${ws.rel}: bin target ${cmdLabel}${target} not present (run \`npm run build:release\` first)`);
      } else {
        errors.push(`${ws.rel}: bin target ${cmdLabel}${target} does not exist`);
      }
    }
  }
}

// Report.
console.log('🦞 OpenClawd release-wire audit');
console.log(`   workspaces: ${workspaces.length}`);
console.log(`   public packages: ${workspaces.filter((w) => !w.pkg.private).length}`);
console.log(`   bin commands: ${binToPkgs.size}`);
console.log('');

if (warnings.length) {
  console.log('Warnings:');
  for (const w of warnings) console.log(`  ! ${w}`);
  console.log('');
}

if (errors.length) {
  console.error('Errors:');
  for (const e of errors) console.error(`  ✖ ${e}`);
  process.exit(1);
}

console.log('✅ release wiring is consistent');
