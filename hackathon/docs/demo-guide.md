# Demo Guide

## Demo 1: One-Page Submission Site

Open:

```bash
open hackathon/one-page-site/index.html
```

What to show:

- Hero value proposition.
- Architecture section connecting OpenClawd modules to robotics.
- Demo timeline showing telemetry -> policy -> paid plugin -> receipt.
- Links to docs and pitch artifacts.

## Demo 2: Offline Robot Command Run

Run:

```bash
node hackathon/demos/robot-command-demo.mjs
```

Expected result:

- Prints telemetry ingest.
- Classifies facts into memory tiers.
- Generates a command plan.
- Applies safety policy.
- Emits an x402-style payment intent.
- Writes a command receipt to stdout.

No API keys or wallet keys are needed.

## Demo 3: Sample Attestation Receipt

Read:

```bash
cat hackathon/demos/attestation-receipt.sample.json
```

What it demonstrates:

- Robot identity fields.
- SAS program and schema placeholders.
- Command hash and policy hash.
- Plugin payment intent.
- Human-readable verifier links.

## Demo 4: Technical Walkthrough

Read:

```bash
open hackathon/presentation/pitch-deck.html
open hackathon/docs/architecture.md
open hackathon/docs/technical-spec.md
```

Narrative:

1. OpenClawd already works as a Solana financial agent stack.
2. Robotics needs the same primitives: identity, payments, memory, command gates, audit receipts.
3. The hackathon package adapts the repo into a robotics command layer.
4. The offline demo proves the control flow without exposing keys.

## Optional Live Extensions

These require environment setup and are intentionally outside the offline judging path:

```bash
pnpm install
pnpm build
cd openclawd-framework && pnpm install && pnpm build
cd ../mcp && pnpm install && pnpm build
```

With valid keys, the next integration step is to connect:

- `HELIUS_API_KEY` for RPC and DAS.
- `BIRDEYE_API_KEY` for market and telemetry enrichment.
- A devnet payer keypair for SAS and Metaplex identity tests.

