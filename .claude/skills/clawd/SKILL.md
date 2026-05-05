---
name: clawd
description: OpenClawd `clawd` TUI — launch, configure, and use the lobster-themed agent terminal. Triggers on `/clawd <args>`. Covers binary install, env vars (OPENROUTER_API_KEY, BIRDEYE_API_KEY, HELIUS_API_KEY, DEEPSEEK_API_KEY), in-TUI slash commands (/model, /trending, /search, /wallet, /asset, /holders, /research, /autoloop, /deepseek, /deepseek-fim, /deepseek-balance, /deepseek-models), on-paste Solana address auto-analysis, and PKCE OAuth login flow. Source lives at clawd-tui/ in this repo.
user-invocable: true
---

# Clawd Skill — OpenClawd Lobster TUI

`clawd` is the OpenClawd lobster-themed agent terminal, published as
[`@openclawdsolana/clawd-tui`](https://www.npmjs.com/package/@openclawdsolana/clawd-tui).
Source in this repo: [`clawd-tui/`](../../../clawd-tui/).

## When to use this skill

Use this skill when the user asks anything about the `clawd` binary, the
`@openclawdsolana/clawd-tui` package, slash commands inside the TUI, OAuth
login issues, env-var configuration, the on-paste Solana address analyzer, or
the DeepSeek/OpenRouter/Birdeye/Helius integrations that ship with it. The
canonical source of truth is [`clawd-tui/README.md`](../../../clawd-tui/README.md);
this skill is a fast lookup table on top of it.

## Install / run

```bash
npx -y @openclawdsolana/clawd-tui          # one-shot
npm install -g @openclawdsolana/clawd-tui  # global; exposes `clawd` and `clawd-tui`
clawd                                      # launch
clawd --login                              # force OAuth re-auth (PKCE web)
clawd --login --local-callback             # fallback to localhost loopback flow
```

OAuth caches the OpenRouter key at `~/.config/openclawd/openrouter-key`
(mode `0600`). You can override with `export OPENROUTER_API_KEY=sk-or-v1-...`.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `OPENROUTER_API_KEY` | Agent backend (auto-set via OAuth on first run). |
| `AGENT_MODEL` | Default OpenRouter model id (default `anthropic/claude-opus-4.7`). |
| `AGENT_MAX_STEPS` | Per-turn step cap (default 20). |
| `AGENT_MAX_COST` | Per-turn USD cap (default 1.0). |
| `BIRDEYE_API_KEY` | Powers `/trending /search /wallet /portfolio /networth` + paste analysis. |
| `HELIUS_API_KEY` | Powers `/asset /assets /nfts /holders /sigs /balance` + paste analysis. |
| `HELIUS_RPC_URL` | Optional Helius RPC base override. |
| `RESEARCH_API_URL` | AutoResearch API base (defaults to `http://localhost:8000`). |
| `DEEPSEEK_API_KEY` | Powers `/deepseek /deepseek-fim /deepseek-balance /deepseek-models`. |
| `DEEPSEEK_BASE_URL` | DeepSeek base URL (default `https://api.deepseek.com`). |
| `DEEPSEEK_MODEL` | Default DeepSeek model id (default `deepseek-v4-pro`; `deepseek-v4-flash` is cheaper). |

`.env` files are searched in this order, first match wins, shell env always
beats files: `./.env` → `~/.clawd.env` → `~/.config/openclawd/.env`.

## In-TUI slash commands

### Core

- `/model <id>` — switch the active OpenRouter model
- `/new` — start a fresh conversation
- `/session` — show session metadata + token usage
- `/help` — list commands
- `exit` / `quit` — leave Clawd

### Solana market data — Birdeye (`BIRDEYE_API_KEY`)

- `/trending [n]` · `/search <query>` · `/wallet <address>` · `/portfolio <address>` · `/networth <address>`

### Solana on-chain — Helius DAS (`HELIUS_API_KEY`)

- `/asset <id>` · `/assets <addr> [page]` · `/nfts <addr>` · `/holders <mint>` · `/sigs <id>` · `/balance <addr>`

### AutoResearch (`RESEARCH_API_URL`, default `http://localhost:8000`)

- `/research chain pump_fun | token <mint> | wallet <addr> | graduation <mint>`
- `/research defi yields [SOL,USDC,...] | arbitrage <mint>`
- `/research market trends | alpha | whales [mint] | sentiment`
- `/research runs [kind] [limit]`
- `/autoloop start | stop | status | list | add <name> <kind> <json> | remove <name>`

### DeepSeek (`DEEPSEEK_API_KEY`)

- `/deepseek <prompt>` — direct streaming chat with thinking mode (reasoning + text deltas, cache-hit tokens reported)
- `/deepseek-fim <prefix> -- <suffix>` — Fill-In-the-Middle completion (beta endpoint)
- `/deepseek-balance` — show account balance
- `/deepseek-models` — list available models

DeepSeek runs **alongside** OpenRouter — the agent loop still uses the
OpenRouter key for tool-driven coding tasks; the `/deepseek*` commands hit
DeepSeek directly. Source: [`clawd-tui/src/deepseek.ts`](../../../clawd-tui/src/deepseek.ts).

### On-paste contract analysis

Pasting a base58 Solana address triggers parallel Birdeye + Helius lookups
**before** the agent runs. Either key works; both are best.

## How to respond to `/clawd <args>`

When the user invokes `/clawd <args>`, treat `<args>` as a question or
instruction about the TUI:

1. If they ask "how do I…" → look up the right slash command above and give
   them the exact line plus the env var that powers it.
2. If they paste an error message → check OAuth (`clawd --login`), env-var
   loading order, and approval-gate behavior in
   [`clawd-tui/src/approval.ts`](../../../clawd-tui/src/approval.ts).
3. If they ask about a slash command's behavior → read the implementation in
   [`clawd-tui/src/commands.ts`](../../../clawd-tui/src/commands.ts) before
   answering, since this skill can drift from code.
4. If they want to add a new slash command → the pattern is: append a
   `Command` entry to `COMMANDS` in [`clawd-tui/src/commands.ts`](../../../clawd-tui/src/commands.ts),
   destructive ops should respect `ctx.config.requireApproval`, and any new
   API client should live in its own `src/<provider>.ts` (see `birdeye.ts`,
   `helius.ts`, `research.ts`, `deepseek.ts` for the pattern).

## Don't

- Don't suggest editing the cached OAuth key file — re-run `clawd --login`.
- Don't suggest using `--no-verify` or otherwise bypassing pre-commit hooks
  to land changes; the repo's secrets scanner is at
  [`scripts/guard-secrets.mjs`](../../../scripts/guard-secrets.mjs) and
  fixing detections is preferred over bypassing.
- Don't recommend a model ID without checking that OpenRouter actually
  routes it. For DeepSeek, use the direct `/deepseek*` commands instead of
  routing through OpenRouter when the user has `DEEPSEEK_API_KEY` set.
