# OpenClawd x402

Fork-and-run reference implementation of the [x402](https://x402.org) HTTP 402 payment protocol for **Solana** and **Base** (and any EVM L2), built to drop into [OpenClawd](../AGENTS.md) and the Solana Foundation [`pay`](../payments/pay-main/README.md) stack.

This bundle is two TypeScript packages plus the vendored `pay` CLI:

| Path | What it is |
| --- | --- |
| [`x402-core/`](./x402-core) | CAIP-2 chain IDs, payment payload + signature types, bot-aware pricing, ed25519 / secp256k1 verification |
| [`x402-facilitator/`](./x402-facilitator) | Cloudflare Worker that runs `/verify` and `/settle` for Solana, Base/EVM, and Bitcoin |
| [`../payments/pay-main/`](../payments/pay-main) | The `pay` CLI — client side that handles 402 challenges and signs with a local wallet |

## Why this exists

You want to charge per HTTP request — for an API, an MCP tool, an agent action — and you want the proof of payment to *be* the credential. No accounts, no API keys, no monthly subscriptions. The new dev forks this repo, picks a chain (Solana or Base), points the facilitator at their treasury wallet, deploys, and charges in USDC the same afternoon.

```
┌──────────┐        402 + PaymentRequired         ┌──────────────┐
│  client  │ ◄──────────────────────────────────── │ your service │
│  (pay)   │                                      │              │
│          │  retry: PAYMENT-SIGNATURE: <sig>     │              │
│          │ ────────────────────────────────────► │              │
└──────────┘                                      └──────┬───────┘
                                                         │
                                  POST /verify           ▼
                                            ┌────────────────────────┐
                                            │  x402-facilitator      │
                                            │  (Cloudflare Worker)   │
                                            │                        │
                                            │  • verify signature    │
                                            │  • bot-aware pricing   │
                                            │  • mint receipt (KV)   │
                                            │  POST /settle          │
                                            │  • on-chain transfer   │
                                            └────────────────────────┘
                                                         │
                                  Solana RPC ◄───────────┤
                                  Base RPC   ◄───────────┘
```

## Quick start

```bash
# 1. Install + build core
cd x402/x402-core && pnpm install && pnpm build

# 2. Configure facilitator (see x402-facilitator/README.md for details)
cd ../x402-facilitator
cp .dev.vars.example .dev.vars
# edit .dev.vars: SOLANA_RPC_URL, SOLANA_TREASURY, BASE_RPC_URL, EVM_TREASURY

# 3. Local dev
pnpm install
pnpm dev   # http://localhost:8787

# 4. Smoke test
curl http://localhost:8787/health
```

Full step-by-step (Cloudflare account, KV namespace, treasury wallets, mainnet vs testnet) lives in [`SETUP.md`](./SETUP.md).

## Pick your chain

The facilitator ships with three settlement adapters:

- [`src/chains/solana.ts`](./x402-facilitator/src/chains/solana.ts) — SOL + SPL token transfers via JSON-RPC
- [`src/chains/evm.ts`](./x402-facilitator/src/chains/evm.ts) — Base, Ethereum, Arbitrum, Optimism, Polygon (ETH + ERC-20)
- [`src/chains/bitcoin.ts`](./x402-facilitator/src/chains/bitcoin.ts) — on-chain or Lightning (stub)

For a Solana-only deployment, leave the EVM/Bitcoin secrets empty — the facilitator only initializes the chains you fund. Same the other way for a Base-only deployment.

CAIP-2 chain IDs the core understands today:

| Chain | CAIP-2 ID |
| --- | --- |
| Solana mainnet | `solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp` |
| Solana devnet | `solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1` |
| Base mainnet | `eip155:8453` |
| Base sepolia | `eip155:84532` |
| Ethereum | `eip155:1` |
| Arbitrum One | `eip155:42161` |
| Optimism | `eip155:10` |
| Polygon | `eip155:137` |
| Bitcoin | `bip122:000000000019d6689c085ae165831e93` |

Add a chain by editing [`x402-core/src/types/chains.ts`](./x402-core/src/types/chains.ts) and a settlement adapter under [`x402-facilitator/src/chains/`](./x402-facilitator/src/chains).

## Integrating with OpenClawd

The OpenClawd CLI runs through the `pay` wrapper for client-side 402 handling. Once your facilitator is deployed at, say, `https://x402.your-domain.com`, point a service at it by issuing a 402 with this header on payment-required endpoints:

```ts
import { CHAINS, PaymentScheme, type PaymentRequired } from '@autonomy/x402-core';

const challenge: PaymentRequired = {
  schemes: [PaymentScheme.EXACT],
  networks: [CHAINS.SOLANA_MAINNET, CHAINS.BASE_MAINNET],
  amount: 0.001,
  token: {
    symbol: 'USDC',
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',  // Solana
    contract: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // Base
    decimals: 6,
    chainId: CHAINS.SOLANA_MAINNET,
  },
  payTo: process.env.TREASURY!,
  facilitatorUrl: 'https://x402.your-domain.com',
  expiresAt: Math.floor(Date.now() / 1000) + 300,
};
```

Then any agent launched with `pay --sandbox clawd "..."` (see [`../payments/PAYSH.md`](../payments/PAYSH.md)) signs and retries automatically.

## What's intentionally not done

- The Bitcoin adapter is a stub. Wire it to LND / CLN / Mempool API yourself.
- The EVM adapter returns a placeholder tx hash. Drop in `viem` or `ethers` to actually broadcast — `solana.ts` is the model to copy.
- There is no rate limiter beyond Cloudflare's defaults. Add one in `src/index.ts` if you need it.
- Receipts expire after 1 hour pre-settlement, 24 hours post. Tune in `facilitator.ts` if you need a longer audit trail.

## License

MIT.
