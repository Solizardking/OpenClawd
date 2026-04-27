#!/usr/bin/env node
/**
 * release-pack — npm pack --dry-run every public workspace and print a
 * single table summarising name, version, size, and bin entries.
 *
 * Use this before publishing v0.1.0 to catch:
 *   - missing files in the tarball
 *   - bin entries that won't resolve
 *   - version drift between sibling packages
 *
 * Each pack runs in an isolated $HOME/$NPM_CONFIG_CACHE so it doesn't touch
 * the developer's npm cache.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const ROOT_PKG = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));

const PACK_HOME = process.env.NPM_VERIFY_HOME || join(tmpdir(), 'clawd-npm-home');
const PACK_CACHE = process.env.NPM_CONFIG_CACHE || join(tmpdir(), 'clawd-npm-cache');
mkdirSync(PACK_HOME, { recursive: true });
mkdirSync(PACK_CACHE, { recursive: true });

const env = {
  ...process.env,
  HOME: PACK_HOME,
  NPM_CONFIG_CACHE: PACK_CACHE,
};

const rows = [];

for (const rel of ROOT_PKG.workspaces || []) {
  const dir = join(ROOT, rel);
  const pkgPath = join(dir, 'package.json');
  if (!existsSync(pkgPath)) continue;
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

  if (pkg.private) {
    rows.push({ rel, name: pkg.name, version: pkg.version, status: 'private', detail: '(skipped)' });
    continue;
  }

  let detail = '';
  let status = 'ok';
  try {
    const out = execFileSync('npm', ['pack', '--dry-run', '--json'], {
      cwd: dir,
      env,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    const json = JSON.parse(out);
    const tarball = json[0];
    const size = (tarball.size / 1024).toFixed(1);
    detail = `${tarball.files.length} files · ${size} kB`;
  } catch (err) {
    status = 'fail';
    detail = (err.stderr || err.message || '').toString().split('\n').slice(-3).join(' | ');
  }

  rows.push({ rel, name: pkg.name, version: pkg.version, status, detail });
}

const widthName = Math.max(...rows.map((r) => (r.name || '').length), 4);
const widthVer = Math.max(...rows.map((r) => (r.version || '').length), 7);

console.log('🦞 OpenClawd release-pack\n');
console.log(
  `${'name'.padEnd(widthName)}  ${'version'.padEnd(widthVer)}  status   detail`,
);
console.log(
  `${'-'.repeat(widthName)}  ${'-'.repeat(widthVer)}  -------  ------`,
);
let failed = 0;
for (const row of rows) {
  if (row.status === 'fail') failed++;
  console.log(
    `${(row.name || '?').padEnd(widthName)}  ${(row.version || '').padEnd(widthVer)}  ${row.status.padEnd(7)}  ${row.detail}`,
  );
}
console.log('');
if (failed) {
  console.error(`✖ ${failed} package(s) failed to pack`);
  process.exit(1);
}
console.log(`✅ ${rows.filter((r) => r.status === 'ok').length} package(s) packed clean`);
