# OpenClawd Payments

`payments/pay-main` vendors the Solana Pay/Pay stack used by OpenClawd for
Solana-native commerce, HTTP 402 flows, MCP payment access, and local point of
sale demos.

## Build

```bash
npm run install:payments
npm run build:payments
npm run typecheck:payments
```

## Generate A Merchant Kit

```bash
npm run payments:merchant -- create demo-store \
  --recipient 11111111111111111111111111111111 \
  --label "Demo Store"
```

The generated project lands in `generated/merchants/<name>` and includes:

- `solana-pay/core` copied from `payments/pay-main`
- the Solana Pay point-of-sale example
- the agentic merchant payment-flow example
- `openclawd.merchant.json` for OpenClawd agents and merchant tooling
- local scripts for POS development, SSL proxying, and merchant-flow simulation

Use `--type pos`, `--type merchant`, or `--type both` to choose which examples
are included.
