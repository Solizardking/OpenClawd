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
- Runs a bounded paper-trading research loop.
- Shows the Honcho-style persistence payload that would survive future sessions.
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
open hackathon/docs/autonomous-research-loop.md
open hackathon/docs/package-shades.md
```

Narrative:

1. OpenClawd already works as a Solana financial agent stack.
2. Robotics needs the same primitives: identity, payments, memory, command gates, audit receipts.
3. The hackathon package adapts the repo into a robotics command layer.
4. The offline demo proves the control flow without exposing keys.
5. The autonomous research block shows how OpenClawd evolves trading strategies through paper experiments before anything reaches a live wallet.
6. The package shades doc shows how each repo package contributes without exposing private code or secrets.

## Demo 5: Real Hardware Path

Read:

```bash
open hackathon/robotics/README.md
open Robotics/README.md
```

Optionally build the hardware-side binary:

```bash
cd cmd/openclawd-go
go build -o openclawd-go .
./openclawd-go version
```

If the gateway is running, show the public-safe hardware and task routes:

```bash
npm --prefix gateway run http:once
curl -sS http://127.0.0.1:8788/api/robotics/hardware
./openclawd-go gateway connect --robot-id asimov-v1 --robot-url http://asimov.local:8080
./openclawd-go robot task --robot-id asimov-v1 --objective "inspect aisle B hazard" --amount-usd 0.005
```

What it demonstrates:

- Real hardware materials are included: CAD, electrical wiring, device tree, and MuJoCo model.
- The robot can be registered through the OpenClawd gateway.
- Robotic tasks produce x402, MPP, and Pay.sh-compatible payment intent metadata.
- Physical motion and fund transfer remain dry-run unless explicitly enabled by the operator.

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
- `HONCHO_API_KEY` for durable cross-session strategy memory, with local memory as the offline fallback.
