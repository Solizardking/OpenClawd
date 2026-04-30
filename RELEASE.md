# OpenClawd Release Plumbing

How the publishable surfaces find each other after a user runs
`npx @openclawdsolana/installer install`, plus the current rollout state.

> **Last update:** 2026-04-30 — pAGENT family rollout 4 of 6 packages live · ClawdHub on Convex `third-bobcat-386` · legacy → OpenClawd brand sweep complete · gateway HTTP server + `/src` bridge + `/console` route shipping.

---

## What landed since 2026-04-29

- **`@openclawdsolana/pagent-ui@1.6.4`** published — fixed the `rootDir` violation in [chrome-extension/ui/tsconfig.json](chrome-extension/ui/tsconfig.json) by removing the `paths` mapping that pulled `pagent-core`'s source into the ui's compilation unit. Now resolves the dep via `node_modules` from the registry like every other consumer.
- **`@openclawdsolana/clawd-tui@0.2.1`** + **`@openclawdsolana/clawd-code-cli@0.2.3`** + **`@openclawdsolana/percolator@1.0.1`** + **`@openclawdsolana/plugin-sdk@1.1.1`** + **`@openclawdsolana/chat-plugins-gateway@1.9.1`** — full v0.2 cohort live. See top-level [README.md](README.md#v02--solana-aware-terminal--clean-bin-layout) for the consolidated v0.2 banner.
- **`gateway/src/http.ts`** — new HTTP server (Node built-in `http`, no deps) exposing `/health`, `/api/token/overview`, `/api/wallet/portfolio`, `/api/wallet/submit`, `/api/agent/{runtime,skills,clone,text}`, `/api/helius/asset`. Lazy-loads from `/src` for the agent routes with per-module fault isolation. Run with `npm --prefix gateway run http`. Used by the Browser Bridge extension and the new ClawdHub `/console` route.
- **`/src` services** — built `openrouter`, `jupiter`, `memory`, `pumpfun`, `helius`, `birdeye` services so `src/agents/runtime.ts` + `clone.ts` work. Plus a local `tool()` shim at `src/agents/tool.ts` to avoid pulling the whole `@openrouter/agent` SDK at the root.
- **ClawdHub `/console` route** ([clawdhub/src/routes/console.tsx](clawdhub/src/routes/console.tsx)) + **`/marketplace` route** ([clawdhub/src/routes/marketplace.tsx](clawdhub/src/routes/marketplace.tsx)) + **`public/install.sh`** — fixes three 404s on `hub.solanaclawd.com`. The console is the React equivalent of the Lit panel in `frontend/ui`; the marketplace categorizes the catalog with live filter/search.
- **ClawdHub Convex moved** from `frugal-caribou-165` → `third-bobcat-386`. Updated [.env.deploy](clawdhub/.env.deploy) and [vercel.json](clawdhub/vercel.json). All env vars set on the new deployment via `convex env set`.
- **OpenClawd theme overlay** ([clawdhub/src/styles/openclawd-theme.css](clawdhub/src/styles/openclawd-theme.css)) — single CSS file mapping ClawdHub's existing variables to the v0.2 OpenClawd palette. Loaded once in `__root.tsx` so every route picks it up.
- **Legacy brand sweep → OpenClawd** — 50+ files in `clawdhub/src/`, plus `convex/`, `server/`, `netlify/`, `live_chess-main/`, `e2e/`. Domains updated to `openclawd.net` / `seeker.openclawd.net`. Solana (the chain) preserved.
- **Browser Bridge extension v0.2.0** ([chrome-extension/openclawd-chrome-extension/](chrome-extension/openclawd-chrome-extension/)) — CDP relay + Gateway HTTP client + Solana agent wallet (Ed25519, AES-GCM at-rest, PBKDF2 310k, 15-min auto-lock). Published as load-unpacked; CWS submission still TODO.

---

## One install, one config

```text
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

For every CLI surface (bash, Go runtime, services), endpoints resolve in this order:

1. `OPENCLAWD_*` env vars (highest precedence — useful for tests, local registrars).
2. `~/.openclawdsolana/config.json` (written once by `install.sh`).
3. Production defaults at `solanaclawd.com`.

A developer can flip the entire stack onto a local API with a single
`OPENCLAWD_API_BASE=http://localhost:8787` and every CLI/service follows.

---

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
| [`/chrome-extension`](chrome-extension/) | **pAGENT** package family — six npm packages plus the Chrome Web Store extension bundle. See [pAGENT family](#pagent-family) below | Workspaces in the root; install via per-package `npm install --no-workspaces` (see Node 25 caveat). Cross-package deps use `*` and resolve from the registry |
| [`/skills`](skills/) | 98+ skill folders + [`catalog.json`](skills/catalog.json) | Served by the registrar at `/api/skills`; CLIs hit `$OPENCLAWD_API_BASE/skills` |
| [`/extensions`](extensions/) | 31 integration extensions (Telegram, Discord, Signal, Slack, …) | Listed in the manifest; loaded by host apps that opt in |
| [`/src`](src/) | Top-level TS CLI sources (legacy / WIP) | Will be folded into the framework or left as scaffold |

---

## pAGENT family

Browser-side GUI vision agent. Six npm packages in dependency order:

```text
page-controller ──┐
                  ├──► core ──┬──► ui ──┐
llms ─────────────┘           │         ├──► pagent (kitchen sink)
                              └─────────┘
mcp (independent — bridges Claude/Cursor to live browser)
```

| Package | Version | Status | Size | Role |
| --- | --- | --- | --- | --- |
| [`@openclawdsolana/pagent-page-controller`](https://www.npmjs.com/package/@openclawdsolana/pagent-page-controller) | **1.6.3** | ✅ live | 268 KB | DOM ops + element interactions |
| [`@openclawdsolana/pagent-llms`](https://www.npmjs.com/package/@openclawdsolana/pagent-llms) | **1.6.3** | ✅ live | 19 KB | OpenAI / OpenRouter / Anthropic adapters |
| [`@openclawdsolana/pagent-core`](https://www.npmjs.com/package/@openclawdsolana/pagent-core) | **1.6.4** | ✅ live | 765 KB | Vision-agent core (ported from `@page-agent/core`) |
| [`@openclawdsolana/pagent-ui`](https://www.npmjs.com/package/@openclawdsolana/pagent-ui) | **1.6.4** | ✅ live | 1.3 KB | Viewport overlays + screenshot adapters |
| `@openclawdsolana/pagent` | 1.6.3 | ⏳ queued | — | Top-level kitchen sink (depends on all four above) |
| `@openclawdsolana/browser-mcp` | 2.0.0 | ⏳ queued | — | MCP server bridging Claude/Cursor → live browser |

Plus the Chrome Web Store bundle in [`chrome-extension/clawd-agent/`](chrome-extension/clawd-agent/) — manifest v3, sidepanel.html, background.js. **Not** an npm package; built with [`chrome-extension/build-cws.sh`](chrome-extension/build-cws.sh) and submitted at the [Chrome Web Store dev console](https://chrome.google.com/webstore/devconsole).

### pAGENT publish runbook

`workspace:*` doesn't work in npm — internal sibling deps use `*` and resolve from the registry. That means **each package must be published before its dependents try to install**. The order is fixed: page-controller, llms → core → ui → page-agent → mcp.

```bash
cd /Users/8bit/fraud/OpenClawd
ROOT=$PWD

# Loop publishes, halting on any failure. Each cd is in its own subshell so
# subsequent steps still resolve from $ROOT.
for d in page-controller llms core ui page-agent mcp; do
  ( cd $ROOT/chrome-extension/$d \
      && rm -rf node_modules package-lock.json \
      && npm install --no-audit --no-fund --no-workspaces --legacy-peer-deps --prefer-online \
      && npm run --if-present build \
      && npm publish --access public --loglevel verbose 2>&1 | tail -30 ) || break

  # Always verify the publish actually landed (see "Silent reject" below)
  sleep 5
  V=$(npm view "@openclawdsolana/pagent-${d#page-agent}" version 2>&1) || \
    V=$(npm view "@openclawdsolana/pagent" version 2>&1)
  echo "registry: $V"
done
```

### npm 11 gotchas (encountered during this rollout)

1. **`workspace:*` is unsupported.** That's pnpm/yarn syntax. npm `EUNSUPPORTEDPROTOCOL`. Use `*` and rely on the registry resolution after the prior package publishes.
2. **Negative-cache 404.** When `npm install` 404s on a sibling that hadn't been published yet, npm caches the "not found" for the package metadata. After publishing the sibling, the next `npm install` for a dependent package can still see the cached 404. Fix: `--prefer-online`. Belt-and-suspenders: `npm cache clean --force` once.
3. **Silent publish reject.** npm 11.12 can print `+ pkg@x.y.z` from a publish that the registry actually rejected (no error, no warning). Always confirm with `npm view <pkg> version` after every publish. If 404, bump patch (`npm version --no-git-tag-version 1.6.4`) and re-publish with `--loglevel verbose` so the HTTP failure is visible. Hit this on `pagent-core@1.6.3` — required bump to 1.6.4.
4. **Node 25 + npm 11.12 arborist crash.** `npm install` at the repo root currently throws `Cannot read properties of null (reading 'matches')` inside `Link.canDedupe`. This is a known npm-cli regression with Node 25's V8 + workspace `Link` nodes. Workarounds, in order of preference:
   - **Per-package install** with `npm install --no-workspaces --legacy-peer-deps` (what the publish runbook uses). Bypasses the workspace graph entirely.
   - **Downgrade to Node 22 LTS** (`nvm install 22 && nvm use 22`). npm 10.x ships with it and doesn't have this regression.

---

## Other publishable surfaces

### Automaton

```bash
cd $ROOT/automaton-main                && npm publish --access public   # @openclawdsolana/automaton
cd $ROOT/automaton-main/packages/cli   && npm publish --access public   # @openclawdsolana/automaton-cli
```

- The runtime uses `pnpm-workspace.yaml` internally for the `automaton-main/packages/*` sub-graph; both publishes work via plain `npm publish` against the local checkout because the cli's dep on `@openclawdsolana/automaton` is `*` (resolves through the root workspaces glob).
- Required envs at runtime (host inherits these from `~/.openclawdsolana/config.json` or the `OPENCLAWD_*` overrides): `OPENCLAWD_AUTOMATON_API_URL`, `OPENCLAWD_AUTOMATON_API_KEY`. The legacy `CONWAY_API_URL` / `CONWAY_API_KEY` are still honored as a fallback so existing installs don't break on upgrade.
- Bin commands: `automaton`, `openclawd-automaton` (runtime); `automaton-cli`, `openclawd-automaton-cli` (creator CLI). None collide with existing `@openclawdsolana/*` bins per `release:wire`.

### Attestation Agent service

```bash
cd $ROOT/services/attestation-agent && npm publish --access public   # @openclawdsolana/attestation-agent
```

- Depends on the in-repo SAS TS client (`sas-lib`) wired as `file:../../solana-attestation-service-master/clients/typescript`. Run `npm install && npm run build` inside `services/attestation-agent/` before publishing.
- Required envs at runtime: `HELIUS_RPC_URL` (or fallback to `RPC_URL`), plus a Solana keypair (passed as a CLI arg or env, not stored in the package).
- Single bin published: `openclawd-attest`.

### Other npm packages

```bash
cd $ROOT/npm/openclawd-cli       && npm publish --access public
cd $ROOT/npm/openclawd-computer  && npm publish --access public
cd $ROOT/npm/openclawd-installer && npm publish --access public
# …and the rest of the @openclawdsolana/* set (see release-wire output for the full list)
```

---

## The release manifest (`release.manifest.json`)

`npm run release:manifest` (or [`scripts/release-manifest.mjs`](scripts/release-manifest.mjs))
walks the entire repo and emits a single JSON file describing every release
surface — packages, services, skills, extensions, CLI entrypoints, and the
canonical endpoint set.

Two consumers of this file:

- **`api-registrar`** can read it at boot and expose `/manifest` so any
  installed CLI/service can ask the registrar "what does this OpenClawd cluster
  contain?" — discovery without a hardcoded directory.
- **`clawd-cli.sh manifest`** tries `$OPENCLAWD_API_BASE/manifest` first, then
  falls back to the bundled local manifest. Same data, online or offline.
- **CI** can diff the manifest between versions to catch packages or services
  that fell off accidentally.

---

## Release runbook (full)

From the repo root:

```bash
# 1. Sanity
node scripts/release-wire.mjs        # asserts no scope/bin/dep conflicts
                                      # — currently: 39 workspaces, 31 public packages, 22 bins, ✅ clean

# 2. Per-surface build (skip root `npm install` on Node 25 — see gotcha #4 above)
( cd automaton-main             && pnpm install --no-frozen-lockfile && pnpm -r build )

for d in page-controller llms core ui page-agent mcp; do
  ( cd chrome-extension/$d \
      && rm -rf node_modules package-lock.json \
      && npm install --no-audit --no-fund --no-workspaces --legacy-peer-deps --prefer-online \
      && npm run --if-present build )
done

( cd services/attestation-agent && npm install && npm run build )

# 3. Manifest + diff vs last release
npm run release:manifest

# 4. Publish (in dependency order — see pAGENT runbook above for the for-loop)
```

---

## Adding a new surface

1. Drop the package or service into the right folder (`/packages`, `/services`,
   `/extensions`, `/skills`, or a new top-level dir if it's a runtime).
2. Add it to the root `package.json` `workspaces` list if it's a Node workspace.
3. Use the `@openclawdsolana` scope for any public package.
4. Use `*` (not `workspace:*`) for internal sibling deps. They'll resolve from
   the registry once each sibling is published.
5. Run `npm run release:wire` — it will tell you about scope drift, bin
   collisions, or broken cross-package deps.
6. Run `npm run release:manifest` — confirms the new surface is now part of the
   advertised release.
7. If the surface needs an endpoint (API base, gateway, etc.), read it from
   `OPENCLAWD_*` env vars, not a hardcoded URL.
