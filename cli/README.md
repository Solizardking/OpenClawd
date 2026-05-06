# OpenClawd CLI + Dark Ralph TUI

Command-line tools for the OpenClawd ecosystem: Solana-native agents, ClawdHub skills, x402 payments, Metaplex registration, wallet utilities, and the Dark Ralph Bloomberg-style terminal.

Site: [solanaclawd.com](https://solanaclawd.com)

## Install

```bash
# From this directory
chmod +x clawd-cli.sh clawd-connect.sh

# Optional PATH helper
export PATH="$PATH:$(pwd)"

# Dark Ralph TUI dependencies
cd ../dark-ralph
bun install
cp .env.example .env
```

## Configuration

OpenClawd shell scripts resolve endpoints in this order:

1. `OPENCLAWD_*` environment variables
2. `~/.openclawdsolana/config.json`
3. Production defaults at `solanaclawd.com`

Useful environment variables:

```bash
HELIUS_API_KEY=
SOLANA_RPC_URL=
HELIUS_RPC_URL=
JUPITER_API_KEY=
BIRDEYE_API_KEY=

# Only needed when submitting on-chain registrations or trading paths.
SOLANA_KEYPAIR_PATH=~/.config/solana/id.json
SOLANA_PRIVATE_KEY=
SOLANA_SECRET_KEY=
```

Dark Ralph can also use:

```bash
XAI_API_KEY=
PERPLEXITY_API_KEY=
OPENROUTER_API_KEY=
NEWS_API_KEY=
SERP_API_KEY=
FINANCIAL_DATASET_API_KEY=
```

Do not commit populated `.env` files, private keys, wallet JSON, or production API secrets.

## Main Commands

### `clawd-cli.sh`

```bash
# Discovery
./clawd-cli.sh config
./clawd-cli.sh manifest

# Skills
./clawd-cli.sh skills
./clawd-cli.sh skills:list
./clawd-cli.sh skills:search solana
./clawd-cli.sh skills:featured
./clawd-cli.sh skills:install pumpfun-trading

# Marketplace
./clawd-cli.sh marketplace
./clawd-cli.sh marketplace:trending
./clawd-cli.sh marketplace:new

# Agents
./clawd-cli.sh agents
./clawd-cli.sh status
./clawd-cli.sh connect

# Agent registration (Metaplex Agent Registry)
./clawd-cli.sh register --dry-run
./clawd-cli.sh register --submit --keypair ~/.config/solana/id.json

# Wallet and trading
./clawd-cli.sh wallet
./clawd-cli.sh prices
./clawd-cli.sh trading
./clawd-cli.sh swap <from> <to> <amount>

# x402 payments
./clawd-cli.sh payment:supported
./clawd-cli.sh payment:verify <id>
./clawd-cli.sh payment:settle <tx>

# Node operations
./clawd-cli.sh node
./clawd-cli.sh node:register <name>
./clawd-cli.sh node:status
./clawd-cli.sh node:peers
```

### `clawd-register.ts`

The registration script loads [`clawd-registration.json`](./clawd-registration.json), validates it, and defaults to dry-run mode. It will only mint on-chain when `--submit` is present.

```bash
bun cli/clawd-register.ts --dry-run
bun cli/clawd-register.ts --network solana-devnet --dry-run
bun cli/clawd-register.ts --submit --keypair ~/.config/solana/id.json
```

Options:

```text
--config <path>       Registration JSON file
--dry-run             Validate and print payload without minting
--keypair <path>      Solana keypair JSON file
--metadata-uri <uri>  MPL Core metadata URI
--name <name>         Override registration name
--network <network>   solana-mainnet or solana-devnet
--rpc <url>           Solana RPC URL
--submit              Mint and submit on-chain
```

### `clawd-connect.sh`

```bash
./clawd-connect.sh skills:list
./clawd-connect.sh skills:featured
./clawd-connect.sh skills:search <query>
./clawd-connect.sh skills:install <slug>
./clawd-connect.sh marketplace:trending
./clawd-connect.sh connect
./clawd-connect.sh status
./clawd-connect.sh agents
./clawd-connect.sh wallet
./clawd-connect.sh prices
./clawd-connect.sh payment:supported
./clawd-connect.sh payment:verify <id>
./clawd-connect.sh payment:settle <tx>
```

## Dark Ralph TUI

Dark Ralph is a recursive autonomous Solana intelligence terminal with market, trading, portfolio, analytics, and agent views.

Features:

- Multi-panel Bloomberg-style dashboard
- Live tickers, activity feeds, ASCII candlestick charts, order book, depth chart, heatmaps
- xAI Grok, Perplexity, and OpenRouter provider support
- Helius RPC, Birdeye market data, news, search, and wallet operations

Run it from `dark-ralph/`:

```bash
bun run dev
bun run src/cli.tsx run
bun run src/cli.tsx run --auto
bun run src/cli.tsx run --interactive
bun run src/cli.tsx run --headless
```

Installed CLI commands:

```bash
dark-ralph run
dark-ralph status
dark-ralph setup
dark-ralph wallet --create
dark-ralph wallet --balance
dark-ralph wallet --address
dark-ralph info
```

Keyboard shortcuts:

| Key | Action |
|-----|--------|
| `1-5` | Switch views |
| `Tab` | Cycle view modes |
| `H` | Show help |
| `R` | Refresh data |
| `Q` or `Esc` | Quit |

Agent commands:

| Command | Description |
|---------|-------------|
| `/help` | Show available commands |
| `/analyze` | Deep market analysis |
| `/trending` | Show trending tokens |
| `/wallet` | Display wallet info |
| `/news` | Latest crypto news |
| `/search <query>` | Search with Grok |
| `/research <topic>` | Research with Perplexity |
| `/prophecy` | Dark Ralph predictions |
| `/clear` | Clear messages |

## Other CLIs

```bash
npm i -g openclawd
openclawd pair <CODE>
openclawd mint
openclawd status
openclawd agent

npm install @openclawd/wallet
clawd-wallet tokens
clawd-wallet quote SOL USDC 0.1
clawd-wallet balance <addr>

npx clawdhub install <skill>
npx clawdhub list
npx clawdhub search <query>
npx clawdhub publish ./skill
```

## HTTP Checks

```bash
curl https://solanaclawd.com/api/skills | jq '.'
curl "https://solanaclawd.com/api/skills/search?q=solana" | jq '.'
curl https://solanaclawd.com/api/skills/featured | jq '.'
curl https://solanaclawd.com/api/marketplace/trending | jq '.'
curl https://solanaclawd.com/api/status | jq '.'
curl https://solanaclawd.com/api/agents | jq '.'
curl https://solanaclawd.com/api/prices | jq '.'
curl https://solanaclawd.com/x402/facilitator/supported | jq '.'
```

## License

MIT. See [`../LICENSE.md`](../LICENSE.md).
