#!/usr/bin/env node
/**
 * release-manifest — emit a single JSON describing every release surface.
 *
 * Output: $REPO/release.manifest.json (also stdout when --stdout passed).
 *
 * Categories:
 *   packages    — npm workspaces declared in root package.json
 *   services    — long-running processes under /services and /gateway and /api-registrar
 *   skills      — entries in skills/catalog.json (canonical) + scanned SKILL.md folders
 *   extensions  — directories under /extensions (one per integration)
 *   plugins     — entries from packages/plugin-package-contract registrations
 *   cli         — bash entrypoints in /cli plus the Go runtime
 *
 * Used by:
 *   - api-registrar to expose `/manifest` for discovery
 *   - the MCP server to publish capability metadata
 *   - clawd-cli.sh `manifest` subcommand to print "what's installed locally"
 *   - CI to assert nothing fell off the release between versions
 */

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const ROOT_PKG = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const ARGS = new Set(process.argv.slice(2));

function safeRead(p) {
  try { return readFileSync(p, 'utf8'); } catch { return null; }
}
function safeJson(p) {
  const t = safeRead(p);
  if (!t) return null;
  try { return JSON.parse(t); } catch { return null; }
}
function listDirs(p) {
  if (!existsSync(p)) return [];
  return readdirSync(p)
    .filter((n) => !n.startsWith('.'))
    .filter((n) => {
      try { return statSync(join(p, n)).isDirectory(); } catch { return false; }
    });
}

// --- packages: npm workspaces ----------------------------------------------
const packages = (ROOT_PKG.workspaces || []).map((rel) => {
  const pkg = safeJson(join(ROOT, rel, 'package.json')) || {};
  return {
    path: rel,
    name: pkg.name || null,
    version: pkg.version || null,
    private: !!pkg.private,
    bin: pkg.bin || null,
    description: pkg.description || null,
  };
});

// --- services ---------------------------------------------------------------
const services = [];
for (const rel of ['gateway', 'api-registrar', ...listDirs(join(ROOT, 'services')).map((d) => `services/${d}`)]) {
  const dir = join(ROOT, rel);
  if (!existsSync(dir)) continue;
  const pkg = safeJson(join(dir, 'package.json'));
  const goMod = safeRead(join(dir, 'go.mod'));
  const dockerfile = existsSync(join(dir, 'Dockerfile'));
  const railway = existsSync(join(dir, 'railway.toml'));
  const procfile = existsSync(join(dir, 'Procfile'));
  services.push({
    path: rel,
    name: pkg?.name || `@openclawdsolana/${rel.split('/').pop()}`,
    version: pkg?.version || null,
    runtime: pkg ? 'node' : goMod ? 'go' : existsSync(join(dir, 'requirements.txt')) ? 'python' : 'unknown',
    description: pkg?.description || null,
    deployment: { docker: dockerfile, railway, procfile },
    scripts: pkg?.scripts ? Object.keys(pkg.scripts) : [],
  });
}

// --- skills ----------------------------------------------------------------
const skillsCatalog = safeJson(join(ROOT, 'skills', 'catalog.json')) || [];
const skillsScanned = listDirs(join(ROOT, 'skills'))
  .filter((slug) => existsSync(join(ROOT, 'skills', slug, 'SKILL.md')) || existsSync(join(ROOT, 'skills', slug, 'README.md')))
  .map((slug) => ({ slug, path: `skills/${slug}` }));
const skills = {
  count: skillsScanned.length,
  catalog: skillsCatalog,
  scanned: skillsScanned,
};

// --- extensions ------------------------------------------------------------
const extensions = listDirs(join(ROOT, 'extensions')).map((slug) => {
  const pkg = safeJson(join(ROOT, 'extensions', slug, 'package.json'));
  return {
    slug,
    path: `extensions/${slug}`,
    name: pkg?.name || `@openclawdsolana/ext-${slug}`,
    version: pkg?.version || null,
    description: pkg?.description || null,
  };
});

// --- apps (terminal UIs, code CLI, router, agents) -------------------------
const APP_DIRS = ['clawd-code-cli', 'clawd-tui', 'clawdrouter', 'clawdhub', 'moltbook-agent', 'agents'];
const apps = APP_DIRS
  .filter((d) => existsSync(join(ROOT, d, 'package.json')))
  .map((d) => {
    const pkg = safeJson(join(ROOT, d, 'package.json')) || {};
    return {
      path: d,
      name: pkg.name || null,
      version: pkg.version || null,
      private: !!pkg.private,
      bin: pkg.bin || null,
      description: pkg.description || null,
    };
  });

// --- mcp servers (any package.json under /mcp + chrome-extension/mcp + services/*/mcp)
const mcp = [];
for (const candidate of [
  'mcp',
  'mcp/vault-mcp',
  'mcp/wurk-mcp',
  'chrome-extension/mcp',
  'services/agent-wallet/mcp',
]) {
  const pkg = safeJson(join(ROOT, candidate, 'package.json'));
  if (!pkg) continue;
  mcp.push({
    path: candidate,
    name: pkg.name,
    version: pkg.version,
    description: pkg.description || null,
    bin: pkg.bin || null,
  });
}

// --- chrome extension parts ------------------------------------------------
const chromeExtension = listDirs(join(ROOT, 'chrome-extension')).map((slug) => {
  const pkg = safeJson(join(ROOT, 'chrome-extension', slug, 'package.json'));
  return {
    slug,
    path: `chrome-extension/${slug}`,
    name: pkg?.name || null,
    version: pkg?.version || null,
    private: !!pkg?.private,
  };
});

// --- api endpoints (subprojects under /api) --------------------------------
const apiSubprojects = [];
function walk(dir, depth = 0, base = '') {
  if (depth > 3) return;
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry.startsWith('.')) continue;
    const full = join(dir, entry);
    let st;
    try { st = statSync(full); } catch { continue; }
    if (!st.isDirectory()) continue;
    const pkgPath = join(full, 'package.json');
    const path = base ? `api/${base}/${entry}` : `api/${entry}`;
    if (existsSync(pkgPath)) {
      const pkg = safeJson(pkgPath) || {};
      apiSubprojects.push({
        path,
        name: pkg.name || null,
        version: pkg.version || null,
        private: !!pkg.private,
      });
    } else {
      walk(full, depth + 1, base ? `${base}/${entry}` : entry);
    }
  }
}
walk(join(ROOT, 'api'));

// --- cli entrypoints -------------------------------------------------------
const cli = {
  bash: ['cli/clawd-cli.sh', 'cli/clawd-connect.sh', 'cli/clawd-config.sh'].filter((p) => existsSync(join(ROOT, p))),
  configLoader: 'cli/clawd-config.sh',
  installer: 'install.sh',
  runtimeBin: '~/.openclawdsolana/bin/openclawd',
};

// --- endpoints (mirrors the canonical config that install.sh writes) ------
const endpoints = {
  apiBase: 'https://solanaclawd.com/api',
  gatewayBase: 'https://solanaclawd.com/x402',
  marketplaceBase: 'https://solanaclawd.com/marketplace',
  mcpBase: 'https://solanaclawd.com/mcp',
  registrarBase: 'https://solanaclawd.com/registrar',
  solanaRpc: 'https://api.mainnet-beta.solana.com',
  sasProgramId: '22zoJMtdu4tQc2PzL74ZUT7FrwgB1Udec8DdW4yw4BdG',
  override: 'set OPENCLAWD_API_BASE / OPENCLAWD_GATEWAY_BASE etc. in env, or edit ~/.openclawdsolana/config.json',
};

const manifest = {
  schema: 'openclawd-release-manifest/2',
  generatedAt: new Date().toISOString(),
  version: ROOT_PKG.version || '0.0.0',
  scope: '@openclawdsolana',
  repository: ROOT_PKG.repository || null,
  endpoints,
  cli,
  packages,
  apps,
  mcp,
  services,
  skills,
  extensions,
  chromeExtension,
  api: apiSubprojects,
  totals: {
    packages: packages.length,
    publicPackages: packages.filter((p) => !p.private && p.name).length,
    apps: apps.length,
    mcp: mcp.length,
    services: services.length,
    skills: skillsScanned.length,
    extensions: extensions.length,
    chromeExtension: chromeExtension.length,
    apiSubprojects: apiSubprojects.length,
  },
};

const out = JSON.stringify(manifest, null, 2);
const target = join(ROOT, 'release.manifest.json');
writeFileSync(target, out + '\n');

if (ARGS.has('--stdout')) {
  process.stdout.write(out + '\n');
} else {
  console.log('🦞 OpenClawd release manifest written');
  console.log(`   ${target}`);
  console.log(`   packages:    ${manifest.totals.packages} (${manifest.totals.publicPackages} public)`);
  console.log(`   apps:        ${manifest.totals.apps}`);
  console.log(`   mcp servers: ${manifest.totals.mcp}`);
  console.log(`   services:    ${manifest.totals.services}`);
  console.log(`   skills:      ${manifest.totals.skills}`);
  console.log(`   extensions:  ${manifest.totals.extensions}`);
  console.log(`   chrome-ext:  ${manifest.totals.chromeExtension}`);
  console.log(`   api sub:     ${manifest.totals.apiSubprojects}`);
}
