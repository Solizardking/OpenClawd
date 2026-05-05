# Autonomous Research Loop

OpenClawd extends the robotics command layer into a self-evolving trading and operations loop. The goal is not an unconstrained bot that can mutate itself and spend funds. The goal is a bounded research worker that can observe markets, form hypotheses, run paper-trading experiments, keep only validated improvements, and persist what it learns for future sessions.

## Inspiration

- **Toly's Percolator:** Percolator's sharded perps design shows how Solana can turn high-throughput trading infrastructure into parallel, risk-contained execution lanes. OpenClawd borrows the idea of isolated lanes: research, paper trading, risk review, and live execution are separate slabs with explicit handoff gates.
- **Karpathy's autoresearch:** Autoresearch popularized a tight agent loop: change one thing, run a bounded experiment, score it, keep the improvement, discard the failure, repeat. OpenClawd applies the same ratchet to trading strategies, but the metric is risk-adjusted simulated performance instead of model loss.
- **Honcho persistence:** Honcho-style long-term memory gives agents continuity across sessions. OpenClawd uses that pattern to persist hypotheses, experiment outcomes, strategy lineage, operator preferences, risk limits, and post-trade reflections.

## Loop Shape

```text
OBSERVE
  Pull Solana market state, wallet state, telemetry, news, and protocol signals.

RESEARCH
  Generate a bounded hypothesis: market, strategy, risk limit, and evaluation metric.

SIMULATE
  Run an offline or paper-trading trial with fixed budget and fixed duration.

SCORE
  Compare against the current champion using PnL, drawdown, hit rate, slippage, and policy violations.

RATCHET
  Promote only strategies that beat the benchmark and pass risk checks.

PERSIST
  Store the hypothesis, result, lineage, and operator-facing explanation in durable memory.

EXECUTE
  Live swaps remain permission-gated and require wallet policy approval.
```

## Strategy Memory Model

| Tier | Meaning | Example |
| --- | --- | --- |
| `KNOWN` | Current facts from market data, wallet reads, telemetry, and operator policy. | SOL volatility, pool liquidity, wallet exposure, max loss limit. |
| `INFERRED` | Agent hypotheses that are not yet validated. | A token graduation pattern may predict short-term liquidity inflow. |
| `EXPERIMENTAL` | Paper-trading strategy candidates under test. | Buy after volume expansion, exit on 4% trailing drawdown. |
| `LEARNED` | Results that survived scoring and review. | Strategy improved simulated Sharpe without increasing max drawdown. |
| `RETIRED` | Ideas that failed, degraded, or violated policy. | Signal overfit low-liquidity launches and caused excess slippage. |

## Autonomy Boundaries

- Research and simulation can run unattended.
- Strategy promotion requires deterministic scoring and a recorded diff.
- Live execution requires the existing OpenClawd wallet permission gate.
- Private keys are never stored in memory, prompts, logs, demos, or receipts.
- Mainnet execution is out of scope for the public hackathon demo.

## Public Demo Mapping

The offline demo now emits an `autonomous_research` block:

- `research_goal` states the bounded strategy question.
- `candidate_strategy` records the agent's proposed paper-trading change.
- `evaluation` records simulated metrics and risk checks.
- `ratchet_decision` shows whether the candidate becomes the new champion.
- `honcho_persistence` shows what would be written to durable memory.

This makes the robotics demo and trading loop share one safety model: observe freely, reason in memory, simulate cheaply, attest receipts, and gate anything that can move funds or hardware.
