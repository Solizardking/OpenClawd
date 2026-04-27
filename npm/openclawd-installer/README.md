# @openclawdsolana/installer

**OpenClawd — The Solana Computer.**

One command. Full autonomous Solana trading runtime. Connected to your Seeker.

```bash
npx @openclawdsolana/installer install
```

```
    ____                     ________                   __
   / __ \____  ___  ____    / ____/ /___ __      ______/ /
  / / / / __ \/ _ \/ __ \  / /   / / __ `/ | /| / / __  /
 / /_/ / /_/ /  __/ / / / / /___/ / /_/ /| |/ |/ / /_/ /
 \____/ .___/\___/_/ /_/  \____/_/\__,_/ |__/|__/\__,_/
     /_/                                                
                O P E N C L A W D
```

## What happens when you run it

1. Animated terminal boot sequence with Unicode matrix frames.
2. Clones the [OpenClawd repo](https://github.com/clawdsolana/OpenClawd).
3. Builds the Go binary.
4. Creates `~/.openclawdsolana/` workspace + wallet.
5. Installs `openclawd` into `~/.openclawdsolana/bin/` (with `openclawdsolana` + `clawd` aliases).
6. Prints your gateway setup code + QR for Seeker pairing.
7. Ready to connect to [seeker.openclawd.net](https://seeker.openclawd.net).

## Quick start

```bash
# Install everything
npx @openclawdsolana/installer install

# Or with the web console
npx @openclawdsolana/installer install --with-web

# Start the daemon
openclawd daemon

# Generate Seeker pairing QR
openclawd gateway setup-code

# Check wallet
openclawd solana wallet
```

## Connect your surfaces

```bash
# Telegram bot — auto-registers commands when daemon starts
openclawd daemon

# Seeker pairing
openclawd gateway start
openclawd gateway setup-code

# Web console
openclawd-web --no-browser

# Paper trading
openclawd ooda --sim
```

## What you get

| Surface | How |
| --- | --- |
| **Terminal** | `openclawd daemon` — OODA loop, wallet, Telegram, gateway |
| **Seeker** | Scan QR from `gateway setup-code` or pair at [seeker.openclawd.net/dashboard](https://seeker.openclawd.net/dashboard) |
| **Telegram** | Auto-connected — 30+ commands (`/status`, `/trending`, `/ooda`, `/wallet`) |
| **Chrome** | Load `chrome-extension/` folder — wallet, chat, miner, tools |
| **Hub** | [seeker.openclawd.net](https://seeker.openclawd.net) — skills, agents, strategy, mining |
| **Mining** | [seeker.openclawd.net/mining](https://seeker.openclawd.net/mining) — BitAxe fleet dashboard |

## Requirements

- Node.js >= 18
- Go >= 1.21
- git, curl
- macOS or Linux

## Minimum `.env`

```bash
SOLANA_TRACKER_API_KEY=your-key
OPENROUTER_API_KEY=sk-or-v1-...
TELEGRAM_BOT_TOKEN=your-token
TELEGRAM_ID=your-chat-id
```

## Sibling packages

| Package | Purpose |
| --- | --- |
| [`@openclawdsolana/cli`](https://www.npmjs.com/package/@openclawdsolana/cli) | Lightweight bootstrapper. |
| [`@openclawdsolana/computer`](https://www.npmjs.com/package/@openclawdsolana/computer) | Canonical runtime entrypoint. |
| [`@openclawdsolana/installer`](https://www.npmjs.com/package/@openclawdsolana/installer) | This package — installer with the boot animation. |
| [`@openclawdsolana/agentwallet`](https://www.npmjs.com/package/@openclawdsolana/agentwallet) | Encrypted Solana + EVM keypair vault. |
| [`@openclawdsolana/wallet`](https://www.npmjs.com/package/@openclawdsolana/wallet) | Privy-powered embedded Solana wallet. |
| [`@openclawdsolana/percolator`](https://www.npmjs.com/package/@openclawdsolana/percolator) | Agentic perpetuals CLI. |

## Links

| | |
| --- | --- |
| **Launch** | [openclawd.net](https://openclawd.net) |
| **Hub** | [seeker.openclawd.net](https://seeker.openclawd.net) |
| **Souls** | [souls.openclawd.net](https://souls.openclawd.net) |
| **Docs** | [go.openclawd.net](https://go.openclawd.net) |
| **GitHub** | [clawdsolana/OpenClawd](https://github.com/clawdsolana/OpenClawd) |
| **Strategy** | [seeker.openclawd.net/strategy](https://seeker.openclawd.net/strategy) |
| **Mining** | [seeker.openclawd.net/mining](https://seeker.openclawd.net/mining) |
| **Skills** | [seeker.openclawd.net/skills](https://seeker.openclawd.net/skills) |

MIT License · OpenClawd Labs · Built on Solana
