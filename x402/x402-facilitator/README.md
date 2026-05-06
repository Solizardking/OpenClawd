# @autonomy/x402-facilitator

Cloudflare Worker that runs the **`/verify`** and **`/settle`** half of the x402 payment loop for Solana, Base/EVM, and Bitcoin. Pairs with [`@autonomy/x402-core`](../x402-core) on the protocol side and [`pay`](../../payments/pay-main) on the client side.

## What it does

1. **`POST /verify`** — your service forwards a `PAYMENT-SIGNATURE` header here. The worker verifies the signature against the chain's curve (ed25519 for Solana, secp256k1 for EVM/Bitcoin), applies a bot-aware price multiplier from the Cloudflare bot-management headers, mints a single-use receipt in KV, and returns it.
2. **`POST /settle`** — your service hands the receipt back when it's ready to actually move funds. The worker dispatches to the right chain adapter (`SolanaSettlement`, `EvmSettlement`, `BitcoinSettlement`) and returns a tx hash + explorer URL.
3. **`GET /bot-info`** — debug endpoint; echoes the bot category Cloudflare assigned to the request.
4. **`GET /health`** — service info.

CORS is open by default. The receipts KV stores the unsettled receipt for 1 hour, the settled record for 24 hours.

## Prerequisites

- Cloudflare account with **Workers Paid** plan (KV namespaces require it)
- Node 18+, `pnpm` (or npm/yarn — repo uses pnpm workspaces)
- A treasury wallet on each chain you want to accept
- An RPC URL on each chain (Helius, Alchemy, Infura, Quicknode, or self-hosted)

## Setup

### 1. Install

```bash
cd x402/x402-core && pnpm install && pnpm build
cd ../x402-facilitator && pnpm install
```

The facilitator depends on `@autonomy/x402-core` as a workspace package, so core needs to be built first.

### 2. Cloudflare account + KV namespace

```bash
# log in once per machine
npx wrangler login

# create the receipts KV namespace
pnpm kv:create
pnpm kv:create:preview
```

Each command prints an `id`. Paste them into [`wrangler.toml`](./wrangler.toml) under the `kv_namespaces` block, and replace `YOUR_CLOUDFLARE_ACCOUNT_ID` with your account ID (`npx wrangler whoami` will tell you).

### 3. Local secrets

Copy the template and fill it in:

```bash
cp .dev.vars.example .dev.vars
```

`.dev.vars` is gitignored. For production, set the same keys with `wrangler secret put <NAME>`.

| Secret | Required for | Notes |
| --- | --- | --- |
| `SOLANA_RPC_URL` | Solana | Helius / Quicknode / mainnet-beta |
| `SOLANA_TREASURY` | Solana | base58 pubkey that receives payments |
| `BASE_RPC_URL` | Base/EVM | Optional — leave empty to disable EVM |
| `EVM_TREASURY` | Base/EVM | 0x... address that receives payments |
| `ETHEREUM_RPC_URL` | Ethereum | Optional |
| `BITCOIN_RPC_URL` | Bitcoin | Optional, stub adapter |
| `BITCOIN_TREASURY` | Bitcoin | Optional |

The facilitator only initializes adapters for the chains you fund — a Solana-only deploy can leave every EVM/Bitcoin var blank.

### 4. Run locally

```bash
pnpm dev
# Worker on http://localhost:8787

# health check
curl http://localhost:8787/health
```

### 5. Deploy

```bash
# staging
pnpm deploy

# production env (uses [env.production] in wrangler.toml)
pnpm deploy:prod
```

After deploy, push your secrets to the Worker:

```bash
wrangler secret put SOLANA_RPC_URL
wrangler secret put SOLANA_TREASURY
wrangler secret put BASE_RPC_URL       # optional
wrangler secret put EVM_TREASURY       # optional
```

Tail logs:

```bash
pnpm tail
```

## Wiring it into your service

A merchant API issues a 402 with a `PaymentRequired` body, then calls the facilitator on the retry. Minimal Hono / Express handler:

```ts
import {
  CHAINS,
  PaymentScheme,
  type PaymentRequired,
  type PaymentSignature,
} from '@autonomy/x402-core';

const FACILITATOR = 'https://x402.your-domain.com';

app.get('/api/data', async (req, res) => {
  const sigHeader = req.header('X-Payment-Signature');

  if (!sigHeader) {
    const challenge: PaymentRequired = {
      schemes: [PaymentScheme.EXACT],
      networks: [CHAINS.SOLANA_MAINNET, CHAINS.BASE_MAINNET],
      amount: 0.001,
      token: {
        symbol: 'USDC',
        mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        contract: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
        decimals: 6,
        chainId: CHAINS.SOLANA_MAINNET,
      },
      payTo: process.env.TREASURY!,
      facilitatorUrl: FACILITATOR,
      expiresAt: Math.floor(Date.now() / 1000) + 300,
    };
    return res.status(402).json(challenge);
  }

  const signature: PaymentSignature = JSON.parse(sigHeader);

  const verify = await fetch(`${FACILITATOR}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ signature }),
  }).then((r) => r.json());

  if (!verify.valid) return res.status(402).json({ error: verify.error });

  // optional: settle now, or queue for later
  await fetch(`${FACILITATOR}/settle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ signature, receipt: verify.receipt }),
  });

  res.setHeader('X-Payment-Receipt', verify.receipt);
  return res.json({ data: 'paid content' });
});
```

The `pay` CLI handles everything client-side:

```bash
pay --sandbox curl https://your-service.example.com/api/data
```

## Bot-aware pricing

The worker reads `cf-bot-score`, `cf-verified-bot`, `cf-bot-managed`, `cf-bot-tags` headers (Cloudflare Bot Management — Enterprise). Categories and multipliers come from `STANDARD_BOT_PRICING` in [`x402-core`](../x402-core/src/types/bot-pricing.ts):

| Category | Multiplier | Allowed |
| --- | --- | --- |
| `human` | 1.0× | yes |
| `verified_bot` | 1.5× | yes (registered crawlers) |
| `likely_automated` | — | blocked unless verified |
| `automated` | — | blocked unless verified |
| `unknown` | 1.0× | yes |

Without Bot Management, every request is `unknown` and pays base price. Adjust the rules in [`facilitator.ts:113`](./src/facilitator.ts) to match your policy.

## Files

```
x402-facilitator/
├── src/
│   ├── index.ts          # Cloudflare Worker entry; CORS + routing
│   ├── facilitator.ts    # X402Facilitator: verify + settle + bot pricing
│   └── chains/
│       ├── solana.ts     # SOL + SPL transfers via JSON-RPC
│       ├── evm.ts        # ETH + ERC-20 (placeholder — wire viem/ethers)
│       └── bitcoin.ts    # on-chain / LN (stub)
├── wrangler.toml         # Worker + KV + env config
├── .dev.vars.example     # local secret template
└── package.json
```

## Endpoints

| Method | Path | Body | Returns |
| --- | --- | --- | --- |
| GET | `/health` | — | service info |
| POST | `/verify` | `PaymentVerificationRequest` | `{ valid, receipt, finalAmount, category }` |
| POST | `/settle` | `PaymentSettlementRequest` | `{ success, txHash, explorerUrl, status }` |
| GET | `/bot-info` | — | bot category + Cloudflare headers |

Request/response types are exported from [`@autonomy/x402-core`](../x402-core/src/types/payment.ts).

## License

MIT.
