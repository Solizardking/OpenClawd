# openclawd-cli

**OpenClawd — The Solana Computer.**

One command. Full autonomous Solana trading runtime. Connected to your Seeker.

```bash
npx openclawd-cli install
```

```
   _____       __                        ____  _____
  / ___/____  / /___ _____  ____ _     / __ \/ ___/
  \__ \/ __ \/ / __ `/ __ \/ __ `/    / / / /\__ \
 ___/ / /_/ / / /_/ / / / / /_/ /    / /_/ /___/ /
/____/\____/_/\__,_/_/ /_/\__,_/     \____//____/
                S O L A N A O S
```

## What happens when you run it

1. Animated terminal boot sequence with Unicode matrix frames
2. Clones the [OpenClawd repo](https://github.com/clawdsolana/OpenClawd)
3. Builds the <10MB Go binary
4. Creates `~/.openclawdsolana/` workspace + wallet
5. Installs `openclawd` CLI globally
6. Prints your gateway setup code + QR for Seeker pairing
7. Ready to connect to [seeker.openclawd.net](https://seeker.openclawd.net)

## Quick start

```bash
# Install everything
npx openclawd-cli install

# Or with the web console
npx openclawd-cli install --with-web

# Start the daemon
openclawd daemon

# Generate Seeker pairing QR
openclawd gateway setup-code

# Check wallet
openclawd solana wallet
```

## Connect your surfaces

```bash
# Telegram bot
openclawd daemon  # auto-registers commands

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

## Also available as

```bash
npx openclawd-computer@latest install    # Primary installer
npx openclawdsolana-cli install              # Legacy alias
```

MIT License · OpenClawd Labs · Built on Solana
