# x402 Facilitator — End-to-End Setup

A walkthrough for a new dev cloning OpenClawd and standing up their own facilitator. Pick **one** chain to start (Solana *or* Base); the second one is just two more secrets.

> Read [`README.md`](./README.md) first for the architecture context. This file is the recipe.

---

## 0. Prerequisites

```bash
node --version   # >= 18
pnpm --version   # any recent
brew install pay # optional, for client-side testing
```

You'll also need:

- A **Cloudflare account** on the Workers Paid plan ($5/month — required for KV).
- An **RPC URL** for the chain you're settling on. Free tiers from Helius, Alchemy, or Quicknode are fine for development.
- A **treasury wallet** that will receive payments. Generate the keypair offline; the facilitator only needs the public address.

---

## 1. Build x402-core

```bash
cd x402/x402-core
pnpm install
pnpm build
```

Verify with `pnpm typecheck`. The facilitator imports core as a workspace dependency, so this has to succeed first.

---

## 2. Configure the facilitator

```bash
cd ../x402-facilitator
pnpm install
npx wrangler login
```

### 2a. Find your account ID

```bash
npx wrangler whoami
```

Open [`wrangler.toml`](./x402-facilitator/wrangler.toml), uncomment `account_id`, and paste it in. (Optional for `wrangler dev`; required for `wrangler deploy`.)

### 2b. Create the KV namespace

```bash
pnpm kv:create          # prints { id = "..." }
pnpm kv:create:preview  # prints { preview_id = "..." }
```

Copy both IDs into `wrangler.toml` under `[[kv_namespaces]]`.

### 2c. Local secrets

```bash
cp .dev.vars.example .dev.vars
```

Fill in based on your chain:

#### Solana

```dotenv
SOLANA_RPC_URL="https://mainnet.helius-rpc.com/?api-key=..."
SOLANA_TREASURY="YourBase58TreasuryPubkey"
```

For development, point at devnet:

```dotenv
SOLANA_RPC_URL="https://api.devnet.solana.com"
```

The chain ID in your 402 challenges then becomes `CHAINS.SOLANA_DEVNET`.

#### Base

```dotenv
BASE_RPC_URL="https://mainnet.base.org"
EVM_TREASURY="0xYourTreasuryAddress"
```

For development, use Base Sepolia:

```dotenv
BASE_RPC_URL="https://sepolia.base.org"
```

---

## 3. Run locally

```bash
pnpm dev
# Worker on http://localhost:8787

# in another shell
curl http://localhost:8787/health
```

You should get a JSON payload listing the supported chains and endpoints. If the chain you funded isn't there, double-check `.dev.vars`.

---

## 4. Smoke test the verify flow

The cleanest end-to-end test uses `pay` against a local merchant. Spin up the demo gateway from the vendored `pay` source:

```bash
pay --sandbox server demo
```

That gives you a 402-gated endpoint at `http://127.0.0.1:1402`. Point its facilitator URL at your local worker (`http://localhost:8787`) by editing the generated `pay-demo.yaml`, then:

```bash
pay --sandbox curl http://127.0.0.1:1402/api/v1/reports/usage
```

Watch the worker logs — you should see one `POST /verify` and one `POST /settle` per request.

---

## 5. Deploy to Cloudflare

```bash
# staging — published to <name>.<your-subdomain>.workers.dev
pnpm deploy

# production — uses [env.production] in wrangler.toml
pnpm deploy:prod
```

Push your secrets to the deployed worker:

```bash
wrangler secret put SOLANA_RPC_URL
wrangler secret put SOLANA_TREASURY
# add BASE_RPC_URL / EVM_TREASURY if you accept Base
```

Tail logs in production:

```bash
pnpm tail
```

---

## 6. Point a service at it

Any HTTP service that wants to charge per request issues a 402 with a `PaymentRequired` body, then calls your facilitator on the retry. Full snippet in [`x402-facilitator/README.md#wiring-it-into-your-service`](./x402-facilitator/README.md#wiring-it-into-your-service).

---

## 7. Adding a chain

The codebase is small enough to extend in an afternoon.

1. Add the CAIP-2 ID and metadata to [`x402-core/src/types/chains.ts`](./x402-core/src/types/chains.ts).
2. Add a chain check (`isXChain`) to [`x402-core/src/utils/caip.ts`](./x402-core/src/utils/caip.ts) if the namespace is new.
3. Add a settlement adapter under [`x402-facilitator/src/chains/`](./x402-facilitator/src/chains/) — copy `solana.ts` for JSON-RPC chains or `evm.ts` for chains where you'd use viem.
4. Wire it in `X402Facilitator` ([`facilitator.ts:46`](./x402-facilitator/src/facilitator.ts#L46)).
5. Re-run `pnpm typecheck` in both packages.

---

## Common gotchas

- **`wrangler dev` won't start without the KV namespace IDs.** Even local dev reads `wrangler.toml` — leaving `YOUR_KV_NAMESPACE_ID` in there will fail.
- **`node_compat = true` is deprecated.** Use `compatibility_flags = ["nodejs_compat"]` (already set in this repo).
- **Treasury wallet must receive, not send.** The facilitator never holds private keys — the *payer* signs the transaction, and the chain enforces that funds land at `SOLANA_TREASURY` / `EVM_TREASURY`. Don't paste a keypair into `.dev.vars`; the public address is enough.
- **EVM adapter is a stub.** [`evm.ts`](./x402-facilitator/src/chains/evm.ts) returns a fake tx hash. Drop in `viem` and a signer before going to mainnet — `solana.ts` is the model. (The Solana adapter also doesn't sign; it relies on the payer-signed transaction in the payload.)
- **Cloudflare Bot Management is Enterprise.** Without it, `cf-bot-score` is missing and every request lands in `BotCategory.UNKNOWN` at base price. That's fine — the facilitator falls back gracefully.
