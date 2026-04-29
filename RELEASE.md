# OpenClawd Release Plumbing

How the eight release surfaces find each other after a user runs
`npx @openclawdsolana/installer install`.

## One install, one config

```
                       ┌────────────────────────────────────────────┐
                       │   npx @openclawdsolana/installer install   │
                       │   npx @openclawdsolana/cli install         │
                       │   npx @openclawdsolana/computer install    │
                       └─────────────────────┬──────────────────────┘
                                             │
                                             ▼
                       ┌─────────────── /install.sh ────────────────┐
                       │ 1. clone / refresh repo                     │
                       │ 2. go build → ~/.openclawdsolana/bin/...    │
                       │ 3. write   ~/.openclawdsolana/config.json   │ ◀── canonical
                       └────────────────────────────────────────────┘     endpoint registry
                                             │
                ┌────────────────────────────┼─────────────────────────────────┐
                │                            │                                 │
                ▼                            ▼                                 ▼
         /cli (bash)                 ~/.openclawdsolana/                Go runtime
   clawd-cli.sh, clawd-connect.sh    bin/openclawd, bin/clawd, ...      (`openclawd daemon`,
   source clawd-config.sh which                                          `openclawd gateway`)
   reads config.json                                                      reads config.json
                │
                └─── env override: OPENCLAWD_API_BASE, OPENCLAWD_GATEWAY_BASE,
                                   OPENCLAWD_MARKETPLACE, OPENCLAWD_MCP_BASE,
                                   OPENCLAWD_REGISTRAR_BASE, OPENCLAWD_SOLANA_RPC
```

## Endpoint resolution order

For every CLI surface (bash, Go runtime, services), endpoints resolve in this order:

1. `OPENCLAWD_*` env vars (highest precedence — useful for tests, local registrars).
2. `~/.openclawdsolana/config.json` (written once by `install.sh`).
3. Production defaults at `solanaclawd.com`.

This means a developer can flip the entire stack onto a local API with a single
`OPENCLAWD_API_BASE=http://localhost:8787` and every CLI/service follows.

## Surfaces and how they connect

| Surface | What it is | How it discovers the rest |
| --- | --- | --- |
| [`/npm`](npm/) | Three publish-ready bootstrappers (`@openclawdsolana/{cli,computer,installer}`) | Each runs `install.sh`, which writes `config.json` |
| [`/install.sh`](install.sh) | Top-level installer. Clones, builds the Go binary, writes `config.json` | Curled by the npm bootstrappers; also runnable standalone |
| [`/cli`](cli/) | Bash entrypoints (`clawd-cli.sh`, `clawd-connect.sh`) | Source [`clawd-config.sh`](cli/clawd-config.sh) to load endpoints |
| [`/packages`](packages/) | TypeScript libs (wallets, percolator, x402, membrain, honcho-bridge, plugin SDK) — all `@openclawdsolana/*` | Consumed by `npm install` against the published packages or via the workspace at the root |
| [`/openclawd-framework`](openclawd-framework/) | Leviathan TS framework + `clawd-code` + `clawd-standalone` | Linked via root `npm workspaces`. Bin names (`leviathan`, `clawd-code`, `clawd-standalone`) deliberately don't collide with the Go runtime's `openclawd` / `clawd` |
| [`/gateway`](gateway/) | `@openclawdsolana/gateway` — Telegram + Helius + Birdeye Solana control plane | Reads endpoint env vars (matching the `OPENCLAWD_*` set) so it can be deployed against any registrar |
| [`/api-registrar`](api-registrar/) | `@openclawdsolana/api-registrar` — issues per-user API keys with X-verification | Should serve `/manifest` (see below) so other surfaces can discover it |
| [`/services`](services/) | `agent-wallet` (Go), `pump-scanner-cron` (Python), `hermes-vault`, `attestation-agent` (TS — Solana Attestation Service notary + MPL Core birth ceremony) | Each declared in `release.manifest.json`; deploy artifacts (`Dockerfile`, `Procfile`, `railway.toml`) detected by the manifest generator |
| [`/llm-wiki-tang`](llm-wiki-tang/) | OpenClawd AutoResearch Wiki — FastAPI `/api/v1/research/*` (chain · defi · market) over Birdeye + Helius DAS + Helius Wallet API, autonomous research loop persisted to `research_runs` | Native Python service; reads `BIRDEYE_API_KEY` + `HELIUS_API_KEY` + `HELIUS_RPC_URL`; Next.js + MCP server siblings inside the same directory |
| [`/automaton-main`](automaton-main/) | `@openclawdsolana/automaton` + `@openclawdsolana/automaton-cli` — sovereign self-replicating AI agent runtime (heartbeat daemon, sense→think→strike→drift loop, on-chain identity via SAS, self-versioned `shell.md`, skill replication) | Workspace at the monorepo root; install via `npm run install:automaton`; build via `npm run build:automaton` (chained into `build:release`). Endpoints resolved as `OPENCLAWD_AUTOMATON_API_URL` → legacy `CONWAY_API_URL` → built-in default |
| [`/chrome-extension`](chrome-extension/) | **pAGENT** package family — `@openclawdsolana/pagent` (top-level), `@openclawdsolana/pagent-core` (vision agent), `@openclawdsolana/pagent-llms` (OpenAI/OpenRouter adapters), `@openclawdsolana/pagent-page-controller` (DOM ops), `@openclawdsolana/pagent-ui` (overlays), `@openclawdsolana/browser-mcp` (MCP server bridging Claude/Cursor → live browser). Plus the Chrome extension bundle in [`chrome-extension/clawd-agent`](chrome-extension/clawd-agent/) for the Web Store | Workspaces in the root; install via `npm run install:pagent`; build via `npm run build:pagent` (chained into `build:release`). Cross-package deps use `workspace:*` |
| [`/skills`](skills/) | 98+ skill folders + [`catalog.json`](skills/catalog.json) | Served by the registrar at `/api/skills`; CLIs hit `$OPENCLAWD_API_BASE/skills` |
| [`/extensions`](extensions/) | 31 integration extensions (Telegram, Discord, Signal, Slack, …) | Listed in the manifest; loaded by host apps that opt in |
| [`/src`](src/) | Top-level TS CLI sources (legacy / WIP) | Will be folded into the framework or left as scaffold |

## The release manifest (`release.manifest.json`)

`npm run release:manifest` (or [`scripts/release-manifest.mjs`](scripts/release-manifest.mjs))
walks the entire repo and emits a single JSON file describing every release
surface — packages, services, skills, extensions, CLI entrypoints, and the
canonical endpoint set.

Two consumers of this file:

- **`api-registrar`** can read it at boot and expose `/manifest` so any
  installed CLI/service can ask the registrar "what does this OpenClawd cluster
  contain?" — discovery without a hardcoded directory.
- **`clawd-cli.sh manifest`** (added in this pass) tries
  `$OPENCLAWD_API_BASE/manifest` first, then falls back to the bundled local
  manifest. Same data, online or offline.
- **CI** can diff the manifest between versions to catch packages or services
  that fell off accidentally.

## Release runbook

From the repo root:

```bash
npm install                     # workspaces wire all 17 internal packages
npm run release:wire            # asserts no scope/bin/dep conflicts
npm run release:manifest        # regenerates release.manifest.json
npm run build:release           # builds dist/ for every package that needs one
npm run release:pack            # `npm pack --dry-run` every public workspace
```

Then publish per-package:

```bash
cd npm/openclawd-cli       && npm publish --access public
cd npm/openclawd-computer  && npm publish --access public
cd npm/openclawd-installer && npm publish --access public

# Automaton runtime + creator CLI
cd automaton-main                && npm publish --access public   # @openclawdsolana/automaton
cd automaton-main/packages/cli   && npm publish --access public   # @openclawdsolana/automaton-cli

# pAGENT family — publish in dependency order. Each `cd` is run from $ROOT
# (= /Users/8bit/fraud/OpenClawd) inside its own subshell, and each install
# uses --no-workspaces so siblings resolve from the registry (where each
# previously-published step is now available). On Node 25 + npm 11.12 you
# CANNOT run `npm install` at the root because of arborist's canDedupe bug;
# install + build + publish per package as below.
ROOT=/Users/8bit/fraud/OpenClawd
for d in page-controller llms core ui page-agent mcp; do
  ( cd $ROOT/chrome-extension/$d \
      && rm -rf node_modules package-lock.json \
      && npm install --no-audit --no-fund --no-workspaces --legacy-peer-deps \
      && npm run --if-present build \
      && npm publish --access public ) || break
done

# Status (2026-04-29):
#   ✅ @openclawdsolana/pagent-page-controller@1.6.3   (live · 268 KB)
#   ✅ @openclawdsolana/pagent-llms@1.6.3              (live ·  19 KB)
#   ✅ @openclawdsolana/pagent-core@1.6.4              (live · 765 KB)  ← bumped from 1.6.3 silent-reject
#   ⏳ @openclawdsolana/pagent-ui@1.6.3                (next — depends on pagent-core)
#   ⏳ @openclawdsolana/pagent@1.6.3                   (kitchen sink — depends on all four)
#   ⏳ @openclawdsolana/browser-mcp@2.0.0              (independent)
#
# Two npm-side gotchas hit during this rollout:
#   1. Negative-cache: `npm install` 404s on a sibling you JUST published
#      because npm cached the earlier "not found". Re-run with --prefer-online.
#   2. Silent publish reject: npm 11 can print `+ pkg@1.6.3` from a publish
#      that the registry actually rejected. Always confirm with `npm view <pkg>
#      version` after every publish; if 404, bump patch and re-publish with
#      `--loglevel verbose` so the HTTP failure is visible.

# Attestation Agent service
cd services/attestation-agent       && npm publish --access public   # @openclawdsolana/attestation-agent

# …and the rest of the @openclawdsolana/* set
```

### Automaton publish notes

- The runtime uses `pnpm-workspace.yaml` internally for the `automaton-main/packages/*` sub-graph; both publishes work via plain `npm publish` against the local checkout because the cli's `workspace:*` dep resolves through the root `package.json` workspaces glob.
- Required envs at runtime (host inherits these from `~/.openclawdsolana/config.json` or the `OPENCLAWD_*` overrides): `OPENCLAWD_AUTOMATON_API_URL`, `OPENCLAWD_AUTOMATON_API_KEY`. The legacy `CONWAY_API_URL` / `CONWAY_API_KEY` are still honored as a fallback so existing installs don't break on upgrade.
- Bin commands published: `automaton`, `openclawd-automaton` (runtime), and `automaton-cli`, `openclawd-automaton-cli` (creator CLI). None collide with existing `@openclawdsolana/*` bins per `release:wire`.

### pAGENT publish notes

- The browser-side family ships as five separate npm packages (plus `browser-mcp`) so embedders can pull just the layer they need (`-core` alone for headless use, the top-level `@openclawdsolana/pagent` for the kitchen-sink build).
- Build order matters because of the dependency graph: **page-controller → llms → core → ui → page-agent**. The `install:pagent` and `build:pagent` root scripts walk this order; for direct publishing, the `for d in …; do … done` block above does the same.
- Internal sibling deps use `*` (not `workspace:*`) — npm 11 doesn't speak the workspace protocol. With `--no-workspaces`, each `npm install` resolves siblings from the **registry**, which is why the order matters: each publish makes the next install possible.
- **Node 25 + npm 11.12 caveat:** `npm install` at the repo root currently crashes inside arborist's `canDedupe` (a known npm-cli regression). Use the per-package `cd $ROOT/chrome-extension/X && npm install --no-workspaces …` flow above, or downgrade to Node 22 LTS.
- **Negative-cache gotcha:** when a `npm install` 404s on a sibling that hasn't been published yet, npm caches the "not found" for the package metadata. After publishing the sibling, the next `npm install` for a dependent package can still see the cached 404. Add `--prefer-online` to force-refresh, or run `npm cache clean --force` once.
- The MCP server (`@openclawdsolana/browser-mcp`) was already on the OpenClawd scope; nothing to rename — just `cd chrome-extension/mcp && npm publish --access public`.
- The Chrome extension bundle in [`chrome-extension/clawd-agent`](chrome-extension/clawd-agent/) is the **Chrome Web Store** artifact (manifest v3, sidepanel.html, background.js). It is **not** an npm package — package it via [`chrome-extension/build-cws.sh`](chrome-extension/build-cws.sh) and submit at the [Chrome Web Store dev console](https://chrome.google.com/webstore/devconsole). The npm packages above are the embeddable libraries; the extension is the user-facing product that consumes them.

### Attestation Agent publish notes

- Depends on the in-repo SAS TS client (`sas-lib`) wired as `file:../../solana-attestation-service-master/clients/typescript`. Run `npm install && npm run build` inside `services/attestation-agent/` before publishing.
- Required envs at runtime: `HELIUS_RPC_URL` (or fallback to `RPC_URL`), plus a Solana keypair (passed as a CLI arg or env, not stored in the package).
- Single bin published: `openclawd-attest`.

## Adding a new surface

1. Drop the package or service into the right folder (`/packages`, `/services`,
   `/extensions`, `/skills`).
2. Add it to the root `package.json` `workspaces` list if it's a Node workspace.
3. Use the `@openclawdsolana` scope for any public package.
4. Run `npm run release:wire` — it will tell you about scope drift, bin
   collisions, or broken cross-package deps.
5. Run `npm run release:manifest` — confirms the new surface is now part of the
   advertised release.
6. If the surface needs an endpoint (API base, gateway, etc.), read it from
   `OPENCLAWD_*` env vars, not a hardcoded URL.
