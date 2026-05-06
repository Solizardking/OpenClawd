# OpenClawd Registry

> Open-source registry for the OpenClawd Solana AI agent ecosystem

## 🌐 Links

| Resource | URL |
|----------|-----|
| **Website** | [solanaclawd.com](https://solanaclawd.com) |
| **GitHub** | [github.com/clawdsolana/OpenClawd](https://github.com/clawdsolana/OpenClawd) |
| **Twitter/X** | [x.com/clawddevs](https://x.com/clawddevs) |
| **Telegram** | [t.me/clawdtoken](https://t.me/clawdtoken) |

## 💰 $CLAWD Token

**Address:** `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump`

The $CLAWD token powers the OpenClawd ecosystem with:
- Agent call payments (70% to agent owners)
- $CLAWD holder discounts (10-50% off)
- Revenue buyback and burn

## 📦 Projects (30 Total)

| Category | Projects |
|----------|----------|
| **Framework** | openclawd, src, solana-go-main |
| **AI Agents** | agents (50), skills (97), moltbook-agent |
| **Payments** | clawdrouter, x402-openrouter-main, plugin.delivery |
| **Infrastructure** | openclawd-stack, tailclawd, MCP, CLI, workers, clawdhub |
| **Interfaces** | chrome-extension, beepboop, WatchApp, tailclawd-backup |
| **Bots** | telegram, x-bot, bots |
| **Data** | llm-wiki-tang, chess, API |
| **Tools** | services, packages, npm, examples, websocket-server |
| **Docs** | articles (42 docs) |

See [`registry.json`](registry.json) for full machine-readable metadata.

## 🪪 Metaplex Agent Identity Bridge

The ACP record (`agent.json`) doubles as the source of truth for minting a Metaplex Core agent identity (Agent Registry / 8004 standard).

```bash
# Build & inspect the Metaplex payload without sending a tx
node acp_registry/mint-metaplex.mjs --dry-run

# Mint on devnet — uri must point to a publicly hosted Core asset metadata JSON
node acp_registry/mint-metaplex.mjs \
  --network solana-devnet \
  --uri https://arweave.net/<metadata-hash>
```

On success the script writes `registry.metaplex` back into `agent.json`:

```json
"metaplex": {
  "network": "solana-devnet",
  "core_asset_address": "<base58>",
  "signature": "<base58>",
  "uri": "https://arweave.net/<hash>",
  "minted_at": "2026-05-04T00:00:00.000Z",
  "payer": "<wallet>"
}
```

The `api-registrar` service exposes this over HTTP so other surfaces can resolve the on-chain identity without filesystem coupling:

|Route|Returns|
|-----|-------|
|`GET /api/acp/agent`|full `agent.json` + `_metaplex_registered` flag|
|`GET /api/acp/registry`|full `registry.json`|
|`GET /api/acp/metaplex`|Core asset address + tx signature once minted|

Set `ACP_REGISTRY_DIR` on the registrar to point at this directory if it isn't a sibling of `api-registrar/`.

## 🔐 x402 Payment Protocol

Multi-protocol agentic payment gateway supporting:
- **x402** — HTTP 402 on Solana (Ed25519 + SPL Token)
- **MPP** — Machine Payments Protocol
- **AP2** — Google Agent Payments Protocol
- **A2A** — Google Agent-to-Agent

**Gateway:** `solanaclawd.com/x402`

## ☁️ Cloud Clawd

Browser-based Solana trading terminal via E2B sandboxes.

Components:
- openclawd (OODA loop trading)
- nemoClawd (xAI Grok + 31 MCP tools)
- agentwallet (Privy wallets)
- Full CLI access

## 📜 License

MIT — See [`../LICENSE.md`](../LICENSE.md)

## 🔗 Quick Start

```bash
git clone https://github.com/clawdsolana/OpenClawd.git
cd openclawd
cd agents && npm install
cd ../openclawd && make install && clawd daemon