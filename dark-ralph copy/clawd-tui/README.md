# OpenClawd TUI

[![npm version](https://img.shields.io/npm/v/@openclawdsolana/clawd-tui.svg?color=ff6b35&style=for-the-badge)](https://www.npmjs.com/package/@openclawdsolana/clawd-tui)
[![npm downloads](https://img.shields.io/npm/dm/@openclawdsolana/clawd-tui.svg?style=for-the-badge)](https://www.npmjs.com/package/@openclawdsolana/clawd-tui)
[![node](https://img.shields.io/node/v/@openclawdsolana/clawd-tui.svg?style=for-the-badge)](https://nodejs.org/)
[![license](https://img.shields.io/npm/l/@openclawdsolana/clawd-tui.svg?style=for-the-badge)](./LICENSE)

> 🦞 Claws that code, brains that deploy.

A lobster-themed agent terminal built on [`@openrouter/agent`](https://www.npmjs.com/package/@openrouter/agent) with first-class Solana on-chain awareness. Adaptive input block, streaming tool calls, session persistence, slash commands, approval gates for destructive actions — and live Birdeye + Helius DAS lookups whenever you paste a Solana address.

📦 **Published:** [`@openclawdsolana/clawd-tui` on npm](https://www.npmjs.com/package/@openclawdsolana/clawd-tui) · 📰 **What's new in v0.2:** [Solana-aware terminal](./docs/v0.2-solana-aware-terminal.md)

```text
 ██████╗██╗      █████╗ ██╗    ██╗██████╗
██╔════╝██║     ██╔══██╗██║    ██║██╔══██╗
██║     ██║     ███████║██║ █╗ ██║██║  ██║
██║     ██║     ██╔══██║██║███╗██║██║  ██║
╚██████╗███████╗██║  ██║╚███╔███╔╝██████╔╝
 ╚═════╝╚══════╝╚═╝  ╚═╝ ╚══╝╚══╝ ╚═════╝
```

## Install

One-shot run (no install):

```bash
npx -y @openclawdsolana/clawd-tui
```

Global install (recommended):

```bash
npm install -g @openclawdsolana/clawd-tui
clawd
```

Both `clawd` and `clawd-tui` are exposed as binaries.

On first run, `clawd` opens an OpenRouter OAuth (PKCE) login in your browser and caches the resulting key at `~/.config/openclawd/openrouter-key` (mode `0600`). Re-auth any time with `clawd --login`. If the web-callback flow is blocked, fall back to the local-loopback flow with `clawd --login --local-callback`.

You can also pre-set a key:

```bash
export OPENROUTER_API_KEY=sk-or-v1-...
clawd
```

Get a key at [openrouter.ai/settings/keys](https://openrouter.ai/settings/keys).

## Publish troubleshooting

This package lives in `clawd-tui/clawd-tui/`. The repository root is private and should not be published directly.

```bash
npm run publish:tui:dry-run
NPM_OTP=123456 npm run publish:tui:otp
```

`E403 Two-factor authentication or granular access token with bypass 2fa enabled is required` means the tarball is valid, but npm requires a fresh OTP or a granular automation token for the `@openclawdsolana` org. A successful dry run should show `@openclawdsolana/clawd-tui`, a small tarball, and only `dist`, `README.md`, `LICENSE`, and `package.json`.

## OpenClawd npm ecosystem

The TUI sits inside the broader [`@openclawdsolana`](https://www.npmjs.com/org/openclawdsolana) package surface:

| Package | Version | Purpose |
| --- | --- | --- |
| `@openclawdsolana/clawd-code-cli` | `1.9.1` | Solana lobster coding CLI and OpenClawd terminal runtime |
| `@openclawdsolana/leviathan` | `0.2.3` | Sovereign AI Lobster Runtime on Solana |
| `@openclawdsolana/agents-x402` | `0.1.0` | x402 monetization for MCP servers, HTTP handlers, and agent tool calls |
| `@openclawdsolana/agentwallet` | `0.1.1` | Encrypted Solana + EVM keypair vault |
| `@openclawdsolana/clawdrouter` | `0.1.1` | LLM router with wallet-signed USDC micropayments |
| `@openclawdsolana/clawd-tui` | `0.2.2` | OpenRouter-native lobster terminal |
| `@openclawdsolana/automaton` | `0.1.0` | Sense -> Think -> Strike -> Drift runtime |
| `@openclawdsolana/pagent-core` | `1.6.4` | GUI vision agent core |
| `@openclawdsolana/percolator` | `1.0.3` | Agentic Solana perpetuals CLI |
| `@openclawdsolana/plugin-sdk` | `1.0.0` | Plugin SDK with OpenAPI, Zod, and attestation helpers |
| `@openclawdsolana/chat-plugins-gateway` | `1.1.2` | Edge plugin gateway with deny-first permissions |

## Agent staking and metaprotocol docs

OpenClawd's Solana agent stack now includes Metaplex Agent staking, agent payment rails, and market/operator TUIs. Key local references:

- Main app README: `/Users/8bit/Downloads/clawd-terminal/README.md`
- Agents catalog README: `/Users/8bit/Downloads/clawd-terminal/agents/README.md`
- Pay Agents guide: `/Users/8bit/Downloads/clawd-terminal/docs/pay-agents.md`
- Clawd Stake program: `/Users/8bit/Downloads/clawd-terminal/programs/clawd-stake/README.md`
- Clawd TUI README: `/Users/8bit/Downloads/clawd-terminal/clawd-tui/clawd-tui/README.md`
- Dark Ralph TUI README: `/Users/8bit/fraud/OpenClawd/dark-ralph/README.md`

The staking surface is intentionally large enough to be operable from terminal
workflows: the TUI can inspect Solana assets through Helius/Birdeye context,
then hand users to `/staking` for wallet-signed Core `FreezeDelegate` stake and
unstake transactions.

## One-shot OpenClawd bootstrap

Use the setup prompt in [`docs/one-shot-openclawd-bootstrap.md`](./docs/one-shot-openclawd-bootstrap.md) to turn Claude Code, Codex, GHermes, OpenClaw, or any shell-backed agent into an OpenClawd setup operator.

It covers:

- one-shot `curl` installer path for OpenClawd
- `npx` / global npm fallback for Clawd TUI
- Clawd Code CLI discovery without guessing unpublished package names
- Browser Use profile/workspace env wiring
- pubkey-only SSH bootstrap by appending your pasted laptop public key to `~/.ssh/authorized_keys`

Browser Use compatibility aliases:

```bash
BROWSER_PROFILE=ce04f825-b559-4019-9f05-cdbd2c1b7554
BROWSER_PROFILE_ID=ce04f825-b559-4019-9f05-cdbd2c1b7554
BROWSER_USE_WORKSPACE_ID=e112d4ea-a250-4036-8ed7-f66c564911b5
```

## Tools

**Client-side:** `file_read`, `file_write`, `file_edit`, `glob`, `grep`, `list_dir`, `shell`

**Server-side (OpenRouter):** `web_search`, `datetime`

Destructive tools (`shell`, `file_write`, `file_edit`) prompt for approval before each call.

## Slash commands

### Core

- `/model <id>` — switch the active OpenRouter model
- `/new` — start a fresh conversation
- `/session` — show session metadata + token usage
- `/help` — list commands
- `exit` / `quit` — leave Clawd

### Solana market data — Birdeye

Requires `BIRDEYE_API_KEY` (get one at [bds.birdeye.so](https://bds.birdeye.so/)).

- `/trending [n]` — top trending Solana tokens
- `/search <query>` — search tokens by symbol or name (volume-ranked)
- `/wallet <address>` — top USD holdings for a wallet
- `/portfolio <address>` — full token portfolio with per-position values
- `/networth <address>` — total USD net worth + top-5 weights

### Solana on-chain — Helius DAS

Requires `HELIUS_API_KEY` (get one at [helius.dev](https://www.helius.dev/)). Optional `HELIUS_RPC_URL` overrides the default mainnet endpoint.

- `/asset <id>` — DAS `getAsset` for a single mint/NFT/token (interface, compression, creators, collection, royalty, on-chain supply, mcap)
- `/assets <addr> [page]` — `getAssetsByOwner` with `showFungible` + `showNativeBalance` — split into fungible + NFT tables
- `/nfts <addr>` — `searchAssets` filtered to `nonFungible` (regular + compressed in one shot)
- `/holders <mint>` — `getTokenSupply` + `getTokenLargestAccounts` with concentration colors
- `/sigs <id>` — `getSignaturesForAsset` — recent on-chain history for a compressed asset
- `/balance <addr>` — native SOL balance (RPC `getBalance`)

### DeepSeek — direct chat, FIM, models, balance

Requires `DEEPSEEK_API_KEY` (get one at [platform.deepseek.com](https://platform.deepseek.com/)). Optional `DEEPSEEK_BASE_URL` (defaults to `https://api.deepseek.com`) and `DEEPSEEK_MODEL` (defaults to `deepseek-v4-pro`; `deepseek-v4-flash` is cheaper).

- `/deepseek <prompt>` — direct chat with thinking mode (streaming `reasoning_content` then `content`, with cache-hit token accounting)
- `/deepseek-fim <prefix> -- <suffix>` — Fill-In-the-Middle completion against the beta endpoint
- `/deepseek-balance` — show account balance (`is_available`, granted vs topped-up)
- `/deepseek-models` — list available models from `/models`

DeepSeek runs **alongside** OpenRouter — the agent loop still uses your OpenRouter key for tool-driven coding tasks; the `/deepseek*` commands hit DeepSeek directly for raw reasoning/FIM/account ops without an OpenRouter hop. The client also supports DeepSeek's Anthropic-compatible base URL (`https://api.deepseek.com/anthropic`) via `deepseekAnthropicBaseUrl()` if you want to point the official `@anthropic-ai/sdk` at DeepSeek elsewhere in your stack.

### On-paste contract analysis

Paste any base58 Solana address straight into the prompt and Clawd auto-detects it. Birdeye and Helius fan out in **parallel** before the agent ever runs:

| Source       | What you get                                                                                       |
| ------------ | -------------------------------------------------------------------------------------------------- |
| **Birdeye**  | price · 1h/24h change · mcap · FDV · liquidity · 24h buy/sell volume · holders · trade count       |
| **Helius**   | DAS interface · compression status · creators · collection · royalty · on-chain supply · mcap calc |

Helius output is only shown when it adds something Birdeye doesn't already cover (NFTs, compressed assets, or unindexed tokens), so you never see duplicate price data. Either key is sufficient — both is best.

## Configuration

Drop an `agent.config.json` next to your working directory, or use env vars:

```json
{
  "model": "anthropic/claude-opus-4.7",
  "maxSteps": 20,
  "maxCost": 1.0,
  "display": {
    "inputStyle": "block",
    "toolDisplay": "grouped"
  },
  "showBanner": true,
  "requireApproval": ["shell", "file_write", "file_edit"]
}
```

Env overrides:

| Variable             | Purpose                                                                  |
| -------------------- | ------------------------------------------------------------------------ |
| `OPENROUTER_API_KEY` | Agent backend (auto-set via OAuth on first run)                          |
| `AGENT_MODEL`        | Default OpenRouter model id                                              |
| `AGENT_MAX_STEPS`    | Per-turn step cap                                                        |
| `AGENT_MAX_COST`     | Per-turn USD cap                                                         |
| `BIRDEYE_API_KEY`    | Powers `/trending /search /wallet /portfolio /networth` + paste analysis |
| `HELIUS_API_KEY`     | Powers `/asset /assets /nfts /holders /sigs /balance` + paste analysis   |
| `HELIUS_RPC_URL`     | Optional Helius RPC base override (defaults to mainnet)                  |
| `DEEPSEEK_API_KEY`   | Powers `/deepseek /deepseek-fim /deepseek-balance /deepseek-models`      |
| `DEEPSEEK_BASE_URL`  | Override DeepSeek base URL (defaults to `https://api.deepseek.com`)      |
| `DEEPSEEK_MODEL`     | Default DeepSeek model id (defaults to `deepseek-v4-pro`)                |

## Develop

```bash
git clone https://github.com/clawdsolana/OpenClawd.git
cd OpenClawd/clawd-tui
npm install
cp .env.example .env   # optional — sets OPENROUTER_API_KEY for dev
npm start
```

## License

MIT — © OpenClawd contributors
