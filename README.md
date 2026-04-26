<div align="center">

# 🦞 OpenClawd 🦞

### *“Claws that code, brains that deploy.”*

**A red-shelled, Solana-native AI agent stack — routing, orchestration, payments, skills, MCP, browser automation, and local or hosted inference.**

[![🦞 $CLAWD](https://img.shields.io/badge/%F0%9F%A6%9E%20%24CLAWD-Buy%20on%20Jupiter-FF3B30?style=for-the-badge)](https://jup.ag/swap/SOL-8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump)
[![Site](https://img.shields.io/badge/site-solanaclawd.com-FF6B35?style=for-the-badge&logo=safari&logoColor=white)](https://solanaclawd.com)
[![GitHub](https://img.shields.io/badge/GitHub-clawdsolana%2FOpenClawd-E63946?style=for-the-badge&logo=github&logoColor=white)](https://github.com/clawdsolana/OpenClawd)
[![Telegram](https://img.shields.io/badge/Telegram-%40clawdtoken-D62828?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/clawdtoken)
[![X clawddevs](https://img.shields.io/badge/X-%40clawddevs-FB6F92?style=for-the-badge&logo=x&logoColor=white)](https://x.com/clawddevs)
[![X 0rdlibrary](https://img.shields.io/badge/X-%400rdlibrary-FFB4A2?style=for-the-badge&logo=x&logoColor=white)](https://x.com/0rdlibrary)

[![License: MIT](https://img.shields.io/badge/License-MIT-FF1744?style=for-the-badge)](./LICENSE.md)
[![Node](https://img.shields.io/badge/Node-20%2B-FF5252?style=for-the-badge&logo=node.js&logoColor=white)](./.nvmrc)
[![Solana](https://img.shields.io/badge/Solana-native-14F195?style=for-the-badge&logo=solana&logoColor=black)](https://solana.com)
[![MCP](https://img.shields.io/badge/MCP-compatible-FF8C42?style=for-the-badge)](https://modelcontextprotocol.io)

</div>

```
                              🦞  $CLAWD  🦞
   ╭────────────────────────────────────────────────────────────────╮
   │                                                                │
   │    ██████╗██╗      █████╗ ██╗    ██╗██████╗                    │
   │   ██╔════╝██║     ██╔══██╗██║    ██║██╔══██╗                   │
   │   ██║     ██║     ███████║██║ █╗ ██║██║  ██║                   │
   │   ██║     ██║     ██╔══██║██║███╗██║██║  ██║                   │
   │   ╚██████╗███████╗██║  ██║╚███╔███╔╝██████╔╝                   │
   │    ╚═════╝╚══════╝╚═╝  ╚═╝ ╚══╝╚══╝ ╚═════╝                    │
   │                                                                │
   │          ◢█◣   red shell · sharp claws · on-chain   ◢█◣        │
   ╰────────────────────────────────────────────────────────────────╯
                           🦀  forged on Solana  🦀
```

## 🆕 Latest (2026-04-25)

**🧠 Membrain — selective memory for Solana trading agents — integrated.**

The memory layer for OpenClawd trading agents now lives in-tree at [`packages/membrain/`](./packages/membrain/). It is a Go daemon (`membraned`) with a 15-method gRPC API, SQLite/Postgres+pgvector backends, decay/consolidation schedulers, and TypeScript ([`@gustycube/membrane`](./packages/membrain/clients/typescript/)) + Python ([`membrane`](./packages/membrain/clients/python/)) SDKs. Memory is typed (`episodic`, `semantic`, `competence`, `working`, `plan_graph`) and revisable — supersede, fork, retract, merge, contest, reinforce, and penalize records with full provenance.

| Action | Command |
| --- | --- |
| Build daemon | `npm run build:membrain` (or `make build` in `packages/membrain/`) |
| Run daemon | `npm run dev:membrain` — listens on `:9090` by default |
| Build TS SDK | `npm run build:membrain-ts` |
| Run Go tests | `npm run test:membrain` |
| Postgres + pgvector | `docker compose -f packages/membrain/docker-compose.yml up -d` |

OpenClaw plugin bridge ([`packages/membrain/clients/openclawd/`](./packages/membrain/clients/openclawd/)) provides episodic memory ingestion, the `membrane_search` tool, `before_agent_start` auto-context injection, and a `/membrane` status command. Sister packages — [`packages/membrain-types/`](./packages/membrain-types/) (shared TS types) and [`packages/memory-host-sdk/`](./packages/memory-host-sdk/) (host runtime + engine modules) — compose Membrain into the rest of the stack. Full docs in [`packages/membrain/README.md`](./packages/membrain/README.md); the integration overview lives in [MEMEBRANE.md](./MEMEBRANE.md).

## 🆕 Latest (2026-04-24)

**Rebrand: OpenClawd → OpenClawd.** The hub, catalog, CLI, and public domain have been unified under the OpenClawd brand. The public site moved to [`solanaclawd.com`](https://solanaclawd.com).

### What shipped

- **`@openclawdsolana/cli@0.8.0`** — hub CLI (install, update, search, publish agent skills). Renamed from `@openclawdsolana/clawdhub`; bins `openclawd` + `clawdhub` (legacy alias). Source at [clawdhub/packages/clawdhub](clawdhub/packages/clawdhub). `DEFAULT_SITE`/`DEFAULT_REGISTRY` now point at `solanaclawd.com`.
- **`@openclawdsolana/clawd-code-cli@0.1.0`** — Clawd Code CLI (ink + OpenAI SDK) packaged for publish. Source/dist at [clawd-code-cli](clawd-code-cli); ships `dist/`, README, LICENSE only.
- **`@openclawdsolana/clawd-tui@0.1.0`** — OpenClawd agent TUI, greenfield scaffold built on [`@openrouter/agent`](https://npmjs.com/package/@openrouter/agent) with the full default tool belt (file_read/write/edit, glob, grep, list_dir, shell) plus OpenRouter server tools (web_search, datetime). CLAWD ASCII banner, `block` input style, `grouped` tool display, session persistence, slash commands (`/model`, `/new`, `/help`). Source at [clawd-tui](clawd-tui).

### OpenRouter OAuth (PKCE)

The TUI supports two OAuth flows so users never have to paste an API key:

| Flag | Flow |
| --- | --- |
| *(default)* | Opens `https://solanaclawd.com/auth/callback` — user copies the code shown on that page and pastes into the terminal. Code verifier stays in the CLI, so PKCE is preserved. |
| `--local-callback` | Loopback HTTP server on `127.0.0.1:<port>` — captures the code automatically. Useful when the web callback isn't reachable or not yet allowlisted by OpenRouter. |
| `--login` | Force re-login (ignores cached key at `~/.config/openclawd/openrouter-key`). |

Web-callback UI lives at [clawdhub/src/routes/auth/callback.tsx](clawdhub/src/routes/auth/callback.tsx) — if the URL has `?code=`, renders a copy-button card; otherwise falls back to the Phantom `ConnectBox`.

### Catalog + routing

- Catalog generator renamed: `bun run generate:openclawd-catalog` → emits [clawdhub/src/lib/generated/openclawdCatalog.ts](clawdhub/src/lib/generated/openclawdCatalog.ts) (60 packages, 94 skills).
- Hub route moved: `/openclawd` → [`/hub`](clawdhub/src/routes/hub.tsx). New [`/gateway`](clawdhub/src/routes/gateway.tsx) top-level stub linking to `/setup/gateway`.
- `publicSiteUrl`, `skillsHubUrl`, and all default URL helpers now resolve to `https://solanaclawd.com`. Covered by 9 passing tests in [clawdhub/src/lib/site.test.ts](clawdhub/src/lib/site.test.ts).

### Deploy targets

[clawdhub/scripts/deploy-prod.sh](clawdhub/scripts/deploy-prod.sh) dropped Netlify/Railway cases in favor of:

| Target | Preset | Required env |
| --- | --- | --- |
| **Vercel** | `NITRO_PRESET=vercel` via `bun run build:vercel` | `VERCEL_TOKEN` (+ optional `VERCEL_SCOPE`, `VERCEL_PROJECT_NAME`) |
| **Fly** | `NITRO_PRESET=node-server` via `bun run build:fly` | `FLY_API_TOKEN` (+ optional `FLY_APP`) |
| **Convex** | `bun run convex:deploy` | `CONVEX_DEPLOY_KEY`, `CONVEX_SITE_URL`, `VITE_CONVEX_URL` |

Convex prod deploy is live at [`https://frugal-caribou-165.convex.cloud`](https://frugal-caribou-165.convex.cloud) — contract verification passes (360 identifiers match).

### Publishing

Under the `@openclawdsolana` npm org:

```bash
# Hub CLI
cd clawdhub/packages/clawdhub && npm publish --access=public

# Clawd Code CLI (existing ink-based)
cd clawd-code-cli && npm publish --access=public

# OpenRouter-native TUI (new)
cd clawd-tui && npm publish --access=public
```

---

## ⛓️ Solana Attestation Service (SAS) — NEW

**Formally verified skills and agents on-chain via QEDGen Lean 4 proofs and Hermès vault protocol.**

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Solana Attestation Service                        │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │  Credential │  │   Schema    │  │ Attestation │                 │
│  │  (Issuer)   │  │  (Structure)│  │  (Proof)    │                 │
│  └─────────────┘  └─────────────┘  └─────────────┘                 │
│         │                │                │                          │
│         └────────────────┴────────────────┘                          │
│                           │                                          │
│    ┌─────────────────────┼─────────────────────┐                  │
│    │                     │                     │                    │
│    ▼                     ▼                     ▼                    │
│ ┌──────────┐      ┌──────────┐         ┌──────────┐               │
│ │  Skill   │      │  Agent   │         │  Vault   │               │
│ │Attestation│     │ Identity │         │Integration│              │
│ └──────────┘      └──────────┘         └──────────┘               │
└─────────────────────────────────────────────────────────────────────┘
```

### Program Addresses

| Component | Address |
| --- | --- |
| **SAS Program ID** | `22zoJMtdu4tQc2PzL74ZUT7FrwgB1Udec8DdW4yw4BdG` |
| Token Program (Token-2022) | `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb` |
| Event Authority PDA | `DzSpKpST2TSyrxokMXchFz3G2yn5WEGoxzpGEUDjCX4g` |

### Verification Pipeline

```
Agent → QEDGen → Lean 4 Proof → proof_hash → SAS Attestation → On-chain
```

1. Agent requests formal verification via QEDGen
2. QEDGen generates Lean 4 proofs for skill capabilities
3. Proof compilation produces `proof_hash`
4. Attestation created with `proof_hash` and stored on-chain
5. Any party can verify attestation trustlessly

### Key Components

| Component | Path |
| --- | --- |
| Attestation Program | [`solana-attestation-service-master/`](./solana-attestation-service-master/) |
| SAS Skill | [`skills/solana-attestation-skill/`](./skills/solana-attestation-skill/) |
| Attested Agent Template | [`AGENTS/agent-template-attested.json`](./AGENTS/agent-template-attested.json) |
| Attested Plugin Template | [`plugin.delivery/plugin-template-attested.json`](./plugin.delivery/plugin-template-attested.json) |
| CLI Attestation Commands | [`CLI/clawd-cli.sh`](./CLI/clawd-cli.sh) (run `./clawd-cli.sh attest:status`) |

### CLI Usage

```bash
# Create skill attestation
./CLI/clawd-cli.sh attest:skill --skill qedgen-solana --verifier QEDGenVault

# Verify attestation
./CLI/clawd-cli.sh attest:verify --address 7xK9...mP2

# Create agent identity with vault
./CLI/clawd-cli.sh attest:agent --agent my-agent --wallet A123...xyz

# Initialize vault
./CLI/clawd-cli.sh attest:vault --agent my-agent --wallet A123...xyz
```

### Agent Wallet at Birth

Agents are born with vault-protected wallets via **Hermès Vault Protocol**:
- Wallet created at agent birth
- Initialized in Hermès vault immediately
- Multi-signature required for vault operations
- Emergency recovery via vault protocol

```typescript
// Agent Identity Schema
{
  layout: [12, 32, 12, 32, 1],  // String, Pubkey, String, Pubkey, Bool
  field_names: [
    "agent_id",
    "wallet_pubkey",
    "skill_attestation",
    "vault_address",
    "is_vault_initialized"
  ]
}
```

---

## 🧠 Membrain Memory Layer

**Selective, revisable memory for Solana trading agents.** Trading-bot context windows reset; append-only RAG never learns. Membrain gives agents typed memory records that decay, consolidate, and revise themselves with full provenance — so a trader doesn't just remember a swap, it learns whether the strategy worked.

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Membrain (membraned)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  Ingestion ──► Policy ──► Storage ──► Retrieval ──► Revision         │
│  (events,    (sensitivity, (SQLite /  (trust-gated, (supersede,      │
│   trades,     decay         Postgres   layered      fork, retract,   │
│   obs,        profiles,    +pgvector,  selection)   merge, contest,  │
│   outcomes)   classifier)  encrypted                 reinforce,      │
│                            audit log)                penalize)       │
│                                                                       │
│  Background:  Decay (hourly)  ·  Consolidation (6h, LLM-extracts     │
│                                   patterns into competence + facts)  │
└─────────────────────────────────────────────────────────────────────┘
       │                                  │                    │
       ▼                                  ▼                    ▼
   gRPC :9090                      TypeScript SDK         Python SDK
   15 methods                  @gustycube/membrane      `membrane`
```

### Memory Types

| Type | Purpose | Trading example |
| --- | --- | --- |
| `episodic` | Immutable event capture | Jupiter swap: SOL → USDC, 2.3 SOL, slippage 0.8% |
| `working` | Active position state | "Long 500K $CLAWD at $0.0032, stop-loss $0.0028" |
| `semantic` | Stable market facts | "$CLAWD liquidity peaks 2–4pm UTC" |
| `competence` | Strategies with success rates | "Mean reversion on graduated pump.fun: win rate 72%" |
| `plan_graph` | Reusable DeFi workflows | check liquidity → set slippage → swap → verify → log P&L |

### Deployment Tiers

| Tier | Backend | Embedding | LLM | Use case |
| --- | --- | --- | --- | --- |
| 1 | SQLite (SQLCipher-encrypted) | — | — | Single-agent bot, zero infra |
| 2 | Postgres | — | — | Multi-agent deployment |
| 3 | Postgres + pgvector | yes | — | Strategy similarity search, pattern matching |
| 4 | Postgres + pgvector | yes | yes | Auto-extract market patterns from trade history |

### Membrain Quick Start

```bash
# Build and run with the default SQLite backend
npm run build:membrain
npm run dev:membrain                  # listens on :9090

# Postgres + pgvector
docker compose -f packages/membrain/docker-compose.yml up -d
./packages/membrain/bin/membraned --postgres-dsn \
  postgres://membrane:membrane@localhost:5432/membrane_test?sslmode=disable
```

```ts
import { MembraneClient, Sensitivity } from "@gustycube/membrane";

const m = new MembraneClient("localhost:9090", { apiKey: process.env.MEMBRAIN_API_KEY });

await m.ingestEvent("swap_executed", "jupiter#42", {
  summary: "Swapped 2.3 SOL → 1,450 USDC via Jupiter, slippage 0.8%",
  tags: ["jupiter", "swap"],
});

const records = await m.retrieve("evaluate SOL/USDC swap", {
  trust: { max_sensitivity: Sensitivity.MEDIUM, authenticated: true, scopes: [] },
  memoryTypes: ["competence", "semantic"],
});
```

### Membrain Components

| Component | Path |
| --- | --- |
| Daemon (`membraned`) | [`packages/membrain/cmd/membraned/`](./packages/membrain/cmd/membraned/) |
| gRPC API + protos | [`packages/membrain/api/`](./packages/membrain/api/) |
| Core library | [`packages/membrain/pkg/membrane/`](./packages/membrain/pkg/membrane/) |
| Storage backends | [`packages/membrain/pkg/storage/`](./packages/membrain/pkg/storage/) |
| Decay / consolidation / revision | [`packages/membrain/pkg/decay/`](./packages/membrain/pkg/decay/), [`pkg/consolidation/`](./packages/membrain/pkg/consolidation/), [`pkg/revision/`](./packages/membrain/pkg/revision/) |
| TypeScript SDK | [`packages/membrain/clients/typescript/`](./packages/membrain/clients/typescript/) |
| Python SDK | [`packages/membrain/clients/python/`](./packages/membrain/clients/python/) |
| OpenClaw plugin bridge | [`packages/membrain/clients/openclawd/`](./packages/membrain/clients/openclawd/) |
| Shared TS types | [`packages/membrain-types/`](./packages/membrain-types/) |
| Host runtime SDK | [`packages/memory-host-sdk/`](./packages/memory-host-sdk/) |
| Integration overview | [MEMEBRANE.md](./MEMEBRANE.md) · [packages/membrain/README.md](./packages/membrain/README.md) · [packages/membrain/rfc.md](./packages/membrain/rfc.md) |

---

> 🦞 **$CLAWD CA:** `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump`
> 🌐 [solanaclawd.com](https://solanaclawd.com) · 🐙 [github.com/clawdsolana/OpenClawd](https://github.com/clawdsolana/OpenClawd) · 💬 [t.me/clawdtoken](https://t.me/clawdtoken) · 🐦 [@clawddevs](https://x.com/clawddevs) · 📚 [@0rdlibrary](https://x.com/0rdlibrary)

OpenClawd is the public monorepo behind the 🦞 Clawd ecosystem — an orchestrator, model router, wallet tooling, x402/AP2 payment rails, MCP servers, browser surfaces, package libraries, edge workers, and a large checked-in skill and agent catalog so teams can fork one repo and ship chain-native AI products quickly.

## What Ships

| Area | Paths | What it covers |
| --- | --- | --- |
| Surfaces | [`chrome-extension/`](./chrome-extension/), [`tailclawd/`](./tailclawd/), [`clawd-cloud-os/`](./clawd-cloud-os/), [`Apps/`](./Apps/) | Browser agent surface, terminal UI, cloud OS, companion apps |
| Runtime | [`openclawd-stack/`](./openclawd-stack/), [`src/`](./src/), [`openclawd/`](./openclawd/) | Orchestration, gateway, wallets, MCP runtime, Solana agent framework |
| Routing and payments | [`clawdrouter/`](./clawdrouter/), [`workers/`](./workers/), [`services/`](./services/), [`x402/`](./x402/) | Model routing, x402 rails, workers, settlement and support services |
| Agent and skill layer | [`AGENTS/`](./AGENTS/), [`skills/`](./skills/), [`clawdhub/`](./clawdhub/), [`acp_registry/`](./acp_registry/) | Agent catalog, skills marketplace, registry and publishing flows |
| Packages | [`packages/`](./packages/), [`MCP/`](./MCP/), [`API/`](./API/) | Shared SDKs, MCP servers, protocol references, wallet and payment libraries |
| Memory | [`packages/membrain/`](./packages/membrain/), [`packages/membrain-types/`](./packages/membrain-types/), [`packages/memory-host-sdk/`](./packages/memory-host-sdk/) | Membrain memory daemon (Go + gRPC) with TS/Python SDKs, shared types, and host engine modules |
| Docs and onboarding | [`docs/articles/`](./docs/articles/), [ONBOARDING.md](./ONBOARDING.md), [STACK.md](./STACK.md), [MEMEBRANE.md](./MEMEBRANE.md), [INTEGRATION_STRATEGY.md](./INTEGRATION_STRATEGY.md) | Product docs, architecture, ops, integration guides |

## Flagship Capabilities

- **OpenClawd Orchestrator** in [`openclawd-stack/`](./openclawd-stack/) ties together wallets, Honcho memory, E2B sandboxes, MCP tools, and monetized runtime services.
- **ClawdRouter** in [`clawdrouter/`](./clawdrouter/) routes across cloud and local models, supports hosted and local AI lanes, and sits on the payment-aware edge of the stack.
- **Browser automation and pAGENT** in [`chrome-extension/`](./chrome-extension/) gives the stack a browser-native operator surface for wallet-aware browsing, tool use, and task automation.
- **50-agent catalog and bundled skills** live in [`AGENTS/`](./AGENTS/) and [`skills/`](./skills/), giving the repo a ready-made marketplace and extension layer.
- **Payments as a first-class primitive** span x402, MPP, AP2, and A2A flows; see [ARTICLE_PAYMENTS.md](./docs/articles/ARTICLE_PAYMENTS.md).
- **Local AI and remote tunnel flows** are documented in [ARTICLE_LOCAL_AI.md](./docs/articles/ARTICLE_LOCAL_AI.md) and [CLAWD_ROUTER_TUNNEL.md](./docs/articles/CLAWD_ROUTER_TUNNEL.md).
- **AutoResearch and agentic research loops** are documented in [AUTO_RESEARCH_AGENTS.md](./docs/articles/AUTO_RESEARCH_AGENTS.md).
- **ClawdVault security posture** is described in [SECURITY_VAULT_INTEGRATION.md](./SECURITY_VAULT_INTEGRATION.md) and the [`skills/clawd-vault/`](./skills/clawd-vault/) + [`MCP/vault-mcp/`](./MCP/vault-mcp/) implementation.
- **Agent Bus / Claw3D integration** is covered in [agent-bus.md](./docs/articles/agent-bus.md).
- **⛓️ Solana Attestation Service (SAS)** in [`skills/solana-attestation-skill/`](./skills/solana-attestation-skill/) enables formally verified, on-chain attestations for skills via QEDGen Lean 4 proofs.
- **Formally Verified Skills** integrate QEDGen formal verification with on-chain attestation storage using the Solana Attestation Service program.
- **Metaplex Agent Integration** with vault-protected wallets at birth - agents mint as MPL Core NFTs with attestation metadata.
- **Hermès Vault Protocol** - agent wallets are initialized in vault custody at birth for secure multi-signature operations.
- **Sign in with OpenRouter at birth** via the verified [`openrouter-oauth`](./skills/openrouter-oauth/SKILL.md) skill — OAuth PKCE flow (no client registration, no backend, no secrets) populates `OPENROUTER_API_KEY` in `~/.openclawd/.env` during the openclawd birth ceremony so buddies reach LLMs through ClawdRouter without a paste step.
- **🧠 Membrain memory layer** in [`packages/membrain/`](./packages/membrain/) gives Solana trading agents a typed, revisable memory substrate (Go daemon + gRPC, SQLite/Postgres+pgvector backends, decay/consolidation schedulers, TS + Python SDKs). Memory types — `episodic`, `semantic`, `competence`, `working`, `plan_graph` — let agents learn *how* to trade rather than just *what* happened.

## Quick Start

### From Source

```bash
git clone https://github.com/clawdsolana/OpenClawd.git
cd openclawd
cp .env.example .env

# Install repo-managed hooks and verify the machine.
npm run hooks:install
npm run doctor

# Install the main repo entry points.
npm run install:all

# Build the agent catalog and start the orchestrator.
npm run build:catalog
npm run dev:orchestrator
```

Minimum local toolchain:

- Node `20+`
- npm `10+`
- `pnpm` on your `PATH`
- Git

### Bootstrap Installer

If you want the end-user bootstrap flow instead of a full source checkout:

```bash
bash ./install.sh
```

Install snippets and hosted installer copy live in [INSTALL_SNIPPETS.md](./INSTALL_SNIPPETS.md).

## Core Developer Commands

| Command | Purpose |
| --- | --- |
| `npm run hooks:install` | Installs repo-managed git hooks to block accidental secret commits |
| `npm run brand:check` | Catches high-visibility old-brand phrases in first-party docs |
| `npm run doctor` | Verifies the supported root bootstrap path |
| `npm run guard:worktree` | Scans tracked and untracked worktree files for env files and common secret patterns |
| `npm run release:check` | Public-release sanity check for docs, tracked file hygiene, and package metadata |
| `npm run build:catalog` | Rebuilds the checked-in agent catalog |
| `npm run build:membrain` | Builds the Membrain memory daemon (`packages/membrain/bin/membraned`) |
| `npm run build:membrain-ts` | Builds the Membrain TypeScript SDK (`@gustycube/membrane`) |
| `npm run test:membrain` | Runs the Go test suite for Membrain |
| `npm run dev:orchestrator` | Starts the main runtime orchestrator from `openclawd-stack/` |
| `npm run dev:router` | Starts ClawdRouter |
| `npm run dev:registrar` | Starts the API registrar |
| `npm run dev:cli` | Starts the canonical Clawd CLI surface |
| `npm run dev:membrain` | Starts the Membrain daemon (`membraned`) on `:9090` |

## Build Map

| Subsystem | Path | Notes |
| --- | --- | --- |
| Orchestrator and gateway | [`openclawd-stack/`](./openclawd-stack/) | Main runtime, wallets, session orchestration, gateway agents |
| Router | [`clawdrouter/`](./clawdrouter/) | Model routing, local/cloud inference lanes |
| CLI | [`clawd-code-cli/`](./clawd-code-cli/) | Terminal-native coding and ops surface |
| Skills marketplace | [`clawdhub/`](./clawdhub/) | Skill discovery, install, publish flows |
| Wallet SDK | [`packages/clawd-wallet/`](./packages/clawd-wallet/) | Embedded wallet and agentic trading hooks |
| x402 SDK | [`packages/agents-x402-solana/`](./packages/agents-x402-solana/) | Payment-aware MCP and HTTP tooling |
| Perpetuals CLI | [`packages/percolator/`](./packages/percolator/) | Solana perps CLI |
| Memory daemon | [`packages/membrain/`](./packages/membrain/) | Selective, revisable memory substrate (`membraned` Go daemon + gRPC) — episodic, semantic, competence, working, plan_graph |
| Memory TS SDK | [`packages/membrain/clients/typescript/`](./packages/membrain/clients/typescript/) | `@gustycube/membrane` — gRPC client over `@grpc/grpc-js` |
| Memory Python SDK | [`packages/membrain/clients/python/`](./packages/membrain/clients/python/) | `membrane` — gRPC client for Python services |
| OpenClaw memory bridge | [`packages/membrain/clients/openclawd/`](./packages/membrain/clients/openclawd/) | Plugin: event ingestion, `membrane_search` tool, before-agent context injection |
| Memory types | [`packages/membrain-types/`](./packages/membrain-types/) | `@openclaw/membrain-types` — shared TS surface for in-process consumers |
| Memory host SDK | [`packages/memory-host-sdk/`](./packages/memory-host-sdk/) | Host runtime + engine modules composing Membrain into the OpenClawd stack |
| Workers | [`workers/`](./workers/) | Trading bot, install worker, wallet worker, email worker, more |
| MCP servers | [`MCP/`](./MCP/) | Shared MCP server implementations including vault and WURK |
| Browser extension | [`chrome-extension/`](./chrome-extension/) | pAGENT browser surface and control bridge |
| Solana Attestation Service | [`solana-attestation-service-master/`](./solana-attestation-service-master/) | On-chain attestation program with Pinocchio framework |
| Formal Verification | [`skills/solana-formal-verification/`](./skills/solana-formal-verification/) | QEDGen Lean 4 proof generation for Solana programs |
| Attested Skills | [`skills/solana-attestation-skill/`](./skills/solana-attestation-skill/) | SAS integration for formally verified skill attestations |
| Attested Agents | [`AGENTS/agent-template-attested.json`](./AGENTS/agent-template-attested.json) | Agent template with on-chain attestation and vault integration |
| Attested Plugins | [`plugin.delivery/plugin-template-attested.json`](./plugin.delivery/plugin-template-attested.json) | Plugin template with SAS verification |
| Verified Skills Hub | [`kraken-cli-main/skills/`](./kraken-cli-main/skills/) | 51-skill hub including the SAS-verified `openrouter-oauth` bundled at agent birth |
| OpenRouter OAuth Skill | [`skills/openrouter-oauth/`](./skills/openrouter-oauth/) · [`kraken-cli-main/skills/openrouter-oauth/`](./kraken-cli-main/skills/openrouter-oauth/) | PKCE sign-in that writes `OPENROUTER_API_KEY` into `~/.openclawd/.env` during birth |

## Verified Skills — Bundled at Agent Birth

Every openclawd agent receives a set of SAS-attested skills during the birth ceremony in addition to its wallet and vault initialization. These skills are declared in [`AGENTS/agent-template-attested.json`](./AGENTS/agent-template-attested.json) under `skills[]` with `priority: "bundled-at-birth"`, mirrored into [`kraken-cli-main/skills/`](./kraken-cli-main/skills/) (the verified hub) and [`skills/`](./skills/) (the main catalog), and surfaced through the bootstrap in [`install.sh`](./install.sh).

| Skill | Provides | Path |
| --- | --- | --- |
| [`openrouter-oauth`](./skills/openrouter-oauth/SKILL.md) | `OPENROUTER_API_KEY` via OAuth PKCE — no client registration, no backend | [`skills/openrouter-oauth/`](./skills/openrouter-oauth/) · [hub copy](./kraken-cli-main/skills/openrouter-oauth/) |

Birth flow including the OAuth step:

```
openclawd birth
   ├─ wallet generated + Hermès vault initialized
   ├─ SAS attestation minted (skill + identity)
   ├─ "Sign in with OpenRouter" button (openrouter-oauth skill)
   │     └─ PKCE handshake → sk-or-... key
   │     └─ tailclawd PATCH /api/openclawd/env → ~/.openclawd/.env
   └─ agent online; can now call LLMs through ClawdRouter
```

To add a new skill to the at-birth bundle:

1. Author the `SKILL.md` in [`kraken-cli-main/skills/<name>/`](./kraken-cli-main/skills/) with `metadata.openclaw.verified: true` and `metadata.openclaw.bundled_at_birth: true`.
2. Mirror to [`skills/<name>/`](./skills/) and add an entry to [`skills/catalog.json`](./skills/catalog.json) with `verified: true, bundled_at_birth: true`.
3. Append the skill to the `skills[]` array in [`AGENTS/agent-template-attested.json`](./AGENTS/agent-template-attested.json) with `priority: "bundled-at-birth"` and a `provides: [...]` list for the env vars it populates.
4. Update [`kraken-cli-main/skills/INDEX.md`](./kraken-cli-main/skills/INDEX.md) under "OpenClawd Verified — Bundled at Birth".

## Docs by Theme

| Theme | Docs |
| --- | --- |
| Onboarding | [ONBOARDING.md](./ONBOARDING.md), [CONTRIBUTING.md](./CONTRIBUTING.md), [SUPPORT.md](./SUPPORT.md) |
| Architecture | [STACK.md](./STACK.md), [architecture.md](./docs/articles/architecture.md), [INTEGRATION_STRATEGY.md](./INTEGRATION_STRATEGY.md) |
| Payments and monetization | [ARTICLE_PAYMENTS.md](./docs/articles/ARTICLE_PAYMENTS.md), [monetize-agents-openclawd.md](./docs/articles/monetize-agents-openclawd.md), [ARTICLE_MARKET.md](./docs/articles/ARTICLE_MARKET.md) |
| Local and routed AI | [ARTICLE_LOCAL_AI.md](./docs/articles/ARTICLE_LOCAL_AI.md), [CLAWD_ROUTER_TUNNEL.md](./docs/articles/CLAWD_ROUTER_TUNNEL.md), [CLAWD_ROUTER.md](./docs/articles/CLAWD_ROUTER.md) |
| Research and memory | [AUTO_RESEARCH_AGENTS.md](./docs/articles/AUTO_RESEARCH_AGENTS.md), [agent-bus.md](./docs/articles/agent-bus.md) |
| Security | [SECURITY.md](./SECURITY.md), [SECURITY_VAULT_INTEGRATION.md](./SECURITY_VAULT_INTEGRATION.md), [permissions-sandboxing.md](./docs/articles/permissions-sandboxing.md) |

## ⛓️ Solana Attestation Service

The Solana Attestation Service (SAS) enables formally verified, on-chain attestations for skills and agents through integration with QEDGen Lean 4 proofs and the Hermès vault protocol.

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Solana Attestation Service                        │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                 │
│  │  Credential │  │   Schema    │  │ Attestation │                 │
│  │  (Issuer)   │  │  (Structure)│  │  (Proof)    │                 │
│  └─────────────┘  └─────────────┘  └─────────────┘                 │
│         │                │                │                          │
│         └────────────────┴────────────────┘                          │
│                           │                                          │
│    ┌─────────────────────┼─────────────────────┐                  │
│    │                     │                     │                    │
│    ▼                     ▼                     ▼                    │
│ ┌──────────┐      ┌──────────┐         ┌──────────┐               │
│ │  Skill   │      │  Agent   │         │  Vault   │               │
│ │Attestation│     │ Identity │         │Integration│              │
│ └──────────┘      └──────────┘         └──────────┘               │
└─────────────────────────────────────────────────────────────────────┘
```

### Program Addresses

| Component | Address |
| --- | --- |
| SAS Program ID | `22zoJMtdu4tQc2PzL74ZUT7FrwgB1Udec8DdW4yw4BdG` |
| Token Program (Token-2022) | `TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb` |
| Event Authority PDA | `DzSpKpST2TSyrxokMXchFz3G2yn5WEGoxzpGEUDjCX4g` |

### Skill Attestation Schema

```typescript
{
  layout: [12, 32, 12, 8, 1],  // String, Pubkey, String, U64, Bool
  field_names: [
    "skill_id",
    "verifier_pubkey",
    "proof_hash",
    "verification_timestamp",
    "is_formally_verified"
  ]
}
```

### Agent Identity Schema

```typescript
{
  layout: [12, 32, 12, 32, 1],  // String, Pubkey, String, Pubkey, Bool
  field_names: [
    "agent_id",
    "wallet_pubkey",
    "skill_attestation",
    "vault_address",
    "is_vault_initialized"
  ]
}
```

### Verification Pipeline

1. Agent requests formal verification via QEDGen
2. QEDGen generates Lean 4 proofs for skill capabilities
3. Proof compilation produces `proof_hash`
4. Agent creates attestation with `proof_hash`
5. Attestation stored on-chain via SAS program
6. Attestation verified by any party trustlessly

### Key Components

| Component | Path | Description |
| --- | --- | --- |
| Attestation Program | [`solana-attestation-service-master/`](./solana-attestation-service-master/) | Pinocchio-based Solana program for on-chain attestations |
| Cereal Macro | [`solana-attestation-service-master/cereal_macro/`](./solana-attestation-service-master/cereal_macro/) | Procedural macro for schema serialization |
| Core Types | [`solana-attestation-service-master/core/`](./solana-attestation-service-master/core/) | Shared types and schema definitions |
| SAS Skill | [`skills/solana-attestation-skill/`](./skills/solana-attestation-skill/) | Agent skill for attestation operations |
| Attested Agent Template | [`AGENTS/agent-template-attested.json`](./AGENTS/agent-template-attested.json) | Agent template with vault and attestation |
| Attested Plugin Template | [`plugin.delivery/plugin-template-attested.json`](./plugin.delivery/plugin-template-attested.json) | Plugin template with SAS verification |

## Security Guardrails

OpenClawd is meant to be cloned and published publicly, so the repo now ships with built-in guardrails:

```bash
npm run hooks:install
npm run brand:check
npm run guard:worktree
npm run doctor
npm run release:check
```

What these cover:

- pre-commit blocks staged `.env`, `.pem`, `.key`, and common live-secret patterns
- pre-push re-runs worktree and release hygiene checks
- `brand:check` catches high-visibility first-party branding drift in docs
- `doctor` verifies the supported root bootstrap path
- `release:check` verifies public-release hygiene and metadata

Review [SECURITY.md](./SECURITY.md) before publishing a fork or opening a release PR.

## $CLAWD Token

OpenClawd centers a Solana SPL token used across holder gating, pricing, wallet-aware surfaces, and docs.

| Property | Value |
| --- | --- |
| Symbol | `$CLAWD` |
| Chain | Solana |
| Standard | SPL Token |
| Mint / contract address | `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump` |

Links:

- [Buy on Jupiter](https://jup.ag/swap/SOL-8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump)
- [View on DexScreener](https://dexscreener.com/solana/8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump)
- [View on pump.fun](https://pump.fun/coin/8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump)

## Community

- Website: [solanaclawd.com](https://solanaclawd.com)
- Agent hub: [hub.solanaclawd.com](https://hub.solanaclawd.com)
- X: [@clawddevs](https://x.com/clawddevs)
- Telegram: [t.me/clawdtoken](https://t.me/clawdtoken)

## License

MIT. See [LICENSE.md](./LICENSE.md).
