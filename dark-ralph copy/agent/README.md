# `agent/` - Dark Ralph OODA loop (v0)

A paper-trading, devnet-only, stdlib-Python implementation of the
"Dark Ralph" adaptation of Geoffrey Huntley's Ralph harness.

Read Geoffrey Huntley's original Ralph material first. This directory is
one adaptation of the harness pattern: small scoped task, fresh context
per iteration, tight feedback, state in git, and repeat.

## Safety contract for v0

These are enforced in code. If you extend the loop, do not weaken them
without an explicit review.

| Guarantee | Where it lives |
| --- | --- |
| Mode is `paper` only | `loop.py:run_loop` rejects any other `mode:` in `RALPH.md` |
| Network is `devnet` only | `loop.py:run_loop` rejects any other `network:` in `RALPH.md` |
| Mainnet RPC URLs are rejected | `loop.py:reject_mainnet` |
| No key handling | There is no signing path in v0 |
| Position size capped per tick | `validate_decision` enforces `max_position_size_lamports` |
| One position at a time | `act` rejects a second open |
| Kill-switch on N consecutive losses | `run_loop` exits non-zero with `event: killswitch` |
| Every decision is journalled | `journal/ticks.jsonl`, append-only |

## Deliberately missing in v0

- Real market data. `observe()` synthesizes a candle. Replace it later
  with a Pyth, Switchboard, or DEX adapter that still respects
  `reject_mainnet()`.
- Real signing path. It does not exist. Adding one needs its own PR,
  review, and threat model.
- LLM in the loop. `decision_fn` is deterministic. You can pass another
  callable to `run_loop`, but it must still pass `validate_decision`.
- Browser-use, Dexter, and social streaming.

## Running it

Stdlib only. Python 3.10+.

```bash
python3 agent/loop.py --ticks 50 --sleep 0.0 --commit-every 0
```

With the dark TUI:

```bash
python3 agent/loop.py --ticks 200 --sleep 0.4 --tui --commit-every 0 \
  | python3 agent/tui.py
```

With git-committed journal every 10 ticks:

```bash
python3 agent/loop.py --ticks 100 --sleep 0.2 --commit-every 10
```

## CLI flags

```text
--ticks N            number of OODA iterations, default 50
--sleep SECONDS      delay between ticks, default 0.25
--seed N             RNG seed for synthesized candles, default 42
--commit-every N     git-commit the journal every N ticks; 0 disables
--tui                emit JSONL on stdout for tui.py
--memory-url URL     optional OpenClawd memory service URL
--mode paper         v0 only supports paper
```

## Environment

```text
SOLANA_RPC_URL       optional, devnet endpoint only
OPENCLAWD_MEMORY_URL optional memory service URL; falls back to journal/memory.jsonl
MAINNET_OK           do not set this for v0; there is no signing path
```

## OpenClawd Memory

Each tick is also rendered as an Obsidian-style Markdown note:

- title: `Dark Ralph Tick N`
- source: `dark_ralph`
- tags: `openclawd`, `dark-ralph`, `ooda`, action, tick number
- links: `[[Dark Ralph]]` and `[[OpenClawd Research]]`

If `OPENCLAWD_MEMORY_URL` or `--memory-url` is set, the loop posts notes
to `/v1/openclawd/memory/notes` and falls back to `/api/v1/memory/notes`.
If neither endpoint is available, it appends local notes to
`agent/journal/memory.jsonl`.

## Files

```text
agent/
├── README.md
├── RALPH.md
├── loop.py
├── tui.py
├── memory.py
└── journal/
    ├── .gitkeep
    └── ticks.jsonl
```

## Mapping back to the Ralph playbook

| Ralph rule | How this code respects it |
| --- | --- |
| Small scoped task | `RALPH.md` asks for one decision per tick, one action max |
| Fresh context per iteration | The prompt is re-read each tick; there is no conversation |
| State lives in git | `journal/ticks.jsonl`, committed every `--commit-every` ticks |
| Strong feedback loop | Paper PnL accounting and kill-switch |
| Branch isolation | Strategy changes should be backtested before touching main config |
| Walk-away safety | Kill-switch, size caps, one-position-at-a-time, paper-only |

Credit: the Ralph harness pattern is Geoffrey Huntley's work. Dark Ralph
is only a trading/OODA adaptation of that pattern.
