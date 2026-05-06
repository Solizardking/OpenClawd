# Understanding The OpenClawd Package Layer

OpenClawd is a Solana-native financial AI agent platform. The `packages/` directory is where the reusable parts of that platform live: wallets, payment gates, memory engines, trading CLIs, service discovery, and internal plugin contracts.

If you are new to the repo, the most important thing to understand is that these packages are not all the same kind of project. Some are small type-only libraries. Some are internal contracts. Some are full services. Some hold transaction-building code that should be treated with the same care as production financial infrastructure.

GitHub package index: [solanaclawd.com/tree/main/packages](https://solanaclawd.com)

## The Big Picture

OpenClawd agents need four major capabilities:

1. They need to **hold or access wallets**.
2. They need to **trade or prepare transactions** on Solana.
3. They need to **remember what happened** across sessions.
4. They need to **expose tools and services** in a way that other agents, apps, and CLIs can consume.

The package layer is how those capabilities are separated.

```text
Wallets and trading:
  agentwallet, clawd-wallet, percolator

Payments and monetization:
  agents-x402-solana

Memory and reasoning:
  membrain, membrain-types, honcho-bridge, memory-host-sdk

Runtime plumbing:
  service-registry, plugin-sdk, plugin-package-contract

Terminal operator distribution:
  Clawd-code
```

## Why Some Directories Are Much Bigger Than Others

Not every directory's disk size reflects its authored source size.

Some package folders contain local dependency installs, generated files, or built output. For example, a wallet package can look huge on disk because `node_modules/` is present, even if the actual authored TypeScript source is much smaller. A package like `membrain`, on the other hand, is large because it is a real service with Go source, schemas, clients, docs, and operational code.

So when comparing packages, use this mental model:

| Package type | What makes it big |
| --- | --- |
| Full services | Multiple languages, daemon code, schemas, storage backends, tests, docs |
| CLI distributions | Built JavaScript, docs, command references, local dependencies |
| Wallet/trading packages | SDK source plus Solana/Jupiter dependencies and transaction logic |
| Type packages | Usually tiny, but important because they define shared contracts |
| Internal SDKs | May look small but can affect many runtime surfaces |

## Package-By-Package Guide

### `agents-x402-solana`

GitHub: [packages/agents-x402-solana](https://solanaclawd.com)

This package monetizes agent tools and HTTP endpoints with Solana USDC payments. It mirrors the general x402 pattern but settles through the Clawd facilitator on Solana.

Use it when you want:

- A paid MCP tool
- A paid HTTP route
- A premium agent endpoint
- A server-side payment gate that does not hold private keys

Its job is narrow and high leverage: require payment, verify the payment, settle it, then let the tool call continue.

### `agentwallet`

GitHub: [packages/agentwallet](https://solanaclawd.com)

`agentwallet` is an encrypted keypair vault for Solana and EVM wallets. It provides a TypeScript API, a CLI, an HTTP server, and deployment helpers for E2B and Cloudflare Workers.

This is the package to study when an agent needs self-managed keys instead of an embedded wallet provider.

Because it can store and reveal private keys, this package belongs in the highest-risk category. Any code path that exports a key, signs a transaction, or allows remote wallet access should be permission-gated and tested.

### `Clawd-code`

GitHub: [packages/Clawd-code](https://solanaclawd.com)

`Clawd-code` is the Clawd terminal operator distribution and documentation bundle. It is not shaped like the smaller SDK packages. It includes CLI docs, architecture notes, security guidance, scaling notes, built distribution output, and local dependency artifacts in this working tree.

Conceptually, it is the operator interface: the place where a user interacts with provider routing, shell tools, file tools, MCP, and Solana-aware commands from the terminal.

### `clawd-wallet`

GitHub: [packages/clawd-wallet](https://solanaclawd.com)

`clawd-wallet` is the wallet and Jupiter swap core. It is meant for TypeScript code that needs wallet operations, balances, quotes, and swap execution primitives.

This is different from `agentwallet`:

- `agentwallet` is a vault for key management.
- `clawd-wallet` is a wallet/swap SDK surface for Solana execution workflows.

Both touch financial execution, but they sit at different layers.

### `honcho-bridge`

GitHub: [packages/honcho-bridge](https://solanaclawd.com)

`honcho-bridge` connects OpenClawd to Honcho. It records peer/session messages, retrieves context in an LLM-friendly shape, describes peers, and verifies webhooks.

This package is about reasoning memory rather than raw trade memory. It helps an agent preserve conversation and peer-level context across sessions, then optionally feeds durable conclusions into the deeper memory layer.

### `membrain`

GitHub: [packages/membrain](https://solanaclawd.com)

`membrain` is the largest authored subsystem in the package directory. It is a Go memory daemon and structured memory substrate for autonomous trading agents.

It exists because financial agents need more than a context window. They need a way to remember trades, revise stale beliefs, track active positions, retrieve relevant strategies, and forget information that is no longer useful.

The key memory types are:

- `episodic`: trades and events
- `working`: active position state
- `semantic`: market facts
- `competence`: learned strategies and success rates
- `plan_graph`: reusable DeFi workflows

When someone asks "where does OpenClawd learn over time?", `membrain` is the main answer.

### `membrain-types`

GitHub: [packages/membrain-types](https://solanaclawd.com)

This is a small TypeScript package for Membrain contracts. It lets TypeScript services talk about Membrain records and client shapes without duplicating schema definitions or importing the Go service.

It is tiny, but it sits on an important boundary between the memory service and TypeScript consumers.

### `memory-host-sdk`

GitHub: [packages/memory-host-sdk](https://solanaclawd.com)

`memory-host-sdk` is an internal runtime package for local memory. It includes storage engines, embedding support, Honcho integration, QMD processing, batch handling, multimodal files, status formatting, query expansion, and runtime file helpers.

Think of it as host-side memory infrastructure. `membrain` is the durable daemon. `memory-host-sdk` is the local runtime toolkit used by host processes.

### `percolator`

GitHub: [packages/percolator](https://solanaclawd.com)

`percolator` is a Solana perpetuals CLI. It includes commands for market creation, LP setup, user accounts, deposits, withdrawals, trades, liquidations, oracle management, insurance operations, and slab inspection.

This package is operationally important because it prepares or sends market transactions. New users should start with `--simulate` and `--json` so outputs can be inspected before anything is broadcast.

### `plugin-package-contract`

GitHub: [packages/plugin-package-contract](https://solanaclawd.com)

This is a tiny private package that defines plugin package metadata contracts. It is not large, but it helps keep plugin packaging consistent across the repo.

### `plugin-sdk`

GitHub: [packages/plugin-sdk](https://solanaclawd.com)

`plugin-sdk` is an internal SDK for plugin and provider runtime surfaces. It exports contracts for auth, config, browser runtime, channel streaming, secrets, provider tools, model providers, testing, security, and related surfaces.

Because many plugin paths can depend on it, changes here should be treated as shared infrastructure changes.

### `service-registry`

GitHub: [packages/service-registry](https://solanaclawd.com)

`service-registry` keeps local service URLs and health checks in one package. Instead of hard-coding ports across the repo, services import discovery helpers.

This package is small, but it prevents configuration drift across gateway, wallet API, MCP bridges, browser services, hub services, scanner jobs, and related local processes.

## Recommended Reading Order

If you are trying to understand OpenClawd from zero, read in this order:

1. [`packages/README.md`](./README.md) for the map.
2. [`packages/service-registry/README.md`](./service-registry/README.md) to understand local service wiring.
3. [`packages/clawd-wallet/README.md`](./clawd-wallet/README.md) and [`packages/agentwallet/README.md`](./agentwallet/README.md) for wallet layers.
4. [`packages/membrain/README.md`](./membrain/README.md) for durable memory.
5. [`packages/honcho-bridge/README.md`](./honcho-bridge/README.md) for reasoning/session memory.
6. [`packages/percolator/README.md`](./percolator/README.md) for perpetuals operations.
7. [`packages/agents-x402-solana/README.md`](./agents-x402-solana/README.md) for paid tools.
8. Internal contracts only after that: `plugin-sdk`, `plugin-package-contract`, and `memory-host-sdk`.

## Editing Guidelines

When changing these packages, classify the change first:

| Change type | Risk |
| --- | --- |
| Docs-only package map update | Low |
| Type contract change | Medium to high, because downstream packages may break |
| Service URL or registry change | Medium, because local orchestration can break |
| Memory retrieval or persistence change | High, because agent behavior can change |
| Wallet, signing, settlement, or trading change | Highest, because funds or market actions may be affected |

For wallet and trading paths, start with read-only data flows. Add signing only after the caller has explicit permission gates and a simulation or test path.

## GitHub Links

Every package directory listed here is expected to be present under the same GitHub path:

| Local path | GitHub |
| --- | --- |
| `/Users/8bit/fraud/OpenClawd/packages` | [packages](https://solanaclawd.com) |
| `/Users/8bit/fraud/OpenClawd/packages/agents-x402-solana` | [agents-x402-solana](https://solanaclawd.com) |
| `/Users/8bit/fraud/OpenClawd/packages/agentwallet` | [agentwallet](https://solanaclawd.com) |
| `/Users/8bit/fraud/OpenClawd/packages/Clawd-code` | [Clawd-code](https://solanaclawd.com) |
| `/Users/8bit/fraud/OpenClawd/packages/clawd-wallet` | [clawd-wallet](https://solanaclawd.com) |
| `/Users/8bit/fraud/OpenClawd/packages/honcho-bridge` | [honcho-bridge](https://solanaclawd.com) |
| `/Users/8bit/fraud/OpenClawd/packages/membrain` | [membrain](https://solanaclawd.com) |
| `/Users/8bit/fraud/OpenClawd/packages/membrain-types` | [membrain-types](https://solanaclawd.com) |
| `/Users/8bit/fraud/OpenClawd/packages/memory-host-sdk` | [memory-host-sdk](https://solanaclawd.com) |
| `/Users/8bit/fraud/OpenClawd/packages/percolator` | [percolator](https://solanaclawd.com) |
| `/Users/8bit/fraud/OpenClawd/packages/plugin-package-contract` | [plugin-package-contract](https://solanaclawd.com) |
| `/Users/8bit/fraud/OpenClawd/packages/plugin-sdk` | [plugin-sdk](https://solanaclawd.com) |
| `/Users/8bit/fraud/OpenClawd/packages/service-registry` | [service-registry](https://solanaclawd.com) |
| `/Users/8bit/fraud/OpenClawd/packages/README.md` | [README.md](https://solanaclawd.com) |
