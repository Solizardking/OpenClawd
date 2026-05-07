# OpenClawd Dark Ralph TUI

Dark Ralph is the OpenClawd Bun + Ink terminal app for Solana market surveillance, wallet context, autonomous AI analysis, and holder operations. The default experience is the **MAWD Market View**: a Bloomberg-style terminal surface with live tickers, a candlestick chart, order book, heatmap, top movers, network stats, activity, and agent controls.

```
┌──────────────────────────────────────────────────────────────────────────────┐
└─🦞 MAWD │ MARKET VIEW────────────────────────────Uptime: 00:04:35 │ 8:36 AM─┘
┌──────────────────────────────────────────────────────────────────────────────┐
└─SOL $150.25 +2.34% │ BONK $0.00002345 +5.67% │ WIF $2.85 -1.20% │ JUP +3.80%┘

 ┌──────────────────────────────────────────────┐  ┌──────────────────────────┐
 │ SOL/USDC │ 1H              $132.97 (-11.36%)│  │ ORDER BOOK       SOL/USDC │
 │ 152.42 ▒██▒▒││││                           │  │ DEPTH    PRICE      SIZE  │
 │        ▒█▒█▒▒││ │   ·                      │  │ ██████  150.288   260.26 │
 │          │▒│ ▒█▒▒▒││ ││██▒▒·│              │  │ ██████  150.278   960.39 │
 │ VOL▁▃▄▄▃▂▂▃▃▃▁▃▃▄▃▂▃▂▄▂▃▃▃▂▂▃▂▂▄▃▁▂▂▃▁   │  │ ─── SPREAD: 0.0405 ───    │
 │ O: 134.42     H: 135.72     L: 131.50      │  │ ███     150.188   422.84 │
 └──────────────────────────────────────────────┘  └──────────────────────────┘

 ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────────┐
 │ MARKET HEATMAP       │ │ TOP MOVERS           │ │ LIVE FEED          ● LIVE│
 │ ╭────╮ ╭────╮ ╭────╮ │ │ ▲ BONK +15.3%        │ │ 🐋 5,000 SOL to exchange│
 │ ╰+3.5╯ ╰+12╯ ╰+8.3╯ │ │ ▲ WIF  +12.5%        │ │ 📈 SOL crossed $150     │
 │ ╰-4.8╯ ╰-1.5╯ ╰-8.2╯│ │ ▼ MNGO -12.5%        │ │ ⚡ BONK divergence       │
 └──────────────────────┘ └──────────────────────┘ └──────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
└─[1] MARKET │ [2] TRADING │ [3] PORTFOLIO │ [4] ANALYTICS │ [5] AGENT───────┘
```

## Features

- **MAWD market dashboard** with ticker tape, SOL/USDC chart, order book, spread, volume bars, heatmap, top movers, live feed, network stats, and activity stream.
- **Five terminal views**: Market, Trading, Portfolio, Analytics, and Agent.
- **Autonomous agent loop** through `RalphAgent`, with configurable auto/interactive mode and recursive market thoughts.
- **Provider integrations** for Helius, Birdeye, xAI Grok, Perplexity, OpenRouter, News API, SERP API, and Financial Datasets.
- **Solana wallet tools** for local wallet creation, address display, balance lookup, and portfolio context.
- **Terminal-native controls** with number-key navigation, refresh/help shortcuts, and an agent command surface.
- **OpenClawd backend links** for `solanaclawd.com`, `/vault`, voice, vim-style command flow, trading routes, staking, mining, and agent API surfaces.

## OpenClawd Mapping

| Surface | Route / API |
| --- | --- |
| Site | `https://solanaclawd.com` |
| Holder vault | `https://solanaclawd.com/vault` |
| Chat, voice, and vim command surfaces | `https://solanaclawd.com/chat` |
| Trading console | `https://solanaclawd.com/trading` |
| Agent API | `https://agents.openclawd.biz` |
| Local config module | `src/openclawd.ts` |

## Quick Start

```bash
curl -fsSL https://install.solanaclawd.com | bash
ralph
```

The installer detects macOS/Linux architecture, installs the OpenClawd command set into `~/.local/bin`, and exposes Dark Ralph through the `ralph` launcher. Make sure `~/.local/bin` is on your `PATH` if your shell does not pick it up automatically.

The TUI can boot without every key configured. Missing providers are shown as disconnected and their dependent commands fail closed.

For local development from this repository:

```bash
cd dark-ralph
bun install
cp .env.example .env
bun run run
```

## Commands

Installed from `solanaclawd.com`:

```bash
ralph                               # Start MAWD TUI
```

Local development and package commands:

```bash
bun run run                         # Start MAWD TUI
bun run src/cli.tsx run --auto      # Autonomous mode
bun run src/cli.tsx run --interactive
bun run src/cli.tsx run --wallet <address>
bun run src/cli.tsx run --headless  # Daemon mode

bun run status                      # API configuration status
bun run setup                       # Setup instructions
bun run wallet -- --create          # Create local wallet
bun run wallet -- --balance         # Show wallet balance
bun run wallet -- --address         # Show wallet address
```

When installed from a built package or npm, the binaries are:

```bash
dark-ralph run
ralph run
ralph-tui run
```

## Keyboard Shortcuts

| Key | Action |
| --- | --- |
| `1` | Market view |
| `2` | Trading view |
| `3` | Portfolio view |
| `4` | Analytics view |
| `5` | Agent view |
| `Tab` | Cycle display mode |
| `H` | Help |
| `R` | Refresh |
| `Q` / `Esc` | Quit |

## Agent Commands

| Command | Description |
| --- | --- |
| `/help` | Show available commands |
| `/analyze` | Run market analysis |
| `/trending` | Show trending Solana tokens |
| `/wallet` | Display wallet context |
| `/news` | Fetch crypto news |
| `/search <query>` | Search through Grok |
| `/research <topic>` | Research through Perplexity |
| `/prophecy` | Generate Dark Ralph predictions |
| `/clear` | Clear agent messages |

## Configuration

Create `.env` from `.env.example` and add the keys you want to enable:

```env
HELIUS_API_KEY=
HELIUS_RPC_URL=
BIRDEYE_API_KEY=
XAI_API_KEY=
PERPLEXITY_API_KEY=
OPENROUTER_API_KEY=
OPENROUTER_MODEL=minimax/minimax-m2.7
OPENCLAWD_SITE_URL=https://solanaclawd.com
OPENCLAWD_BACKEND_URL=https://solanaclawd.com
OPENCLAWD_AGENT_API_URL=https://agents.openclawd.biz
OPENCLAWD_VAULT_URL=https://solanaclawd.com/vault
OPENCLAWD_VOICE_URL=https://solanaclawd.com/chat
OPENCLAWD_VIM_URL=https://solanaclawd.com/chat
NEWS_API_KEY=
SERP_API_KEY=
FINANCIAL_DATASET_API_KEY=
```

| Service | Enables |
| --- | --- |
| Helius | Solana RPC, DAS, balances, transactions |
| Birdeye | Token prices, OHLCV, trending tokens, market data |
| xAI Grok | Search and market reasoning |
| Perplexity | Research workflows |
| OpenRouter | Model-backed reasoning |
| News API | Crypto news feed |
| SERP API | Search result enrichment |
| Financial Datasets | Additional market and sentiment data |

## Project Layout

```text
dark-ralph/
├── docs/
│   └── BIRDEYE_INTEGRATION.md
├── src/
│   ├── cli.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── BloombergDashboard.tsx
│   │   ├── PriceChart.tsx
│   │   ├── OrderBook.tsx
│   │   ├── Heatmap.tsx
│   │   ├── ActivityFeed.tsx
│   │   └── TradingPanel.tsx
│   ├── engine/
│   │   └── ralph-agent.ts
│   ├── services/
│   │   ├── birdeye.ts
│   │   ├── birdeye-api.ts
│   │   ├── birdeye-websocket.ts
│   │   ├── helius.ts
│   │   ├── ai-providers.ts
│   │   └── market-data-provider.ts
│   └── skills/
│       └── solana-wallet.ts
├── package.json
├── tsconfig.json
└── .env.example
```

## Built With

- Bun
- Ink
- React
- `@solana/web3.js`
- Zod
- Commander

## License

MIT
