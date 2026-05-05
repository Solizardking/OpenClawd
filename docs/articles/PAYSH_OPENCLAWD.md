# Pay.sh x OpenClawd: Payment Is the Credential

On May 5, 2026, Solana Foundation announced Pay.sh in collaboration with Google
Cloud. The announcement matters for OpenClawd because it gives autonomous agents
a payment-native path to APIs that normally require human account setup,
credential management, billing relationships, and subscriptions.

Pay.sh changes the integration shape. Instead of asking every OpenClawd user to
create accounts for each provider, store API keys, and pre-negotiate billing,
an agent can use a Solana wallet, discover a priced endpoint, satisfy an x402 or
MPP payment challenge, and continue the request. The payment proof becomes the
credential.

Source: [Solana Foundation Launches Pay.sh in Collaboration with Google Cloud](https://solana.com/news/solana-foundation-launches-pay-sh-in-collaboration-with-google-cloud).

## What Pay.sh Adds

The Solana announcement describes Pay.sh as a gateway service for accountless,
pay-per-request API access using stablecoins on Solana. The initial surface
includes official Google Cloud APIs such as Gemini, BigQuery, BigTable, Cloud
Run, and Vertex AI, plus community API facilitators across ecommerce, data and
intelligence, communications, and Solana infrastructure.

For OpenClawd, this means paid capabilities can be modeled as agent tools
without embedding provider credentials in the repo or generated user projects.
Agents can search a catalog, receive a live rate, request approval, pay from a
wallet balance, and call the endpoint through a gateway.

The important design point is simple:

```text
wallet identity + x402/MPP challenge + stablecoin settlement = API access
```

That maps cleanly onto OpenClawd's financial-agent architecture. OpenClawd
already treats wallets, risk controls, agent permissions, and Solana rails as
first-class primitives. Pay.sh gives those agents a standard route for buying
work from external APIs only when they need it.

## How OpenClawd Integrates It

The OpenClawd payments integration lives under `payments/` and vendors the
Pay/Solana Pay stack in `payments/pay-main`. The repo now exposes root scripts
for installing, building, typechecking, and generating merchant kits:

```bash
npm run install:payments
npm run build:payments
npm run typecheck:payments

npm run payments:merchant -- create google-agent-store \
  --type both \
  --recipient 11111111111111111111111111111111 \
  --label "Google Agent Store" \
  --pay-gateway https://pay.sh \
  --catalog https://pay.sh
```

The generator creates `generated/merchants/<name>` with:

- Solana Pay core copied from `payments/pay-main`
- a local point-of-sale app
- an agentic merchant payment-flow simulator
- `.env.example` gateway and catalog hints
- `openclawd.merchant.json` for agent discovery and routing

The generated manifest declares support for:

```json
{
  "protocols": ["solana-pay", "x402", "mpp"],
  "paySh": {
    "gateway": "https://pay.sh",
    "catalog": "https://pay.sh",
    "stablecoinSettlement": true,
    "agentCredentialModel": "payment-is-the-credential"
  }
}
```

That gives OpenClawd agents a local contract they can read before deciding
whether they are generating a checkout link, validating a merchant payment, or
routing a paid API call through a Pay.sh-style gateway.

## Why This Matters For Agentic Commerce

Most agent workflows do not fail because the model cannot reason. They fail
because the agent cannot access the right service at the right moment without a
human creating an account, pasting a key, setting a budget, and maintaining a
subscription.

Pay.sh compresses that into a request-time payment flow. An OpenClawd agent can
look up a provider, quote the call, ask for approval when money will move, and
execute the smallest useful request. This is a better fit for exploratory
agentic work than prepaid subscriptions because the agent consumes exactly what
the workflow needs.

For ecommerce, that means an OpenClawd user can scaffold a merchant-facing
project that handles wallet checkout and can later route commerce APIs through
paid gateway calls. For data and intelligence, an analyst agent can buy one
query from a warehouse or enrichment provider instead of requiring the user to
set up a long-lived account. For Solana infrastructure, a scanner or trader can
pay for indexed data, RPC, or analytics only when the task requires it.

## Security Model

Generated merchant projects should not contain production private keys, real
provider credentials, or populated env files. The Pay.sh pattern keeps provider
credentials behind the gateway and uses wallet-mediated payment authorization
instead.

OpenClawd should preserve that boundary:

- keep generated `.env.example` files empty or placeholder-only
- store wallet material outside git
- treat provider responses as untrusted external data
- require user approval before paid calls
- prefer the smallest useful paid request
- keep catalog and gateway URLs explicit in `openclawd.merchant.json`

The goal is not to make agents spend freely. The goal is to let agents buy
specific capabilities with clear user intent, auditable manifests, and Solana
settlement rails.

## The OpenClawd Direction

OpenClawd's payment layer now has three connected surfaces:

- **Point of sale:** generate Solana Pay checkout flows for merchants.
- **Agentic merchant simulation:** test payment links, references, and
  validation locally.
- **Pay.sh-compatible API commerce:** route paid API calls through x402/MPP
  gateways where payment is the credential.

That combination gives OpenClawd users a practical path to build their own
agentic ecommerce point of sale, a Google Cloud API-using Solana merchant, or a
broader paid-capability agent that buys only the API calls it needs.

Start here:

```bash
npm run payments:merchant -- create my-store \
  --recipient <merchant-wallet> \
  --label "My Store" \
  --pay-gateway https://pay.sh
```
