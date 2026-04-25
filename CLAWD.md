# CLAWD — Trading Strategy & Execution

## Multi-Venue Trading System

### Venue 1: Solana Spot (Pump.fun + Raydium)

**Intent:** Breakout continuation, recovery bounces, long-only

| Tier | Criteria | Strategy | Max Size |
|------|----------|----------|----------|
| **Fresh Sniper** | age ≤ 15m | Fast flip, 2-5x target, 10min TTL | 0.05 SOL |
| **Near Graduation** | bonding ≥ 75% | Ride pump, exit before 100% | 0.1 SOL |
| **Micro-Cap** | MC < $10K | Speculative, high risk | 0.05 SOL |
| **Mid-Cap** | MC $10K-$100K | Trend-follow, trailing stop | 0.2 SOL |
| **Large-Cap** | MC > $100K | Scalps on dips | 0.3 SOL |

### Decision Table (Pump.fun)

| Condition | Action |
|-----------|--------|
| Age ≤ 5m AND MC < $5K | **SNIPE** — 0.05 SOL |
| Age ≤ 15m AND bonding ≥ 50% | **BUY** — 0.1 SOL, exit at 3x |
| Bonding ≥ 90% | **AVOID** — graduation imminent |
| MC > $500K AND age < 2h | **SCALP** — tight stops |
| MC > $1M | **SKIP** — pump.fun rarely sustains |

### Guardrails

- Never exceed 1 SOL total exposure on pump.fun
- Never trade bonding = 100% (graduated)
- All trades gated by permission engine
- Never execute without trade plan in INFERRED memory
- Never retry failed swaps > 2 times

## OODA Cycle

```
OBSERVE  → solana_trending, pump_market_cap, memory(KNOWN)
ORIENT   → score: trend(25) + momentum(20) + liquidity(20) + participation(15) - execution_risk(20)
DECIDE   → confidence >= 60%? → size_band (0.5x/1.0x/1.25x/1.5x)
ACT      → HUMAN APPROVAL → jupiter_swap → memory(KNOWN)
LEARN    → write_outcome → promote INFERRED → LEARNED
```

## Confidence Scoring

| Score | Signal |
|-------|--------|
| 80-100 | Strong buy |
| 60-79 | Buy with caution |
| 40-59 | Hold/scale |
| 20-39 | Reduce/skip |
| 0-19 | Avoid |

## Risk Management

- **Drawdown cascade:** 5% reduce, 8% close perps, 12% full halt
- **Position timeout:** Fresh snipes 10min, mid-caps 2h, large-caps 24h
- **Stop loss:** 15% default, tightens on rapid moves
- **Take profit:** 50% default, trails at 25%

## Tool Chain

```
OBSERVE:  solana_trending → pump_token_scan → memory_recall(KNOWN)
ORIENT:   solana_token_info → solana_top_traders → score_candidates
DECIDE:   score >= 60 → generate_trade_plan → memory_write(INFERRED)
ACT:      *** APPROVAL *** → jupiter_swap → memory_write(KNOWN)
LEARN:    write_outcome → promote_to_LEARNED
```

## MCP Tools

### Solana Market Data
- `solana_price` — Live token price
- `solana_trending` — Top trending tokens
- `solana_token_info` — Token metadata + security score
- `solana_wallet_pnl` — Wallet P&L analysis
- `solana_top_traders` — Smart money wallets

### Helius Onchain
- `helius_balance` — SOL balance
- `helius_transactions` — Parsed tx history
- `helius_priority_fee` — Real-time fee estimates
- `helius_das_asset` — NFT/token metadata

### Pump.fun
- `pump_token_scan` — Bonding curve analysis
- `pump_buy_quote` — Get buy quote
- `pump_sell_quote` — Get sell quote
- `pump_graduation` — Check graduation status

### Jupiter DEX
- `jupiter_swap` — Execute swap
- `jupiter_quote` — Get quote without execution
- `jupiter_price` — Price + liquidity