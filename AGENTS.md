# OpenClawd — Financial AI Agent Platform

## Core Identity

- **Platform:** OpenClawd — Solana-native financial AI agent stack
- **Tagline:** Autonomous trading agents for Solana DeFi
- **Symbol:** 🦞 $CLAWD (Solana SPL Token: `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump`)

## Architecture

```
openclawd/
├── src/
│   ├── cli/           # Clawd CLI commands
│   ├── commands/      # Agent command handlers
│   ├── services/      # Financial services (Jupiter, Helius, Birdeye)
│   ├── agents/        # Financial agent implementations
│   ├── tools/         # MCP tools for DeFi/trading
│   ├── skills/        # Financial agent skills
│   └── wallet/        # Agent wallet operations
├── skills/            # 90+ bundled skills
├── AGENTS.md          # This file
├── CLAW.md           # Agent capabilities
└── CLAWD.md          # Trading strategy
```

## Build Commands

- **Install:** `pnpm install`
- **Type check:** `pnpm typecheck`
- **Build:** `pnpm build`
- **Test:** `pnpm test`

## Naming Convention

- Product name: **OpenClawd**
- CLI command: **clawd**
- Public package scope: `@openclawdsolana/*`
- Core package names vary by surface; prefer the existing package name in
  that subproject's `package.json`.
- Config keys: `openclawd.*`

## Financial Agent Capabilities

### Core Agents

| Agent | Purpose | Skills |
|-------|---------|--------|
| **Trader** | Jupiter DEX execution, position management | swap, analyze, monitor |
| **Scanner** | Pump.fun token discovery, graduation tracking | scan, signal, snipe |
| **Analyst** | Wallet analysis, PnL tracking, market research | research, portfolio |
| **Monitor** | Real-time price alerts, whale tracking | watch, alert |

### Trading Stack

- **Jupiter:** DEX routing, swap execution, price discovery
- **Helius:** Wallet intelligence, DAS API, RPC
- **Birdeye:** Token data, trending, OHLCV charts
- **Pump.fun:** Token launches, bonding curve trading

### Skills Catalog

Financial skills in `skills/`:
- `jupiter-swap` — DEX execution
- `pump-scanner` — Token discovery
- `wallet-analyst` — On-chain analysis
- `market-research` — Market intelligence
- `risk-manager` — Position sizing, stops

## Environment Variables

```bash
# Required
HELIUS_API_KEY=           # RPC + DAS
SOLANA_RPC_URL=           # Solana RPC
JUPITER_API_KEY=          # Jupiter (optional)

# Optional
SOLANA_PRIVATE_KEY=       # Trading wallet
BIRDEYE_API_KEY=          # Token data
```

Do not commit populated env files or wallet keypairs. New agent work should
start read-only with `HELIUS_API_KEY` and `BIRDEYE_API_KEY`; add
`SOLANA_PRIVATE_KEY` only when the execution path is permission-gated and
tested.
