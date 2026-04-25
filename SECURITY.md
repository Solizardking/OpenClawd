# Security Policy

## Reporting a Vulnerability

If you discover a security issue in OpenClawd, please **do not** open a public
GitHub issue. Instead, open a private security advisory on this repository:

> https://github.com/x402agent/OpenClawd-Typescript/security/advisories/new

Please include:

- A description of the issue and its potential impact
- Steps to reproduce, or a proof-of-concept
- Any suggested mitigation, if you have one

We will acknowledge receipt within 72 hours and aim to provide a remediation
plan within 14 days.

## Handling Secrets

OpenClawd integrates with many third-party APIs (Solana RPC providers,
Anthropic, OpenAI, Twitter, Bags.fm, Polymarket, Cloudflare, Supabase, etc.)
and can sign Solana / EVM transactions. Treat every value listed in
[`X/.env.example`](X/.env.example) as sensitive.

- **Never commit a populated `.env` file.** The `.gitignore` excludes `.env`
  and `*.pem` / `*.key` / `wallet.json` / `keypair.json` patterns by default.
- **Wallet private keys** (`PRIVATE_KEY`, `SOLANA_PRIVATE_KEY`,
  `BAGS_PRIVATE_KEY`, `POLYMARKET_PRIVATE_KEY`, `ASTER_PRIVATE_KEY`,
  `BUILDER_PRIVATE_KEY`, `THIRDWEB_VAULT_KEY`,
  `PRIVY_AUTHORIZATION_PRIVATE_KEY`, `CDP_API_KEY_PRIVATE_KEY`) should
  ideally come from a hardware wallet, KMS, or signer service — not a flat
  file. If you must use a flat file in development, keep it on an
  air-gapped or testnet-only wallet and fund it with the bare minimum.
- **Rotate all keys** as soon as you suspect exposure. Most providers (Helius,
  Anthropic, OpenAI, Cloudflare, Supabase, GitHub) let you revoke and reissue
  in seconds.
- **Run with the smallest scope possible.** Many of these APIs offer
  read-only / scoped tokens — prefer those over full-access keys.

## Supply Chain

Dependencies are pinned through `package.json` and `pnpm-lock.yaml` /
`package-lock.json`. Run `pnpm audit` (or `npm audit`) before each release.
