# Birdeye DeFi API Extension

Query Solana and multi-chain token data, market stats, trades, and liquidity using Birdeye's comprehensive DeFi API.

## Setup

1. Get a Birdeye API key from [birdeye.so](https://birdeye.so)
2. Set the `BIRDEYE_API_KEY` environment variable in your `.env` file

```bash
BIRDEYE_API_KEY=your_api_key_here
BIRDEYE_DEFAULT_CHAIN=solana  # optional, defaults to solana
```

3. Install dependencies:

```bash
npm install
```

4. Run the MCP server:

```bash
npm run dev
```

## Available Tools

### Token Data
| Tool | Description |
|------|-------------|
| `birdeye-token-overview` | Get comprehensive stats for a token (price, market cap, volume, holders, price changes) |
| `birdeye-token-metadata` | Get token metadata (name, symbol, decimals, logo, social links) |
| `birdeye-token-metadata-multiple` | Get metadata for multiple tokens (max 50) |
| `birdeye-token-market-data` | Get market data (price, liquidity, market cap, FDV, holders) |
| `birdeye-token-market-data-multiple` | Get market data for multiple tokens (max 20) |
| `birdeye-token-trade-data` | Get detailed trade statistics with customizable timeframes |
| `birdeye-token-trade-data-multiple` | Get trade data for multiple tokens (max 20) |

### Liquidity
| Tool | Description |
|------|-------------|
| `birdeye-token-liquidity` | Get exit liquidity for a token (Base chain only) |
| `birdeye-token-liquidity-multiple` | Get liquidity for multiple tokens (max 50, Base chain only) |

### Pair/Pool Data
| Tool | Description |
|------|-------------|
| `birdeye-pair-overview` | Get stats for a trading pair (liquidity, volume, trades, price) |
| `birdeye-pair-overview-multiple` | Get stats for multiple pairs (max 20) |

### Price Analytics
| Tool | Description |
|------|-------------|
| `birdeye-price-stats` | Get price high/low and percentage changes across timeframes |
| `birdeye-price-stats-multiple` | Get price stats for multiple tokens (max 20) |

### Token Lists
| Tool | Description |
|------|-------------|
| `birdeye-token-list` | Get filtered, sorted list of tokens with market data |

### Transactions
| Tool | Description |
|------|-------------|
| `birdeye-token-trades` | Get trades for a specific token |
| `birdeye-all-trades` | Get trades across all tokens |
| `birdeye-pair-trades` | Get trades for a specific pair/pool |
| `birdeye-trader-trades` | Get trades by a specific wallet/trader |

## Supported Chains

- **Solana** (default)
- Ethereum
- Base
- BSC (Binance Smart Chain)
- Arbitrum
- Optimism
- Polygon
- Avalanche
- Sui
- Aptos
- zkSync
- Linea
- Fantom
- Mantle
- Fogo
- Monad

## Examples

### Get SOL Token Overview
```
Tool: birdeye-token-overview
Input: { "address": "So11111111111111111111111111111111111111112" }
```

### Get Market Data for Multiple Tokens
```
Tool: birdeye-token-market-data-multiple
Input: { "addresses": "So11111111111111111111111111111111111111112,EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" }
```

### Get Top Tokens by Volume
```
Tool: birdeye-token-list
Input: { "sortBy": "volume_24h_usd", "sortType": "desc", "limit": 20 }
```

### Get Recent Trades for a Token
```
Tool: birdeye-token-trades
Input: { "address": "So11111111111111111111111111111111111111112", "limit": 50, "txType": "swap" }
```

## API Rate Limits

Be mindful of Birdeye API rate limits which vary by plan:
- Free tier: Limited requests per minute
- Paid tiers: Higher limits with additional endpoints

Check your plan at [birdeye.so](https://birdeye.so)

## Documentation

- [Birdeye API Docs](https://docs.birdeye.so/)
- [OpenClawd Plugin Guide](../../docs/plugins.md)
