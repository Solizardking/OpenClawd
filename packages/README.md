# OpenClawd Packages

This directory is the package layer for OpenClawd: wallet custody, Solana trading execution, paid agent tools, memory, local service discovery, and internal plugin/runtime contracts.

OpenClawd is not a single npm package. It is a stack of packages with different jobs:

- **User-facing packages** ship CLIs, SDKs, wallet utilities, or monetization helpers.
- **Memory packages** give agents durable context, retrieval, and reasoning bridges.
- **Trading packages** talk to Solana programs, Jupiter, wallets, and payment rails.
- **Internal packages** keep plugins, host runtime code, and service wiring consistent across the monorepo.

GitHub root: [github.com/clawdsolana/OpenClawd/tree/main/packages](https://github.com/clawdsolana/OpenClawd/tree/main/packages)

## Package Map

| Package | Scale | Public surface | What it is | GitHub |
| --- | ---: | --- | --- | --- |
| [`agents-x402-solana/`](./agents-x402-solana/) | Small | `@openclawdsolana/agents-x402` | Solana USDC x402 gates for MCP tools, HTTP handlers, and paid agent calls. | [GitHub](https://github.com/clawdsolana/OpenClawd/tree/main/packages/agents-x402-solana) |
| [`agentwallet/`](./agentwallet/) | Medium | `@openclawdsolana/agentwallet` | Encrypted Solana/EVM keypair vault with CLI, HTTP API, E2B deployment, and Cloudflare deployment helpers. | [GitHub](https://github.com/clawdsolana/OpenClawd/tree/main/packages/agentwallet) |
| [`Clawd-code/`](./Clawd-code/) | Large app bundle | `clawd-code-cli` docs/prebuilt CLI | AI terminal operator docs and distribution artifacts for Clawd Code. Includes provider routing, file tools, shell tools, MCP, and Solana integrations. | [GitHub](https://github.com/clawdsolana/OpenClawd/tree/main/packages/Clawd-code) |
| [`clawd-wallet/`](./clawd-wallet/) | Medium source, large install tree | `@openclawdsolana/clawd-wallet` | Solana wallet and Jupiter swap core for agent workflows. React/CLI/agent surfaces are documented as future or deferred surfaces in this repo snapshot. | [GitHub](https://github.com/clawdsolana/OpenClawd/tree/main/packages/clawd-wallet) |
| [`honcho-bridge/`](./honcho-bridge/) | Medium | `@openclawdsolana/honcho-bridge` | Honcho reasoning-memory adapter. Persists peer/session context and can feed durable conclusions into Membrain. | [GitHub](https://github.com/clawdsolana/OpenClawd/tree/main/packages/honcho-bridge) |
| [`membrain/`](./membrain/) | Large service | `@gustycube/membrane` docs/client naming | Go memory daemon with gRPC APIs, typed financial memory, decay, consolidation, trust gating, and vector-aware retrieval. | [GitHub](https://github.com/clawdsolana/OpenClawd/tree/main/packages/membrain) |
| [`membrain-types/`](./membrain-types/) | Tiny | `@openclawdsolana/membrain-types` | TypeScript types and lightweight client contracts for Membrain consumers. | [GitHub](https://github.com/clawdsolana/OpenClawd/tree/main/packages/membrain-types) |
| [`memory-host-sdk/`](./memory-host-sdk/) | Medium internal | Private workspace package | Host-side memory engines for local runtime storage, embeddings, QMD, Honcho, batch jobs, multimodal files, and query expansion. | [GitHub](https://github.com/clawdsolana/OpenClawd/tree/main/packages/memory-host-sdk) |
| [`percolator/`](./percolator/) | Medium-large CLI | `@openclawdsolana/percolator` | Agentic perpetuals CLI for Solana markets, accounts, deposits, withdrawals, liquidation, oracle updates, and slab inspection. | [GitHub](https://github.com/clawdsolana/OpenClawd/tree/main/packages/percolator) |
| [`plugin-package-contract/`](./plugin-package-contract/) | Tiny internal | Private workspace package | Shared plugin package manifest/types contract used to keep plugin metadata consistent. | [GitHub](https://github.com/clawdsolana/OpenClawd/tree/main/packages/plugin-package-contract) |
| [`plugin-sdk/`](./plugin-sdk/) | Small internal | Private workspace package | Internal plugin SDK exports for runtime, provider, auth, browser, streaming, secret, testing, and security surfaces. | [GitHub](https://github.com/clawdsolana/OpenClawd/tree/main/packages/plugin-sdk) |
| [`service-registry/`](./service-registry/) | Small | `@openclawdsolana/service-registry` | Single source of truth for local service URLs and health checks across gateway, wallet API, MCP bridges, hub, scanner, and related services. | [GitHub](https://github.com/clawdsolana/OpenClawd/tree/main/packages/service-registry) |

Scale is based on source and documentation footprint, not installed `node_modules`. Some package folders currently contain local install output or build artifacts, so disk size can be much larger than the authored package.

## Size Guide

For people new to the repository, these packages fall into a few practical size classes:

| Class | Packages | What to expect |
| --- | --- | --- |
| **Large systems** | `membrain`, `Clawd-code` | Full subsystems with extensive docs, services, generated or built output, and multiple operational modes. Read the package README before editing. |
| **Trading and wallet modules** | `agentwallet`, `clawd-wallet`, `percolator`, `agents-x402-solana` | Directly tied to Solana wallet, swap, payment, or market execution paths. Treat signing, settlement, and transaction-building code as high risk. |
| **Memory integration modules** | `honcho-bridge`, `membrain-types`, `memory-host-sdk` | Agent context, retrieval, embeddings, and reasoning state. Behavior changes here can affect how agents remember and retrieve information. |
| **Infrastructure contracts** | `service-registry`, `plugin-sdk`, `plugin-package-contract` | Small but shared. Changes may have broad impact because many services import these contracts. |

## How The Pieces Fit

```text
OpenClawd agents
  |
  |-- wallet and execution
  |     |-- clawd-wallet: Solana wallet + Jupiter swap core
  |     |-- agentwallet: encrypted keypair vault + remote vault server
  |     |-- percolator: Solana perpetuals CLI and market operations
  |
  |-- paid access
  |     |-- agents-x402-solana: x402 payment gates for MCP and HTTP
  |
  |-- memory and context
  |     |-- membrain: durable memory daemon
  |     |-- membrain-types: TypeScript contracts for Membrain
  |     |-- honcho-bridge: Honcho session/peer reasoning bridge
  |     |-- memory-host-sdk: local host memory engines
  |
  |-- runtime wiring
        |-- service-registry: local URL discovery and health checks
        |-- plugin-sdk: internal plugin runtime surfaces
        |-- plugin-package-contract: plugin metadata contract
        |-- Clawd-code: terminal operator distribution/docs
```

## Package Notes

### `agents-x402-solana`

Use this when an MCP server, HTTP route, or agent tool needs to charge per call. The package verifies and settles Solana USDC payments through the Clawd facilitator, so the gated server does not hold a private key.

Common entry points:

- `@openclawdsolana/agents-x402`
- `@openclawdsolana/agents-x402/mcp`
- `@openclawdsolana/agents-x402/http`

Start here if you are building paid data feeds, paid MCP tools, or premium agent endpoints.

### `agentwallet`

Use this when an agent needs a self-managed encrypted vault rather than a hosted embedded wallet flow. It supports Solana and EVM keys, local HTTP serving, CLI management, and deployment helpers for E2B or Cloudflare Workers.

This package handles private material. New integrations should begin read-only and should only enable transaction paths after authentication, permission gates, and test coverage are in place.

### `Clawd-code`

This directory is a full CLI distribution/doc bundle for the Clawd terminal operator. It is larger than most source packages because it includes built output and local dependency artifacts in the working tree. Its README is the best entry point for provider setup, commands, Ollama usage, scaling, contribution, and security notes.

### `clawd-wallet`

This is the Solana wallet and swap core. It wraps wallet functionality and Jupiter quote/execution logic for the OpenClawd agent ecosystem. The current package metadata exposes the core package entry point; some React, CLI, and agent-facing docs are present but marked as deferred or future surfaces in the package description and source layout.

Use it when you need quotes, balances, transaction construction, or wallet operations from TypeScript.

### `honcho-bridge`

This bridge connects OpenClawd services to Honcho. It records owner/agent messages, retrieves session-shaped context for LLM calls, asks Honcho for peer-level insight, and verifies Honcho webhooks.

Use it when an app needs cross-session reasoning memory, peer/session persistence, or a no-op-safe memory integration that can be disabled through `HONCHO_ENABLED=false`.

### `membrain`

Membrain is the largest authored subsystem in `packages/`. It is a Go daemon and memory service for financial agents. It models memory as typed records instead of a flat context log:

- `episodic` for trades and events
- `working` for active positions
- `semantic` for market facts
- `competence` for learned strategies
- `plan_graph` for reusable DeFi workflows

Use it when an agent needs long-running memory with revision, decay, trust gating, and retrieval.

### `membrain-types`

This is the small TypeScript companion to Membrain. It exists so TypeScript services can share memory contracts without importing the Go daemon or copying schema definitions.

### `memory-host-sdk`

This is an internal host runtime package for local memory. It contains engines for SQLite storage, embeddings, Honcho, QMD, batch ingestion, query expansion, multimodal files, runtime file management, and status reporting.

Use it from host/runtime code. Do not treat it as a stable public package unless the exports and versioning are made public later.

### `percolator`

Percolator is the Solana perpetuals CLI package. It provides commands for market setup, user and LP accounts, deposits, withdrawals, trade simulation/execution paths, oracle administration, liquidation, insurance, and slab inspection.

Use `--simulate` and `--json` while developing so transaction behavior can be inspected before broadcasting.

### `plugin-package-contract`

This package is intentionally tiny. It centralizes plugin package metadata contracts so plugin packaging rules remain consistent.

### `plugin-sdk`

This package is an internal SDK surface for plugins and providers. It exports runtime contracts for auth, config, browser setup/security, channels, streaming, tools, model providers, secrets, SSRF protections, testing, and related plugin infrastructure.

Because this package is shared infrastructure, small changes can affect many plugin/provider surfaces.

### `service-registry`

This package keeps local service URLs in one place. Importers call `discover(name)` or health helpers instead of hard-coding localhost ports. It is the package to update when a service URL, env override, or health path becomes part of the shared local runtime.

## Development

Install from the repository root:

```bash
pnpm install
```

Build or type-check a package using the package's local scripts:

```bash
cd packages/percolator
pnpm build
```

The root-level commands are:

```bash
pnpm typecheck
pnpm build
pnpm test
```

Package-specific READMEs have the most accurate command examples for that package.

## Safety Notes

- Do not commit populated `.env` files, wallet keypairs, vault exports, or private keys.
- Treat anything that signs transactions, exports keys, settles payments, or touches a trading wallet as permission-gated code.
- Prefer read-only RPC, Helius, Birdeye, and Jupiter quote flows before enabling execution.
- Use `--simulate` where available before broadcasting Solana transactions.
- Keep internal packages private unless package metadata, exports, docs, and versioning are intentionally prepared for public use.

## Companion Article

For a longer explanation aimed at readers who are new to the repo, see [`article.md`](./article.md).

## GitHub Paths

These are the canonical GitHub locations for the package paths in this workspace:

| Local path | GitHub |
| --- | --- |
| `/Users/8bit/fraud/OpenClawd/packages` | [packages](https://github.com/clawdsolana/OpenClawd/tree/main/packages) |
| `/Users/8bit/fraud/OpenClawd/packages/agents-x402-solana` | [agents-x402-solana](https://github.com/clawdsolana/OpenClawd/tree/main/packages/agents-x402-solana) |
| `/Users/8bit/fraud/OpenClawd/packages/agentwallet` | [agentwallet](https://github.com/clawdsolana/OpenClawd/tree/main/packages/agentwallet) |
| `/Users/8bit/fraud/OpenClawd/packages/Clawd-code` | [Clawd-code](https://github.com/clawdsolana/OpenClawd/tree/main/packages/Clawd-code) |
| `/Users/8bit/fraud/OpenClawd/packages/clawd-wallet` | [clawd-wallet](https://github.com/clawdsolana/OpenClawd/tree/main/packages/clawd-wallet) |
| `/Users/8bit/fraud/OpenClawd/packages/honcho-bridge` | [honcho-bridge](https://github.com/clawdsolana/OpenClawd/tree/main/packages/honcho-bridge) |
| `/Users/8bit/fraud/OpenClawd/packages/membrain` | [membrain](https://github.com/clawdsolana/OpenClawd/tree/main/packages/membrain) |
| `/Users/8bit/fraud/OpenClawd/packages/membrain-types` | [membrain-types](https://github.com/clawdsolana/OpenClawd/tree/main/packages/membrain-types) |
| `/Users/8bit/fraud/OpenClawd/packages/memory-host-sdk` | [memory-host-sdk](https://github.com/clawdsolana/OpenClawd/tree/main/packages/memory-host-sdk) |
| `/Users/8bit/fraud/OpenClawd/packages/percolator` | [percolator](https://github.com/clawdsolana/OpenClawd/tree/main/packages/percolator) |
| `/Users/8bit/fraud/OpenClawd/packages/plugin-package-contract` | [plugin-package-contract](https://github.com/clawdsolana/OpenClawd/tree/main/packages/plugin-package-contract) |
| `/Users/8bit/fraud/OpenClawd/packages/plugin-sdk` | [plugin-sdk](https://github.com/clawdsolana/OpenClawd/tree/main/packages/plugin-sdk) |
| `/Users/8bit/fraud/OpenClawd/packages/service-registry` | [service-registry](https://github.com/clawdsolana/OpenClawd/tree/main/packages/service-registry) |
| `/Users/8bit/fraud/OpenClawd/packages/README.md` | [README.md](https://github.com/clawdsolana/OpenClawd/blob/main/packages/README.md) |
| `/Users/8bit/fraud/OpenClawd/packages/article.md` | [article.md](https://github.com/clawdsolana/OpenClawd/blob/main/packages/article.md) |
