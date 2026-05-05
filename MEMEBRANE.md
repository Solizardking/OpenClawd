# Membrain Integration

Membrain is the memory and persistence layer for OpenClawd trading agents.

**Location:** [`packages/membrain/`](./packages/membrain/)

## What It Does

- **Episodic memory** — Immutable trade/swap/alert records
- **Semantic memory** — Market facts, wallet patterns, liquidity observations
- **Competence memory** — Learned trading strategies with success rates
- **Working memory** — Active position state tracking
- **Plan graphs** — Reusable DeFi workflows (swap → stake → claim)

Backed by SQLite (single-agent) or Postgres + pgvector (multi-agent / similarity search). A 15-method gRPC API on `:9090` is consumed by TypeScript ([`@gustycube/membrane`](./packages/membrain/clients/typescript/)) and Python ([`membrane`](./packages/membrain/clients/python/)) clients, plus an OpenClawd plugin bridge ([`packages/membrain/clients/openclawd/`](./packages/membrain/clients/openclawd/)) that auto-injects context before agent runs.

## Quick Start

```bash
# From the repo root
npm run build:membrain          # builds packages/membrain/bin/membraned
npm run dev:membrain            # listens on :9090 (SQLite, default)

# Multi-agent / similarity search
docker compose -f packages/membrain/docker-compose.yml up -d
./packages/membrain/bin/membraned \
  --postgres-dsn postgres://membrane:membrane@localhost:5432/membrane_test?sslmode=disable
```

```bash
# Tests
npm run test:membrain
```

## Integration

Membrain provides the memory backbone for ClawdBot and any OpenClawd surface that needs cross-session reasoning. Every trade, scan, and market observation flows through Membrain's ingestion pipeline and is available for trust-gated retrieval. After a trade settles, callers `Reinforce` or `Penalize` the relevant competence record so the strategy's success rate stays current; background `Consolidation` extracts patterns from trade history into typed semantic and competence records.

Sister packages compose Membrain into the rest of the stack:

- [`packages/membrain-types/`](./packages/membrain-types/) — shared TypeScript surface for in-process consumers
- [`packages/memory-host-sdk/`](./packages/memory-host-sdk/) — host runtime + engine modules (Membrain, embeddings, QMD, multimodal, secret, status)

## Reference

- Full README: [`packages/membrain/README.md`](./packages/membrain/README.md)
- RFC / design notes: [`packages/membrain/rfc.md`](./packages/membrain/rfc.md)
- Contributing (SDK release flow): [`packages/membrain/CONTRIBUTING.md`](./packages/membrain/CONTRIBUTING.md)
- Stack map entry: [STACK.md](./STACK.md) (Memory layer rows)
