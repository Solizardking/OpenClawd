# OpenClawd TUI

[![npm version](https://img.shields.io/npm/v/@openclawdsolana/clawd-tui.svg?color=ff6b35&style=for-the-badge)](https://www.npmjs.com/package/@openclawdsolana/clawd-tui)
[![npm downloads](https://img.shields.io/npm/dm/@openclawdsolana/clawd-tui.svg?style=for-the-badge)](https://www.npmjs.com/package/@openclawdsolana/clawd-tui)
[![node](https://img.shields.io/node/v/@openclawdsolana/clawd-tui.svg?style=for-the-badge)](https://nodejs.org/)
[![license](https://img.shields.io/npm/l/@openclawdsolana/clawd-tui.svg?style=for-the-badge)](./LICENSE)

> 🦞 Claws that code, brains that deploy.

A lobster-themed agent terminal built on [`@openrouter/agent`](https://www.npmjs.com/package/@openrouter/agent). Adaptive input block, streaming tool calls, session persistence, slash commands, and approval gates for destructive actions — all with one-line OAuth onboarding to OpenRouter.

📦 **Published:** [`@openclawdsolana/clawd-tui` on npm](https://www.npmjs.com/package/@openclawdsolana/clawd-tui)

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

## Tools

**Client-side:** `file_read`, `file_write`, `file_edit`, `glob`, `grep`, `list_dir`, `shell`

**Server-side (OpenRouter):** `web_search`, `datetime`

Destructive tools (`shell`, `file_write`, `file_edit`) prompt for approval before each call.

## Slash commands

- `/model <id>` — switch the active OpenRouter model
- `/new` — start a fresh conversation
- `/session` — show session metadata + token usage
- `/help` — list commands
- `exit` / `quit` — leave Clawd

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

Env overrides: `OPENROUTER_API_KEY`, `AGENT_MODEL`, `AGENT_MAX_STEPS`, `AGENT_MAX_COST`.

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
