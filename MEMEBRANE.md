# Membrain Integration

Membrain is the memory and persistence layer for OpenClawd trading agents.

**Location:** `membrain/`

## What It Does

- **Episodic memory** — Immutable trade/swap/alert records
- **Semantic memory** — Market facts, wallet patterns, liquidity observations
- **Competence memory** — Learned trading strategies with success rates
- **Working memory** — Active position state tracking
- **Plan graphs** — Reusable DeFi workflows (swap → stake → claim)

## Quick Start

```bash
cd membrain
make build
./bin/membraned
```

## Integration

Membrain provides the memory backbone for ClawdBot (`X/`). Every trade, scan, and market observation flows through Membrain's ingestion pipeline and is available for trust-gated retrieval.

See [membrain/README.md](membrain/README.md) for the full documentation.
