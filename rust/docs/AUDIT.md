# Audit of `Solizardking/openclawd-solana` @ 683ddf4 (2026-11-27)

Method: full recursive tree via the GitHub API (22,200 entries, not truncated)
plus a local clone for content inspection.

## The repo today

| Fact | Value |
| --- | --- |
| Files | 19,867 (339 MB checkout, ~235 MB of blobs) |
| TypeScript / TSX | 5,125 / 1,855 files — the overwhelming majority |
| JSON | 10,767 files — mostly `library/` data (9,282 files under `library/`) |
| Rust | 216 files, **no unified workspace** |
| Lean | 34 files, **all inside one skill** (`skills/solana-formal-verification/`) |
| Python | 134 files |
| Top dirs by file count | `library/` 9,282 · `core-ai/` 2,800 · `clawd-code/` 2,221 · `src/` 2,090 · `agents/` 1,268 |

## Where the Rust already is (scattered, not a system)

- `src/vulcan-cli-master/` — a vendored copy of the Vulcan CLI (largest Rust
  body; a vendor drop, not workspace code)
- `packages/clawd-protocol/` — Anchor program: agent binding, conviction,
  vault, burns, milestones, sentiment, hook
- `zk-primitives/` — Anchor program: nullifiers + Groth16 + Light compressed
  state (the BUDGET-5000 ZK-1…ZK-5 property target)
- `clawd-agents/clawdbot-pumpfun/` — Rust bot
- `skills/solana-formal-verification/crates/qedgen` — Rust→Lean spec generator
- `skills/ore-master 2/` — another vendored copy (note the ` 2` in the path)

## Duplication found

- The mpl-core NFT staking program exists **three times**:
  `staking/`, `trading/staking/`, and
  `agents/Agent-Staking_Unstaking_solana_metaplex_core/` — same instructions,
  three copies to patch.
- Vendored drops (`vulcan-cli-master`, `ore-master 2`) duplicate crates that
  should be dependencies or workspace members.

## Where the Lean already is

All 34 `.lean` files are QEDGen support libraries and two worked examples
(Percolator, Escrow) inside `skills/solana-formal-verification/`. **No Lean
spec exists for any of the repo's own value-bearing logic** — not for
clawd-protocol, not for clawd-zk, not for the gateway gate, not for x402.
The toolchain is already pinned there: `leanprover/lean4:v4.15.0`.

## Concrete defects the rewrite addresses

1. **Unchecked `u64` overflow** — `clawd-protocol` conviction early-exit:
   `staked_amount * 2_000 / 10_000` in `u64` overflows for stakes above
   ~9.2×10¹⁵. (Fixed in `ocs-core`: `u128` intermediate, checked result.)
2. **No stated invariant** — `clawd-protocol` vault tracks `total_locked`,
   `total_burned`, `total_fees_collected` as loose counters updated by
   separate instructions; nothing states or checks conservation.
   (`ocs-core` makes conservation structural and Lean proves it.)
3. **Policy as middleware** — the gateway tier gate is Express middleware
   side-effects, untestable in isolation. (`ocs-core::gate` is one pure
   function; the middleware becomes a shell.)
4. **x402 acceptance logic in TS** — amount/asset/expiry/replay checks live
   in gateway service code with no spec. (`ocs-x402` + `Ocs/X402.lean`.)
