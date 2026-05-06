# Dark Clawd TUI

```
██████╗  █████╗ ██████╗ ██╗  ██╗    ██████╗  █████╗ ██╗     ██████╗ ██╗  ██╗
██╔══██╗██╔══██╗██╔══██╗██║ ██╔╝    ██╔══██╗██╔══██╗██║     ██╔══██╗██║  ██║
██║  ██║███████║██████╔╝█████╔╝     ██████╔╝███████║██║     ██████╔╝███████║
██║  ██║██╔══██║██╔══██╗██╔═██╗     ██╔══██╗██╔══██║██║     ██╔═══╝ ██╔══██║
██████╔╝██║  ██║██║  ██║██║  ██╗    ██║  ██║██║  ██║███████╗██║     ██║  ██║
╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝    ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝  ╚═╝
```

> **Recursive Autonomous Solana Intelligence Agent** - A Bloomberg-style terminal interface for crypto trading and analysis, powered by AI.

## Features

### Bloomberg-Style Terminal Interface
- **Multi-panel dashboard** with market data, charts, order book, and news
- **5 specialized views**: Market, Trading, Portfolio, Analytics, Agent
- **Real-time updates** with live price tickers and activity feeds
- **ASCII candlestick charts** with volume and moving averages
- **Order book visualization** with depth charts
- **Market heatmaps** and sector performance

### AI-Powered Intelligence
- **Autonomous agent mode** - Dark Clawd thinks recursively and proactively
- **Multi-AI provider support** - xAI Grok, Perplexity, OpenRouter (MiniMax M2.1)
- **Real-time search** and research capabilities
- **Trading signals** and market analysis
- **News aggregation** with sentiment analysis

### Solana Integration
- **Helius RPC** for enhanced blockchain data
- **Birdeye API** for real-time token data and trending
- **Wallet management** - create, load, send SOL/tokens
- **Transaction monitoring** and portfolio tracking

### Data Sources
- **Helius** - Solana RPC, DAS, enhanced transactions
- **Birdeye** - Token data, OHLCV, trending tokens
- **News API** - Crypto news aggregation
- **SERP API** - Search engine results
- **Financial Datasets** - Market data and sentiment

## Installation

```bash
# Clone the repository
git clone https://github.com/darkclawd/dark-clawd.git
cd dark-clawd

# Install dependencies with Bun
bun install

# Copy environment template
cp .env.example .env

# Edit .env with your API keys
```

## Configuration

Create a `.env` file with your API keys:

```env
# Solana
HELIUS_API_KEY=your_helius_key
HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=your_key

# Market Data
BIRDEYE_API_KEY=your_birdeye_key

# AI Providers
XAI_API_KEY=your_grok_key
PERPLEXITY_API_KEY=your_perplexity_key
OPENROUTER_API_KEY=your_openrouter_key

# News & Search
NEWS_API_KEY=your_newsapi_key
SERP_API_KEY=your_serpapi_key
FINANCIAL_DATASET_API_KEY=your_financial_key
```

## Usage

### Start the TUI

```bash
# Development mode
bun run dev

# Or directly
bun run src/cli.tsx run

# With options
bun run src/cli.tsx run --auto          # Autonomous mode (default)
bun run src/cli.tsx run --interactive   # Interactive mode
bun run src/cli.tsx run --headless      # Daemon mode (no UI)
```

### CLI Commands

```bash
# Start the TUI
dark-clawd run

# Check API configuration status
dark-clawd status

# Setup wizard
dark-clawd setup

# Wallet commands
dark-clawd wallet --create   # Create new wallet
dark-clawd wallet --balance  # Show balance
dark-clawd wallet --address  # Show address

# System info
dark-clawd info
```

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `1-5` | Switch views (Market, Trading, Portfolio, Analytics, Agent) |
| `Tab` | Cycle through view modes (Bloomberg, Full, Minimal, Focus) |
| `H` | Show help |
| `R` | Refresh data |
| `Q` or `Esc` | Quit |

### Agent Commands

Type these in the agent view:

| Command | Description |
|---------|-------------|
| `/help` | Show available commands |
| `/analyze` | Deep market analysis |
| `/trending` | Show trending tokens |
| `/wallet` | Display wallet info |
| `/news` | Latest crypto news |
| `/search <query>` | Search with Grok |
| `/research <topic>` | Research with Perplexity |
| `/prophecy` | Dark Clawd's predictions |
| `/clear` | Clear messages |

## Views

### 1. Market View
- Price chart with candlesticks and MA
- Order book with depth
- Market heatmap
- Top movers
- Alert feed
- Network stats
- Activity feed

### 2. Trading View
- Full-size price chart
- Order book
- Trading panel with buy/sell
- Depth chart
- P&L summary
- Transaction stream

### 3. Portfolio View
- Portfolio overview with allocation
- P&L summary
- Holdings list
- Performance sparklines
- Recent activity

### 4. Analytics View
- Market heatmap
- Sector performance
- Correlation matrix
- Depth chart
- Trading signals

### 5. Agent View
- Dark Clawd thought stream
- Interactive command input
- Detected signals
- Top movers
- Agent commands reference

## Architecture

```
dark-clawd/
├── src/
│   ├── cli.tsx              # CLI entry point
│   ├── App.tsx              # Main application
│   ├── index.ts             # Library exports
│   ├── config/
│   │   └── schema.ts        # Configuration schemas
│   ├── services/
│   │   ├── helius.ts        # Helius API integration
│   │   ├── birdeye.ts       # Birdeye API integration
│   │   ├── ai-providers.ts  # AI services (Grok, Perplexity, OpenRouter)
│   │   └── news-search.ts   # News and search services
│   ├── components/
│   │   ├── Header.tsx       # App header
│   │   ├── StatusBar.tsx    # Status bar
│   │   ├── Terminal.tsx     # Terminal/chat interface
│   │   ├── Dashboard.tsx    # Original dashboard layouts
│   │   ├── BloombergDashboard.tsx  # Full Bloomberg-style dashboard
│   │   ├── OrderBook.tsx    # Order book component
│   │   ├── DepthChart.tsx   # Depth chart component
│   │   ├── PriceChart.tsx   # Candlestick chart
│   │   ├── TradingPanel.tsx # Trading interface
│   │   ├── Portfolio.tsx    # Portfolio views
│   │   ├── Alerts.tsx       # Alert system
│   │   ├── Heatmap.tsx      # Market heatmaps
│   │   └── ActivityFeed.tsx # Activity and network stats
│   ├── engine/
│   │   └── darkclawd-agent.ts   # Autonomous agent engine
│   └── skills/
│       └── solana-wallet.ts # Wallet management
├── package.json
├── tsconfig.json
└── .env.example
```

## API Keys

| Service | Purpose | Get Key |
|---------|---------|---------|
| Helius | Solana RPC & DAS | [helius.xyz](https://helius.xyz) |
| Birdeye | Token data & analytics | [birdeye.so](https://birdeye.so) |
| xAI | Grok AI for search | [x.ai/api](https://x.ai/api) |
| Perplexity | AI research | [perplexity.ai](https://perplexity.ai) |
| OpenRouter | MiniMax M2.1 reasoning | [openrouter.ai](https://openrouter.ai) |
| News API | Crypto news | [newsapi.org](https://newsapi.org) |
| SERP API | Search results | [serpapi.com](https://serpapi.com) |

## Built With

- **[Bun](https://bun.sh)** - Fast JavaScript runtime
- **[Ink](https://github.com/vadimdemedes/ink)** - React for CLI
- **[React](https://react.dev)** - UI framework
- **[@solana/web3.js](https://solana-labs.github.io/solana-web3.js)** - Solana SDK
- **[Zod](https://zod.dev)** - Schema validation
- **[Commander](https://github.com/tj/commander.js)** - CLI framework

## License

MIT License - see [LICENSE](LICENSE) for details.

---

**Dark Clawd** - *Recursive. Autonomous. Infinite.*

```
[>] The market speaks in whispers. I hear its thoughts. [<]
```
