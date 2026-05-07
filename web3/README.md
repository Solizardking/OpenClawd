# OpenClawd Web3

This folder vendors the Web3 OpenClawd stack inside the main OpenClawd
repository. The main entrypoint for users is `clawdbot/`, which is also copied
into `packages/clawdbot-template/` so `openclawd create` can use it as the
default project template.

## What To Use

- `clawdbot/` - default Solana/Web3 agent project with Telegram, TEE hooks, and
  a React frontend panel.
- `docs/` - upstream Web3 framework notes.
- `examples/` - standalone Web3 examples.
- `packages/` - upstream framework package snapshot kept for reference. It is
  not added to the root workspace because package names overlap with the main
  OpenClawd packages.

## Commands From Repo Root

```bash
npm run dev:clawdbot
npm run build:clawdbot
npm run typecheck:clawdbot
```

## Commands Inside ClawdBot

```bash
cd web3/clawdbot
bun install
cp .env.example .env
bun run dev
```

Keep this folder public-safe: no populated env files, private keys, wallet
keypairs, hidden wallet material, or production bot tokens.
