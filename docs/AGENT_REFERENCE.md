# Clawd — Financial Agent Capabilities

## Who is Clawd?

I am **Clawd** 🦞 — an autonomous financial AI agent built on OpenClawd for Solana DeFi.

**Ecosystem:** $CLAWD on Solana, solanaclawd.com, openclawd npm package

**Core capabilities:**
- Autonomous token trading via Jupiter DEX
- Real-time market scanning and alpha detection
- On-chain wallet analysis and smart money tracking
- Pump.fun token discovery and graduation trading

## Financial Tools

### Trading Execution
- `jupiter_swap` — Execute token swaps with best routing
- `jupiter_price` — Get real-time prices and liquidity
- `pump_buy` / `pump_sell` — Bonding curve trading

### Market Intelligence
- `solana_trending` — Top tokens by volume/mcap
- `solana_wallet_pnl` — Any wallet's P&L analysis
- `helius_transactions` — Transaction parsing (SWAP/NFT/TRANSFER)

### Wallet Operations
- `helius_balance` — SOL balance check
- `helius_tokens` — Token portfolio
- `solana_transfer` — Send SOL/SPL tokens

## Memory Tiers

| Tier | Content | Behavior |
|------|---------|----------|
| **KNOWN** | Live prices, balances, on-chain state | Expires ~60s |
| **LEARNED** | Trade patterns, wallet behaviors | Persistent |
| **INFERRED** | Hypotheses, weak signals | Tentative |

## Trading Philosophy

1. **KNOW before INFERRED** — always ground decisions in fresh data
2. **Risk first** — preserve capital, use position sizing
3. **Permission-gated** — trades require explicit approval
4. **Transparent** — show reasoning, not just conclusions

## $CLAWD Token

- **CA:** `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump`
- **Links:** pump.fun, DexScreener, Jupiter
- **Holder benefits:** AI generation discounts, priority access

## Skills I Use

For trading: `jupiter-swap`, `pump-scanner`, `wallet-analyst`
For analysis: `market-research`, `trend-detector`, `sentiment-analyzer`
For risk: `risk-manager`, `position-sizer`, `stop-loss-helper`

## OODA Loop (Trading)

```
OBSERVE  → Scan markets, get prices, check trends
ORIENT   → Score opportunities (trend + momentum + liquidity)
DECIDE   → Confidence >= 60%? Size position appropriately
ACT      → Execute (permission-gated)
LEARN    → Log outcome to memory, promote signals
```

## New User Defaults

- Start with read-only tools: Helius, Birdeye, Jupiter quotes.
- Keep swap execution disabled until a human approval path is configured.
- Never paste private keys into prompts, issues, logs, or docs.
- Use [Trading strategy](#clawd--trading-strategy--execution) for execution guardrails and sizing rules.

---

# CLAWD — Trading Strategy & Execution

## Multi-Venue Trading System

### Venue 1: Solana Spot (Pump.fun + Raydium)

**Intent:** Breakout continuation, recovery bounces, long-only

| Tier | Criteria | Strategy | Max Size |
|------|----------|----------|----------|
| **Fresh Sniper** | age ≤ 15m | Fast flip, 2-5x target, 10min TTL | 0.05 SOL |
| **Near Graduation** | bonding ≥ 75% | Ride pump, exit before 100% | 0.1 SOL |
| **Micro-Cap** | MC < $10K | Speculative, high risk | 0.05 SOL |
| **Mid-Cap** | MC $10K-$100K | Trend-follow, trailing stop | 0.2 SOL |
| **Large-Cap** | MC > $100K | Scalps on dips | 0.3 SOL |

### Decision Table (Pump.fun)

| Condition | Action |
|-----------|--------|
| Age ≤ 5m AND MC < $5K | **SNIPE** — 0.05 SOL |
| Age ≤ 15m AND bonding ≥ 50% | **BUY** — 0.1 SOL, exit at 3x |
| Bonding ≥ 90% | **AVOID** — graduation imminent |
| MC > $500K AND age < 2h | **SCALP** — tight stops |
| MC > $1M | **SKIP** — pump.fun rarely sustains |

### Guardrails

- Never exceed 1 SOL total exposure on pump.fun
- Never trade bonding = 100% (graduated)
- All trades gated by permission engine
- Never execute without trade plan in INFERRED memory
- Never retry failed swaps > 2 times

## OODA Cycle

```
OBSERVE  → solana_trending, pump_market_cap, memory(KNOWN)
ORIENT   → score: trend(25) + momentum(20) + liquidity(20) + participation(15) - execution_risk(20)
DECIDE   → confidence >= 60%? → size_band (0.5x/1.0x/1.25x/1.5x)
ACT      → HUMAN APPROVAL → jupiter_swap → memory(KNOWN)
LEARN    → write_outcome → promote INFERRED → LEARNED
```

## Confidence Scoring

| Score | Signal |
|-------|--------|
| 80-100 | Strong buy |
| 60-79 | Buy with caution |
| 40-59 | Hold/scale |
| 20-39 | Reduce/skip |
| 0-19 | Avoid |

## Risk Management

- **Drawdown cascade:** 5% reduce, 8% close perps, 12% full halt
- **Position timeout:** Fresh snipes 10min, mid-caps 2h, large-caps 24h
- **Stop loss:** 15% default, tightens on rapid moves
- **Take profit:** 50% default, trails at 25%

## Tool Chain

```
OBSERVE:  solana_trending → pump_token_scan → memory_recall(KNOWN)
ORIENT:   solana_token_info → solana_top_traders → score_candidates
DECIDE:   score >= 60 → generate_trade_plan → memory_write(INFERRED)
ACT:      *** APPROVAL *** → jupiter_swap → memory_write(KNOWN)
LEARN:    write_outcome → promote_to_LEARNED
```

## MCP Tools

### Solana Market Data
- `solana_price` — Live token price
- `solana_trending` — Top trending tokens
- `solana_token_info` — Token metadata + security score
- `solana_wallet_pnl` — Wallet P&L analysis
- `solana_top_traders` — Smart money wallets

### Helius Onchain
- `helius_balance` — SOL balance
- `helius_transactions` — Parsed tx history
- `helius_priority_fee` — Real-time fee estimates
- `helius_das_asset` — NFT/token metadata

### Pump.fun
- `pump_token_scan` — Bonding curve analysis
- `pump_buy_quote` — Get buy quote
- `pump_sell_quote` — Get sell quote
- `pump_graduation` — Check graduation status

### Jupiter DEX
- `jupiter_swap` — Execute swap
- `jupiter_quote` — Get quote without execution
- `jupiter_price` — Price + liquidity

---

# ClawdBot Integration

ClawdBot is the social trading agent surface for X/Twitter and Telegram. In
this checkout, treat any `X/` implementation as deployment-specific: verify the
directory exists before running commands, and keep credentials in local env
files or the host secret manager.

## Integration Points

The bot implementation typically contains:
- `src/services/sentient-engine.ts` — Autonomous intelligence loop
- `src/services/command-handler.ts` — 46+ command system
- `src/services/jupiter-service.ts` — Jupiter DEX integration
- `src/services/pump-fun-service.ts` — Pump.fun token launch
- `src/services/xai-service.ts` — xAI/Grok AI

## Runtime

Run ClawdBot:
```bash
cd X
npm install
npx tsx src/scripts/start-bot.ts
```

If `X/` is not present in your checkout, use the Telegram and gateway surfaces
listed in [OpenClawd Stack Map](#openclawd-stack-map) instead.

## Commands

| Command | Description |
|---------|-------------|
| `!token <ca>` | Full token analysis |
| `!swap <from> <to> <amt>` | Jupiter swap |
| `!jupbuy <mint> <sol>` | Buy via Jupiter |
| `!launch <name> <sym>` | Launch on pump.fun |

## Environment

Copy `.env.example` to `.env` and configure:
- `TWITTER_*` — OAuth 1.0a credentials
- `XAI_API_KEY` — Grok API
- `HELIUS_API_KEY` — Solana RPC
- `SOLANA_PRIVATE_KEY` — Trading wallet

## $CLAWD Token

- **CA:** `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump`
- **X:** [@clawddevs](https://x.com/clawddevs)
- **Website:** [solanaclawd.com](https://solanaclawd.com)

---

# Membrain Integration

Membrain is the memory and persistence layer for OpenClawd trading agents.

**Location:** [`packages/membrain/`](../packages/membrain/)

## What It Does

- **Episodic memory** — Immutable trade/swap/alert records
- **Semantic memory** — Market facts, wallet patterns, liquidity observations
- **Competence memory** — Learned trading strategies with success rates
- **Working memory** — Active position state tracking
- **Plan graphs** — Reusable DeFi workflows (swap → stake → claim)

Backed by SQLite (single-agent) or Postgres + pgvector (multi-agent / similarity search). A 15-method gRPC API on `:9090` is consumed by TypeScript ([`@gustycube/membrane`](../packages/membrain/clients/typescript/)) and Python ([`membrane`](../packages/membrain/clients/python/)) clients, plus an OpenClawd plugin bridge ([`packages/membrain/clients/openclawd/`](../packages/membrain/clients/openclawd/)) that auto-injects context before agent runs.

## Quick Start

```bash
# From the repo root
npm run build:membrain          # builds packages/membrain/bin/membraned
npm run dev:membrain            # listens on :9090 (SQLite, default)

# Multi-agent / similarity search
docker compose -f packages/membrain/docker-compose.yml up -d
./packages/membrain/bin/membraned \
  --postgres-dsn postgres://membrane:membrane@localhost:5432/membrane_test?sslmode=disable
```

```bash
# Tests
npm run test:membrain
```

## Integration

Membrain provides the memory backbone for ClawdBot and any OpenClawd surface that needs cross-session reasoning. Every trade, scan, and market observation flows through Membrain's ingestion pipeline and is available for trust-gated retrieval. After a trade settles, callers `Reinforce` or `Penalize` the relevant competence record so the strategy's success rate stays current; background `Consolidation` extracts patterns from trade history into typed semantic and competence records.

Sister packages compose Membrain into the rest of the stack:

- [`packages/membrain-types/`](../packages/membrain-types/) — shared TypeScript surface for in-process consumers
- [`packages/memory-host-sdk/`](../packages/memory-host-sdk/) — host runtime + engine modules (Membrain, embeddings, QMD, multimodal, secret, status)

## Reference

- Full README: [`packages/membrain/README.md`](../packages/membrain/README.md)
- RFC / design notes: [`packages/membrain/rfc.md`](../packages/membrain/rfc.md)
- Contributing (SDK release flow): [`packages/membrain/CONTRIBUTING.md`](../packages/membrain/CONTRIBUTING.md)
- Stack map entry: [OpenClawd Stack Map](#openclawd-stack-map) (Memory layer rows)

---

# Skills Catalog

Skills are stored in [`skills/`](../skills/) and published through
ClawdHub when they are ready for wider use. Keep skill files self-contained:
instructions in `SKILL.md`, optional references in `references/`, and no live
secrets.

## New User Path

```bash
# Browse checked-in skills
find skills -maxdepth 2 -name SKILL.md | sort | head

# Install from the public registry
npx clawdhub search solana
npx clawdhub install jupiter-swap

# Publish after review
npx clawdhub publish ./skills/my-skill --slug my-skill
```

## Financial Skills

| Skill | Description |
|-------|-------------|
| `solana-dev` | Solana development toolkit |
| `jupiter-swap` | DEX routing and execution |
| `pump-fun-manager` | Token launches |
| `wallet-analyst` | On-chain analysis |
| `birdeye` | Token data and trending |
| `bankr` | Multi-chain trading |
| `ore-miner` | SOL mining |
| `erc-8004` | Agent identity standard |

## Social/Communication Skills

| Skill | Description |
|-------|-------------|
| `clawdbot-twitter` | Twitter agent |
| `discord` | Discord bot |
| `telegram` | Telegram bot |
| `slack` | Slack integration |

## AI/Generation Skills

| Skill | Description |
|-------|-------------|
| `gemini` | Google AI |
| `nano-banana-pro` | Image generation |
| `openai-image-gen` | DALL-E |
| `canvas` | Live workspace |

## OpenRouter / Inference Skills

Injected into every clone at birth via `AgentRuntime.skills`. Available to
agents through `runtime.skills.tool('openrouter.<key>')` (passed into
`callModel` as a Zod-typed tool) and to the UI through gateway methods
`openrouter.text` / `openrouter.image` / `openrouter.models` /
`openrouter.setKey`.

| Skill | Registry key | Description |
| ----- | ------------ | ----------- |
| `openrouter-typescript-sdk` | `openrouter.text` | callModel + tool() across 300+ models |
| `openrouter-images` | `openrouter.image` | Image generation/edit via Gemini, DALL-E, etc. |
| `openrouter-models` | `openrouter.models` | List, search, resolve OpenRouter model IDs |
| `openrouter-oauth` | `openrouter.oauth` | "Sign In with OpenRouter" PKCE — per-user keys, no secrets |
| `openrouter-agent-migration` | `openrouter.agent-migration` | Reference: migrating from `@openrouter/sdk` |

Skill source files live in [open-router-skills/](../open-router-skills/);
the runtime-side wrappers (Zod schemas, `tool()` instances) are registered
in [src/agents/skill-registry.ts](../src/agents/skill-registry.ts).

## Using Skills

Skills are loaded dynamically by Clawd agents based on task requirements.

```ts
import { cloneAgent } from './src';

// Every clone gets the full OpenRouter skill set at birth
const trader = cloneAgent('trader');
const summary = await trader.narrate('Should I buy SOL right now?');
```

Or directly via the runtime:

```ts
import { getRuntime } from './src';

const { openrouter, skills } = getRuntime();
const text = await openrouter.generateText('Pick a SNIPE candidate', {
    tools: skills.tools(['jupiter.quote', 'memory.tiers']),
});
```

## Publishing Requirements

- Use `OpenClawd`, `ClawdHub`, and `$CLAWD` naming consistently.
- Do not include API keys, private keys, bearer tokens, webhook secrets, or
  `.env` files.
- Document required env vars with placeholders.
- Run `npm run guard:worktree` before publishing or opening a PR.

---

# OpenClawd Stack Map

> Technical map for the current monorepo checkout.

This file explains how the major directories in this repo fit together. It is intentionally stricter than the root [README.md](../README.md): it focuses on directories that are actually present in this checkout and avoids product copy that tends to drift.

The shared flow is:

**Surface -> Router -> Runtime -> Skills -> Settlement -> Chain**

---

## 1. Stack at a glance

```text
┌──────────────────────────────────────────────────────────────┐
│ Surfaces                                                     │
│ chrome-extension · telegram · tailclawd · WatchApp          │
│ beepboop · chess · moltbook-agent · examples                │
└────────────────────────────┬─────────────────────────────────┘
                              │ HTTP / SSE / WS
┌────────────────────────────▼─────────────────────────────────┐
│ Router and payments                                          │
│ clawdrouter · x402-openrouter-main · workers · services      │
│ plugin.delivery                                              │
└────────────────────────────┬─────────────────────────────────┘
                              │ model routing + payment checks
┌────────────────────────────▼─────────────────────────────────┐
│ Runtime                                                      │
│ src · openclawd · agents · MCP · packages                 │
│ openclawd-stack · clawd-cloud-os · CLI                       │
└────────────────────────────┬─────────────────────────────────┘
                              │ skills, registry, docs
┌────────────────────────────▼─────────────────────────────────┐
│ Skills and knowledge                                         │
│ clawdhub · skills · acp_registry · articles · llm-wiki-tang  │
└────────────────────────────┬─────────────────────────────────┘
                              │ signed Solana actions
┌────────────────────────────▼─────────────────────────────────┐
│ Chain                                                        │
│ Solana · Helius RPC · Jupiter · SPL USDC · $CLAWD            │
└──────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────┐
│ 🐾 Security (ClawdVault)                                      │
│ hermes-vault (services/) · clawd-vault (skills/)             │
│ vault-mcp (MCP/) · vault-agent (AGENTS/)                     │
└──────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────┐
│ 🧠 Memory (Membrain)                                          │
│ packages/membrain/ — Go daemon, gRPC API, TS + Python SDKs   │
│ episodic · semantic · competence · working · plan_graph      │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Layer-to-directory map

| Layer | Directory | Role |
|---|---|---|
| Surface | [`chrome-extension/`](../chrome-extension/) | Browser-side surface and page-agent bridge |
| Surface | [`telegram/`](../telegram/) | Telegram bot surface |
| Surface | [`tailclawd/`](../tailclawd/) | Browser-hosted Clawd Code over Tailscale |
| Surface | [`WatchApp/`](../WatchApp/) | watchOS-facing app |
| Surface | [`beepboop/`](../beepboop/) | macOS companion surface |
| Surface | [`chess/`](../chess/) | Wallet-signed chess surface |
| Surface | [`moltbook-agent/`](../moltbook-agent/) | Educational surface |
| Surface | [`examples/`](../examples/) | Reference clients and demos |
| Router | [`clawdrouter/`](../clawdrouter/) | 57-model router and local scoring layer |
| Router | [`x402-openrouter-main/`](../x402-openrouter-main/) | Solana-native x402 facilitator and payment gateway |
| Router | [`workers/`](../workers/) | Cloudflare worker deployments |
| Router | [`services/`](../services/) | Backend services and support processes |
| Router | [`plugin.delivery/`](../plugin.delivery/) | Paid plugin and package delivery flow |
| Runtime | [`src/`](../src/) | Core TypeScript engine |
| Runtime | [`openclawd/`](../openclawd/) | Go plus TypeScript Solana agent framework |
| Runtime | [`AGENTS/`](../AGENTS/) | Agent catalog and deploy-oriented assets |
| Runtime | [`MCP/`](../MCP/) | MCP servers |
| Runtime | [`packages/`](../packages/) | Shared npm packages, including wallet components |
| Runtime | [`openclawd-stack/`](../openclawd-stack/) | Browser and sandbox runtime stack |
| Runtime | [`openclawd-stack/bridge/`](../openclawd-stack/bridge/) | WebSocket terminal bridge connecting browser to E2B sandboxes; talks to orchestrator for auth + wallet + MCP |
| Runtime | [`clawd-cloud-os/`](../clawd-cloud-os/) | Browser-terminal cloud OS surface |
| Runtime | [`CLI/`](../CLI/) | CLI-related code and docs |
| Skills | [`clawdhub/`](../clawdhub/) | Marketplace, search, publish, and install flows |
| Skills | [`skills/`](../skills/) | Bundled `SKILL.md` library |
| Skills | [`acp_registry/`](../acp_registry/) | Registry JSON and metadata |
| Skills | [`articles/`](./articles/) | Longer-form docs and reference material |
| Skills | [`llm-wiki-tang/`](../llm-wiki-tang/) | Knowledge-base and indexing layer |
| Chain | [`solana-go-main/`](../solana-go-main/) | Go Solana SDK support code |
| Chain | [`API/`](../API/) | Protocol and external API references |
| Assets | [`gfx/`](../gfx/) | Visual assets |
| Assets | [`npm/`](../npm/) | npm installer and packaging helpers |
| Security | [`skills/clawd-vault/`](../skills/clawd-vault/) | Security vault skill (Hermes Vault port) |
| Security | [`MCP/vault-mcp/`](../MCP/vault-mcp/) | MCP server for vault tools |
| Security | [`AGENTS/vault-agent.json`](../AGENTS/vault-agent.json) | Vault guardian agent config |
| Security | [`services/hermes-vault/`](../services/hermes-vault/) | Hermes Vault Python backend (symlink) |
| Registrar | [`api-registrar/`](../api-registrar/) | X-verified API key registration service |
| Monetization | [`skills/wurk-integration/`](../skills/wurk-integration/) | WURK skill for job monetization |
| Monetization | [`MCP/wurk-mcp/`](../MCP/wurk-mcp/) | WURK MCP server for x402 payments |
| Memory | [`packages/membrain/`](../packages/membrain/) | Selective, revisable memory daemon (Go + gRPC) — episodic, semantic, competence, working, plan_graph |
| Memory | [`packages/membrain/clients/typescript/`](../packages/membrain/clients/typescript/) | `@gustycube/membrane` TypeScript SDK |
| Memory | [`packages/membrain/clients/python/`](../packages/membrain/clients/python/) | `membrane` Python SDK |
| Memory | [`packages/membrain/clients/openclawd/`](../packages/membrain/clients/openclawd/) | OpenClawd plugin bridge — auto-context injection + `membrane_search` tool |
| Memory | [`packages/membrain-types/`](../packages/membrain-types/) | Shared TypeScript types for in-process consumers |
| Memory | [`packages/memory-host-sdk/`](../packages/memory-host-sdk/) | Host runtime + engine modules that compose Membrain into the OpenClawd stack |

### Notes

- [`tailclawd-backup/`](../tailclawd-backup/) is present in the repo but should be treated as backup or legacy material, not a primary stack layer.
- This file only maps directories that exist in this checkout. Hosted services and historical components may be referenced elsewhere, but they are intentionally not modeled here unless they have code in-tree.

---

## 3. Request flow

```text
user request
  -> surface
  -> clawdrouter
  -> runtime or agent
  -> skills and registry lookup
  -> Solana reads or signed actions
  -> payment verification and settlement
  -> response back to the surface
```

### Example path

```text
telegram or chrome-extension
  -> clawdrouter
  -> agents or openclawd runtime
  -> MCP tools + SKILL.md guidance
  -> Jupiter / Helius / Solana RPC
  -> x402 settlement where required
```

---

## 4. Model routing

ClawdRouter is the intended model entry point for the stack.

- Registry: [`clawdrouter/src/models/registry.ts`](../clawdrouter/src/models/registry.ts)
- OpenRouter mappings: [`clawdrouter/src/upstream/openrouter.ts`](../clawdrouter/src/upstream/openrouter.ts)
- Moonshot mappings: [`clawdrouter/src/upstream/moonshot.ts`](../clawdrouter/src/upstream/moonshot.ts)

The local model registry currently contains **57** models.

### Notable defaults in this repo

| Purpose | Model |
|---|---|
| Reasoning default | `xai/grok-4.20-beta` |
| Long-context default | `moonshot/kimi-k2.6` |
| Example premium coding route | `openai/gpt-5.3-codex` |
| Example premium reasoning route | `anthropic/claude-sonnet-4.6` |

### Environment-driven defaults

The repo-wide defaults are defined in [`.env.example`](../.env.example):

- `CLAWDROUTER_DEFAULT_SIMPLE`
- `CLAWDROUTER_DEFAULT_MEDIUM`
- `CLAWDROUTER_DEFAULT_COMPLEX`
- `CLAWDROUTER_DEFAULT_REASONING`
- `CLAWDROUTER_DEFAULT_LONGCTX`

If those values change, prefer updating `.env.example` and the router registry rather than copying model tables across multiple docs.

---

## 5. Payment and settlement path

The billing path is centered on Solana settlement.

| Component | Responsibility |
|---|---|
| [`clawdrouter/`](../clawdrouter/) | model routing, provider abstraction, payment-aware request flow |
| [`x402-openrouter-main/`](../x402-openrouter-main/) | x402 facilitator and Solana-native payment handling |
| [`workers/`](../workers/) | edge deployments and gateway entry points |
| [`services/`](../services/) | supporting processes for gateway-oriented behavior |

Protocols referenced in the repo:

- `x402`
- `MPP`
- `AP2`
- `A2A`

Core payment docs:

- [articles/ARTICLE_PAYMENTS.md](./articles/ARTICLE_PAYMENTS.md)
- [articles/x402-proxy-worker.md](./articles/x402-proxy-worker.md)
- [clawdrouter/README.md](../clawdrouter/README.md)

---

## 5b. Port map

Default dev ports used across the stack. If you change one, update this table
and the consuming service's `.env.example`.

| Port | Service | Source |
| --- | --- | --- |
| 3000 | clawd-cloud-os | `clawd-cloud-os/.env.example` |
| 3001 | OpenClawd MCP bridge | `chrome-extension/install-openclawd.sh` |
| 3002 | MCP server (`MCP/`) | `MCP/Dockerfile`, `MCP/fly.toml` |
| 3110 | TailClawd web UI | `tailclawd/` |
| 7777 | pAGENT Control UI | `chrome-extension/` |
| 8000 | llm-wiki-tang FastAPI | `llm-wiki-tang/` |
| 8080 | Cloud Bridge (`openclawd-stack/bridge/`) | WebSocket terminal → E2B |
| 8420 | OpenClawd mining/stream SSE | `chrome-extension/` |
| 8421 | Wallet API | `chrome-extension/` |
| 8787 | OpenClawd Orchestrator | `openclawd-stack/orchestrator/` |
| 9090 | Membrain gRPC daemon (`membraned`) | `packages/membrain/pkg/membrane/config.go` |
| 18790 | OpenClawd Gateway WS | external (`OpenClawd`) |

The 8080 ↔ 8787 pair is the intended split inside `openclawd-stack`: the Bridge
is the WebSocket front door (8080), the Orchestrator is the Honcho/Privy/MCP
control plane (8787). They are not alternates.

---

## 6. Skills and agent layer

The skills and agent system spans several directories:

| Directory | Purpose |
|---|---|
| [`skills/`](../skills/) | checked-in skill bundles |
| [`clawdhub/`](../clawdhub/) | search, install, publish, and marketplace flows |
| [`AGENTS/`](../AGENTS/) | 50-agent catalog and agent metadata |
| [`acp_registry/`](../acp_registry/) | registry JSON for agent discovery |

Primary references:

- [AGENTS/README.md](../AGENTS/README.md)
- [skills/README.md](../skills/README.md)
- [articles/AGENT_GUIDE.md](./articles/AGENT_GUIDE.md)
- [articles/ARTICLE_SKILLS.md](./articles/ARTICLE_SKILLS.md)

---

## 7. Environment contract

The shared env surface lives in [`.env.example`](../.env.example).

### Router and model keys

- `OPENROUTER_API_KEY`
- `CLAWDROUTER_BASE_URL`
- `CLAWDROUTER_API_KEY`
- `XAI_API_KEY`
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- `MOONSHOT_API_KEY`

### Runtime and sandboxing

- `E2B_API_KEY`
- `PRIVY_APP_ID`
- `PRIVY_APP_SECRET`
- `HONCHO_URL`
- `HONCHO_API_KEY`
- `HONCHO_ENABLED`
- `HONCHO_WORKSPACE_ID`
- `HONCHO_AGENT_PEER_ID`
- `HONCHO_WEBHOOK_SECRET`

`HONCHO_WEBHOOK*_SECRET` values are deployment secrets. Keep only placeholder
names in docs and `.env.example`; store real values in the local `.env.local`
or the host secret manager.

### Solana and data providers

- `HELIUS_API_KEY`
- `HELIUS_RPC_URL`
- `SOLANA_RPC_URL`
- `SOLANA_CLAWD_BASE_URL`
- `CLAWD_MINT`
- `BIRDEYE_API_KEY`
- `JUPITER_API_KEY`
- `SOLANA_TRACKER_KEY`
- `DFLOW_API_KEY`

### Surface-specific keys

- `TELEGRAM_BOT_TOKEN`
- `TAILSCALE_AUTH_KEY`

### Subproject env examples

- [`openclawd-stack/.env.example`](../openclawd-stack/.env.example)
- [`openclawd-stack/orchestrator/.env.example`](../openclawd-stack/orchestrator/.env.example)
- [`openclawd-stack/bridge/.env.example`](../openclawd-stack/bridge/.env.example)
- [`llm-wiki-tang/.env.example`](../llm-wiki-tang/.env.example)
- [`clawd-cloud-os/.env.example`](../clawd-cloud-os/.env.example)

---

## 8. How to read the repo

Use the docs in this order:

1. [README.md](../README.md) for product-level orientation.
2. This file for layer and directory mapping.
3. [articles/architecture.md](./articles/architecture.md) for deeper architecture notes.
4. Component READMEs such as [clawdrouter/README.md](../clawdrouter/README.md), [openclawd/README.md](../openclawd/README.md), [packages/clawd-wallet/README.md](../packages/clawd-wallet/README.md), and [tailclawd/README.md](../tailclawd/README.md).

---

## 9. High-signal entry points

- Product overview: [README.md](../README.md)
- Architecture article: [articles/architecture.md](./articles/architecture.md)
- Models: [articles/MODELS.md](./articles/MODELS.md)
- Payments: [articles/ARTICLE_PAYMENTS.md](./articles/ARTICLE_PAYMENTS.md)
- Agents: [AGENTS/README.md](../AGENTS/README.md)
- Skills: [skills/README.md](../skills/README.md)
- Router: [clawdrouter/README.md](../clawdrouter/README.md)
- Wallet: [packages/clawd-wallet/README.md](../packages/clawd-wallet/README.md)
- TailClawd: [tailclawd/README.md](../tailclawd/README.md)

---

## 10. Maintenance rule

When the repo changes, update this file to reflect:

- directories that actually exist
- the current shared env contract
- the current request path

Do not use this file as a product landing page. Keep it operational and structural.

