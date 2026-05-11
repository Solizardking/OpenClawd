# 🦞 Hermes x402 — Private AI Agent for Nous Research

> **Trade → Earn USDC → Pay for Hermes Inference → Get Smarter → Trade Better**

A self-sustaining, private AI agent that pays for [Nous Research](https://nousresearch.com/) inference API calls via the **x402 protocol** (HTTP 402 Payment Required) using Solana USDC. No accounts, no API keys — just a Solana wallet.

## How It Works

```
┌─────────────────────────────────────────────────────┐
│                  Private Hermes Agent                │
│                                                      │
│  ┌──────────┐   ┌──────────┐   ┌──────────────────┐ │
│  │  Trade    │──▶│  Earn    │──▶│  Nous Inference  │ │
│  │  Solana   │   │  USDC    │   │  via x402        │ │
│  │  DeFi     │   │          │   │                  │ │
│  └──────────┘   └──────────┘   └──────────────────┘ │
│       ▲                                              │
│       └──────────────────────────────────────────────┘
│                    Feedback Loop                      │
└─────────────────────────────────────────────────────┘
```

### The x402 Protocol

1. **Send request** to Nous API without auth → server returns **HTTP 402 Payment Required**
2. **Parse payment requirements** from `X-Payment-Required` header (amount, recipient, chain)
3. **Sign payment payload** with your Solana wallet (Ed25519 via tweetnacl)
4. **Retry** with `X-PAYMENT` header containing the signature
5. **Get response** — inference complete, USDC settled automatically

No API keys, no accounts, no KYC. Just a Solana wallet with some USDC.

## Architecture

```
x402/nous-x402-client/
├── src/
│   ├── hermes-agent.ts     # Main agent — orchestrates trading + inference
│   ├── nous-api.ts         # Nous Research API client (x402 + standard auth)
│   ├── x402-client.ts      # x402 wallet client (tweetnacl signing)
│   ├── trade-loop.ts       # Autonomous DeFi trading loop (OODA)
│   └── test-connection.ts  # End-to-end test suite
├── package.json
├── tsconfig.json
└── README.md
```

## Quick Start

### 1. Install

```bash
cd x402/nous-x402-client
npm install
npm run build
```

### 2. Configure

```bash
# Required for private key signing (recommended)
export SOLANA_PRIVATE_KEY="your_base58_private_key"
export SOLANA_PUBLIC_KEY="your_wallet_address"

# Optional — for RPC access and token data
export HELIUS_API_KEY="your_helius_key"
export BIRDEYE_API_KEY="your_birdeye_key"

# Trading mode (default: paper)
export TRADE_MODE="paper"  # or "live"
```

### 3. Run the Agent

```bash
# Start the full self-sustaining agent
npm start

# Or run just the trading loop
npm run trade

# Run end-to-end tests
npm test -- --quick
```

## Commands

| Command | Description |
|---------|-------------|
| `hermes-x402` | Start the full agent (trade + inference) |
| `hermes-earn` | Run just the autonomous trading loop |
| `npm test -- --quick` | Quick tests (skip paper trading) |
| `npm test` | Full test suite |

### CLI Flags

```bash
hermes-x402 --model=hermes-4.3-70b --live --fast
hermes-earn --live --fast
```

- `--model=<id>` — Choose Nous model (default: hermes-4.3-36b)
- `--live` — Enable live trading (default: paper)
- `--fast` — 15s trade cycles (default: 60s)

## Supported Models

| Model | Input ($/M tokens) | Output ($/M tokens) |
|-------|-------------------|--------------------|
| hermes-4.3-36b | $0.50 | $1.50 |
| hermes-4.3-70b | $0.90 | $2.70 |
| hermes-4-105b | $1.50 | $4.50 |
| hermes-3-405b | $2.50 | $7.50 |
| hermes-3-70b | $0.80 | $2.40 |

## Trading Strategy

The agent uses an **OODA loop** (Observe → Orient → Decide → Act):

- **Observe**: Monitor SOL price trends, trending tokens (SolanaTracker, Jupiter)
- **Orient**: Filter signals by confidence threshold, rank by profitability
- **Decide**: Select highest-confidence trade signal
- **Act**: Execute trade (paper mode simulates, live mode uses Jupiter DEX)

### Paper Trading

Default mode. Tracks P&L with simulated fills — use for testing before going live.

### Live Trading

Set `TRADE_MODE=live` or pass `--live`. Executes real Jupiter DEX swaps. **Start with small amounts.**

## x402 Protocol Details

The x402 payment payload signed by the wallet:

```typescript
interface NousPaymentPayload {
  amount: number;        // USDC amount (smallest unit)
  recipient: string;     // Payee address
  token: string;         // Token symbol (e.g., "USDC")
  chainId: string;       // CAIP-2 chain ID (e.g., "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp")
  nonce: string;         // Unique nonce
  timestamp: number;     // Unix timestamp
  endpoint: string;      // API endpoint path
}
```

The signature is Ed25519 via tweetnacl, using the wallet's private key seed.

## Dependencies

- **tweetnacl** — Ed25519 signing
- **bs58** — Base58 key decoding
- **@solana/web3.js** — Solana RPC (balance checks)
- **x402-core** — x402 protocol types and utilities

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SOLANA_PRIVATE_KEY` | Yes* | Wallet private key (base58) |
| `SOLANA_PUBLIC_KEY` | Yes* | Wallet public key/address |
| `HELIUS_API_KEY` | No | Helius RPC access |
| `BIRDEYE_API_KEY` | No | Token data API |
| `TRADE_MODE` | No | "paper" (default) or "live" |

*Required for signing. No API keys needed for Nous access.

## Security

- **No API keys** for AI inference — x402 handles payments via signed payloads
- **Private key stays local** — signing happens in-memory with tweetnacl
- **Paper trading by default** — test strategies before risking real funds
- **Minimal dependencies** — tweetnacl, bs58, @solana/web3.js

## License

MIT — see root [LICENSE](/LICENSE)
