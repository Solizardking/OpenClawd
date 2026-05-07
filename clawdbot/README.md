# ClawdBot Web3 Starter

ClawdBot is the default OpenClawd project template and now has a top-level repo
home at [`../../clawdbot`](../../clawdbot). It gives new users a ready-to-run
agent with Solana data hooks, optional Telegram, optional Phala TEE key
derivation, and a branded React UI surface.

## Quick Start

```bash
cd clawdbot
bun install
cp .env.example .env
$EDITOR .env
bun run dev
```

Minimum useful env:

```bash
OPENROUTER_API_KEY=
HELIUS_API_KEY=
BIRDEYE_API_KEY=
```

Optional env:

```bash
TELEGRAM_BOT_TOKEN=      # Telegram bot channel
SOLANA_PRIVATE_KEY=      # signed execution only after read-only testing
TEE_MODE=OFF             # set for Phala/dstack deployments
WALLET_SECRET_SALT=      # only for TEE key derivation
```

## Commands

```bash
bun run dev          # local development
bun run start        # production start through openclawd
bun run build        # build runtime and frontend assets
bun run type-check   # TypeScript validation
bun run test         # component and e2e tests
```

## Files

- `src/character.ts` defines the OpenClawd agent identity and enabled plugins.
- `src/index.ts` registers the project agent and Phala TEE plugin.
- `src/plugin.ts` shows the starter action, provider, route, and service.
- `src/frontend/` contains the ClawdBot dashboard panel.
- `teePlugin.ts` derives EVM and Solana keys from Phala dstack when enabled.

Keep `.env`, private keys, wallet files, and bot tokens out of git.
