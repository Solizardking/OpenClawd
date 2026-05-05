#!/usr/bin/env node
/**
 * Upload OpenClawd framework source to a Browser Use workspace.
 *
 *   POST /api/v3/workspaces/{id}/files/upload  (declare files, get presigned URLs)
 *   PUT  <presignedUrl>                        (upload bytes)
 *
 * Required env:
 *   BROWSER_USE_API_KEY        Browser Use API key
 *
 * Optional env / flags:
 *   BROWSER_USE_WORKSPACE_ID   default e112d4ea-a250-4036-8ed7-f66c564911b5
 *   BROWSER_USE_BASE_URL       default https://api.browser-use.com/api/v3
 *   --dry-run                  list what would be uploaded; no network calls
 *   --prefix=<str>             subdirectory inside the workspace (default empty)
 *   --concurrency=<n>          parallel PUTs (default 8)
 *   --max-file-bytes=<n>       skip files larger than this (default 25 MB)
 */

import { readFileSync, statSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { extname, basename } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');

const args = process.argv.slice(2);
const argMap = Object.fromEntries(
  args
    .filter((a) => a.startsWith('--'))
    .map((a) => {
      const eq = a.indexOf('=');
      return eq < 0 ? [a.slice(2), 'true'] : [a.slice(2, eq), a.slice(eq + 1)];
    }),
);

const DRY_RUN = 'dry-run' in argMap;
const PREFIX = argMap.prefix ?? '';
const CONCURRENCY = Math.max(1, Number(argMap.concurrency ?? 8));
const MAX_FILE_BYTES = Number(argMap['max-file-bytes'] ?? 25 * 1024 * 1024);
const WORKSPACE_ID =
  process.env.BROWSER_USE_WORKSPACE_ID ?? 'e112d4ea-a250-4036-8ed7-f66c564911b5';
const BASE_URL = (process.env.BROWSER_USE_BASE_URL ?? 'https://api.browser-use.com/api/v3').replace(
  /\/+$/,
  '',
);
const API_KEY = process.env.BROWSER_USE_API_KEY;

if (!DRY_RUN && !API_KEY) {
  console.error('error: BROWSER_USE_API_KEY is required (or pass --dry-run)');
  process.exit(2);
}

// ---------------------------------------------------------------------------
// Include / exclude rules. Repo-relative paths (POSIX-style) are matched.
// Order: a path is uploaded if any INCLUDE matches AND no EXCLUDE matches.
// ---------------------------------------------------------------------------

const INCLUDE_DIRS = [
  // Framework + canonical docs
  'openclawd-framework/src',
  'openclawd-framework/examples',
  // Packages — source + meta only
  'packages',
  // npm bootstrappers
  'packages/npm',
  // Apps the user explicitly called out
  'apps/blockchain_buddies/src',
  'apps/blockchain_buddies/components',
  'apps/blockchain_buddies/lib',
  'apps/blockchain_buddies/packages',
  'apps/blockchain_buddies/pets',
  'apps/clawd-code-cli/src',
  'apps/clawd-code-cli/lib',
  'apps/clawd-tui/src',
  // Skills + Robotics docs
  'skills',
  'Robotics/docs/THESIS.md',
  'Robotics/README.md',
  'Robotics/LICENSE.md',
];

const INCLUDE_TOP_FILES = [
  'README.md',
  'STACK.md',
  'ONBOARDING.md',
  'RELEASE.md',
  'ARTICLE.md',
  'LICENSE',
  'package.json',
  'pnpm-workspace.yaml',
  'tsconfig.json',
];

// Match anywhere in the path (any segment).
const EXCLUDE_SEGMENTS = new Set([
  'node_modules',
  '.git',
  'dist',
  'build',
  '.next',
  '.nitro',
  '.turbo',
  '.cache',
  'target',
  'coverage',
  '.nyc_output',
  '.sessions',
  '.clawd',
  '.openclawd',
  '.honcho',
  '.mcp',
  '.mcp-cache',
  '.e2b',
  'session-logs',
  '.vercel',
  '.netlify',
  '.output',
  '.pnpm-store',
]);

// Match as a path prefix (specific subdirectories, not arbitrary segments).
const EXCLUDE_PATHS = [
  // Vendored upstreams (huge, not authored here)
  'Robotics/Isaac-GR00T-main',
  'blockchain/lightweight-charts-master',
  'solana-attestation-service-master',
  // Composite TS build outputs
  'packages/membrain/bin',
  'lib/composite',
  'lib/prod',
];

const EXCLUDE_FILE_PATTERNS = [
  // Secrets and keypairs
  /(^|\/)\.env(\.|$)/,
  /keypair.*\.json$/i,
  /(^|\/)id\.json$/,
  /wallet.*\.json$/i,
  /\.pem$/,
  /\.key$/,
  /\.p8$/,
  /\.jwk$/,
  // Lockfiles + bulky archives
  /package-lock\.json$/,
  /pnpm-lock\.yaml$/,
  /yarn\.lock$/,
  /bun\.lockb$/,
  /\.tgz$/,
  /\.zip$/,
  /\.tsbuildinfo$/,
  // OS junk
  /\.DS_Store$/,
  // Logs
  /\.log$/,
  // TS build outputs at any depth
  /(^|\/)dist\//,
  /(^|\/)\.next\//,
];

// ---------------------------------------------------------------------------
// Filesystem walk
// ---------------------------------------------------------------------------

function toPosix(p) {
  return p.split(sep).join('/');
}

function isExcluded(relPath) {
  const posix = toPosix(relPath);
  // Any path segment matching the deny set blocks the whole tree below it.
  for (const seg of posix.split('/')) {
    if (EXCLUDE_SEGMENTS.has(seg)) return true;
  }
  for (const dir of EXCLUDE_PATHS) {
    if (posix === dir || posix.startsWith(dir + '/')) return true;
  }
  for (const re of EXCLUDE_FILE_PATTERNS) {
    if (re.test(posix)) return true;
  }
  return false;
}

async function walk(absDir, out) {
  let entries;
  try {
    entries = await readdir(absDir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const abs = join(absDir, entry.name);
    const rel = toPosix(relative(ROOT, abs));
    if (isExcluded(rel)) continue;
    if (entry.isDirectory()) {
      await walk(abs, out);
    } else if (entry.isFile()) {
      let st;
      try {
        st = statSync(abs);
      } catch {
        continue;
      }
      if (st.size === 0) continue;
      if (st.size > MAX_FILE_BYTES) {
        process.stderr.write(`skip (too big, ${st.size} B): ${rel}\n`);
        continue;
      }
      out.push({ abs, rel, size: st.size });
    }
  }
}

async function collectFiles() {
  const out = [];
  for (const top of INCLUDE_TOP_FILES) {
    const abs = join(ROOT, top);
    try {
      const st = statSync(abs);
      if (st.isFile()) out.push({ abs, rel: top, size: st.size });
    } catch {
      // missing top-level file — skip silently
    }
  }
  for (const dir of INCLUDE_DIRS) {
    const abs = join(ROOT, dir);
    let st;
    try {
      st = statSync(abs);
    } catch {
      continue;
    }
    if (st.isFile()) {
      out.push({ abs, rel: dir, size: st.size });
    } else if (st.isDirectory()) {
      await walk(abs, out);
    }
  }
  // Dedupe by rel path
  const seen = new Set();
  return out.filter((f) => (seen.has(f.rel) ? false : (seen.add(f.rel), true)));
}

// ---------------------------------------------------------------------------
// Content-type guesser. Browser Use defaults to application/octet-stream.
// ---------------------------------------------------------------------------

const CONTENT_TYPES = {
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.yaml': 'application/yaml; charset=utf-8',
  '.yml': 'application/yaml; charset=utf-8',
  '.toml': 'application/toml; charset=utf-8',
  '.ts': 'text/typescript; charset=utf-8',
  '.tsx': 'text/typescript; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.cjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.go': 'text/x-go; charset=utf-8',
  '.py': 'text/x-python; charset=utf-8',
  '.sh': 'text/x-shellscript; charset=utf-8',
  '.rs': 'text/x-rust; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
};

function contentTypeFor(rel) {
  return CONTENT_TYPES[extname(rel).toLowerCase()] ?? 'application/octet-stream';
}

// ---------------------------------------------------------------------------
// Workspace name collision: Browser Use's `name` is 1-255 chars and the path
// in the workspace is `${prefix}${name}`. To preserve directory structure we
// pass the full relative path as `name` (with `/` separators). 255-char limit
// is enforced by trimming overly long paths to a hashed form.
// ---------------------------------------------------------------------------

import { createHash } from 'node:crypto';

function workspaceName(rel) {
  if (rel.length <= 250) return rel;
  // Path too long — preserve extension + last segment, prepend hash
  const ext = extname(rel);
  const base = basename(rel, ext).slice(0, 40);
  const hash = createHash('sha1').update(rel).digest('hex').slice(0, 12);
  return `_long/${hash}-${base}${ext}`;
}

// ---------------------------------------------------------------------------
// Browser Use API calls
// ---------------------------------------------------------------------------

async function declareUploads(batch) {
  const url = `${BASE_URL}/workspaces/${WORKSPACE_ID}/files/upload${PREFIX ? `?prefix=${encodeURIComponent(PREFIX)}` : ''}`;
  const body = {
    files: batch.map((f) => ({
      name: workspaceName(f.rel),
      contentType: contentTypeFor(f.rel),
      size: f.size,
    })),
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Browser-Use-API-Key': API_KEY,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`declareUploads ${res.status} ${res.statusText}: ${txt.slice(0, 400)}`);
  }
  return res.json();
}

async function putBytes(presignedUrl, abs, contentType) {
  const buf = readFileSync(abs);
  const res = await fetch(presignedUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType, 'Content-Length': String(buf.byteLength) },
    body: buf,
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`PUT ${res.status} ${res.statusText}: ${txt.slice(0, 200)}`);
  }
}

async function uploadBatch(batch) {
  const declared = await declareUploads(batch);
  const ctMap = new Map(batch.map((f) => [workspaceName(f.rel), contentTypeFor(f.rel)]));
  const fileMap = new Map(batch.map((f) => [workspaceName(f.rel), f.abs]));
  // Bounded concurrency over the presigned URLs returned for this batch
  let i = 0;
  const errors = [];
  const workers = Array.from({ length: Math.min(CONCURRENCY, declared.files.length) }, async () => {
    while (i < declared.files.length) {
      const idx = i++;
      const item = declared.files[idx];
      const abs = fileMap.get(item.name);
      const ct = ctMap.get(item.name) ?? 'application/octet-stream';
      try {
        await putBytes(item.uploadUrl, abs, ct);
      } catch (err) {
        errors.push({ name: item.name, error: err.message });
      }
    }
  });
  await Promise.all(workers);
  return { uploaded: declared.files.length - errors.length, errors };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

async function main() {
  console.log(`workspace : ${WORKSPACE_ID}`);
  console.log(`base url  : ${BASE_URL}`);
  console.log(`prefix    : ${PREFIX || '(none)'}`);
  console.log(`mode      : ${DRY_RUN ? 'dry-run' : 'upload'}`);
  console.log('');

  console.log('walking repo…');
  const files = await collectFiles();
  files.sort((a, b) => a.rel.localeCompare(b.rel));
  const totalBytes = files.reduce((s, f) => s + f.size, 0);
  console.log(`  ${files.length} files · ${fmtBytes(totalBytes)} total`);
  console.log('');

  if (DRY_RUN) {
    for (const f of files) console.log(`  ${fmtBytes(f.size).padStart(10)}  ${f.rel}`);
    console.log('');
    console.log('dry-run only — re-run without --dry-run and with BROWSER_USE_API_KEY set to upload.');
    return;
  }

  let uploaded = 0;
  let failed = 0;
  const allErrors = [];
  const BATCH = 10; // Browser Use cap
  for (let i = 0; i < files.length; i += BATCH) {
    const batch = files.slice(i, i + BATCH);
    process.stdout.write(`  [${i + batch.length}/${files.length}] uploading…`);
    try {
      const { uploaded: n, errors } = await uploadBatch(batch);
      uploaded += n;
      failed += errors.length;
      allErrors.push(...errors);
      process.stdout.write(`\r  [${i + batch.length}/${files.length}] ✓ ${uploaded} uploaded${failed ? ` · ${failed} failed` : ''}\n`);
    } catch (err) {
      failed += batch.length;
      allErrors.push({ name: '(batch)', error: err.message });
      process.stdout.write(`\r  [${i + batch.length}/${files.length}] ✗ batch failed: ${err.message}\n`);
    }
  }

  console.log('');
  console.log(`done: ${uploaded} uploaded · ${failed} failed`);
  if (allErrors.length) {
    console.log('first 10 errors:');
    for (const e of allErrors.slice(0, 10)) console.log(`  - ${e.name}: ${e.error}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
