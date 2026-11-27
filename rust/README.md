# OpenClawd Solana — Rust + Lean rewrite (Phase 1 scaffold)

A Rust-first, Lean-ready rewrite of
[Solizardking/openclawd-solana](https://github.com/Solizardking/openclawd-solana),
starting with the value-bearing core. The audit and full migration plan:

- [docs/AUDIT.md](docs/AUDIT.md) — what the repo actually is today
  (19,867 files; TS-dominant; Rust scattered across 216 files with no
  workspace; Lean only inside one skill; a staking program copied 3×;
  an unchecked-overflow bug in the conviction math)
- [docs/MIGRATION.md](docs/MIGRATION.md) — what ports, what stays
  TypeScript, what gets deleted, and in what order

## What's here

| Crate / project | Contents |
| --- | --- |
| `crates/ocs-core` | Pure, dependency-free, `no_std`-ready state machines: nullifier registry (exactly-once), conviction staking math, vault ledger (conservation invariant), gateway tier gate |
| `crates/ocs-x402` | x402 payment acceptance (asset, amount, expiry, replay) as pure functions |
| `crates/ocs-cli` | `ocs` binary exercising the core (`ocs demo`, `ocs score …`) |
| `crates/ocs-program-clawd` | clawd-protocol program shell: Pinocchio-style byte-level instructions (deposit / withdraw / burn / stake / early-exit) over `ocs-core` |
| `crates/ocs-program-zk` | clawd-zk program shell: publish / consume / commit-state with ZK-1, ZK-3, ZK-4, ZK-5 semantics over the bounded nullifier set (ZK-2 proof-gating stays in the Groth16/Light path, documented boundary) |
| `formal/lean` | Lean 4 mirror of every core module with the invariants **proved** — nullifier exactly-once, vault conservation, conviction monotonicity + early-exit split, gate tier safety, x402 rejection cases. No Mathlib, no incomplete proofs |

## Verify it

```bash
cargo test            # 30 tests, all passing
cargo run -p ocs-cli -- demo
cd formal/lean && lake build   # all theorems, ~2s, offline
```

Toolchain notes: Rust ≥ 1.79. Lean is pinned to `leanprover/lean4:v4.15.0`
(the version the repo's existing QEDGen skill already pins). That Lean
core rejects digit-separator literals and lacks `norm_num`/`ring` — the
specs here are written accordingly (plain digits, core lemmas + `omega`).

## Status

Phase 1 scaffold, built and verified locally: `cargo test` 30/30,
`lake build` clean, and the Kani harness `replay_never_succeeds`
**verified** (0/157 checks failed, ~17s — over the bounded array
nullifier set; the original BTreeSet harness timed out at 240s
unwinding byte `memcmp`, which is why the bounded set exists).
Additive only — nothing in
the live repo changes until this lands as a reviewed branch/PR and the
Phase 2 program-shell rewiring is approved step by step.
