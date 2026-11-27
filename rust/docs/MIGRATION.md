# Migration plan — TypeScript monorepo → Rust-first, Lean-ready

Principle: **the value-bearing core goes Rust + Lean first; the surface
stays TypeScript until the core is proven.** React UI, the skills catalog
data, and docs do not need Rust and do not get it for its own sake.

## Target layout (this workspace, to land as `rust/` in the repo)

```
rust/
  Cargo.toml                  workspace, zero-dep core, checked arithmetic
  crates/
    ocs-core/                 nullifier, conviction, vault, gate (pure, no_std)
    ocs-x402/                 x402 acceptance verification (pure)
    ocs-cli/                  `ocs` binary — Rust hot paths for clawd-code
  formal/lean/                Lean 4 mirror (toolchain v4.15.0, as in-repo)
    Ocs/{Nullifier,Vault,Conviction,Gate,X402}.lean
```

## Mapping — what ports, what stays, what dies

| Today (TS / scattered) | Target | Phase |
| --- | --- | --- |
| `zk-primitives` nullifier logic | `ocs-core::nullifier` + `Ocs/Nullifier.lean` | **1 — done in this scaffold** |
| `clawd-protocol` conviction math | `ocs-core::conviction` + `Ocs/Conviction.lean` | **1 — done** (incl. overflow fix) |
| `clawd-protocol` vault counters | `ocs-core::vault` + `Ocs/Vault.lean` | **1 — done** (conservation invariant) |
| `services/gateway` tier gate middleware | `ocs-core::gate` + `Ocs/Gate.lean`; TS middleware becomes a thin FFI/HTTP shell | **1 — core done**, shell in 2 |
| `x402/` + gateway x402 checks | `ocs-x402` + `Ocs/X402.lean` | **1 — done** |
| `clawd-protocol` program (Anchor shell) | Program shell whose instruction bodies call `ocs-core` — **Phase 1 expansion: done** as `ocs-program-clawd` (Pinocchio-style byte-level shell; an Anchor/Pinocchio entrypoint binds to it in Phase 2) | 1.5 — shell done |
| `zk-primitives` program shell | **Phase 1 expansion: done** as `ocs-program-zk` — ZK-1/3/4/5 enforced in the shell; ZK-2 (Groth16 proof-gating) stays in the verifier path, documented boundary; Aristotle runs still Phase 2 | 1.5 — shell done |
| `clawd-code/` CLI hot paths (wallet, trade, research loops) | `ocs-cli` subcommands, one command family per PR | 2–3 |
| `src/` Leviathan runtime (agent loop, OODA, memory) | Rust service crate(s) behind the existing HTTP surface | 3 |
| `mcp-server/`, `mcp/` | Rust MCP server on `ocs-core` tools | 3 |
| `services/clawdrouter`, inference mesh | Rust (matches the Go/Rust direction of clawdbot) | 3 |
| React apps (`apps/web`, `src/*.tsx`), `library/` data, skills catalog | **Stay TypeScript/data** — UI and content, not value logic | — |
| Staking program ×3 copies | **One** Rust program; delete the other two copies | 2 |
| `src/vulcan-cli-master/`, `skills/ore-master 2/` vendor drops | Replace with a pinned dependency or a workspace member; delete the drops | 2 |

## Lean-ready rules (apply to every ported crate)

1. Pure transitions: `state -> Result<state>`; time/slot are parameters.
2. Checked arithmetic only; overflow is a typed error.
3. No floats on value paths (the original conviction comment specified the
   consistency multiplier in float terms — the port is integer bps, exactly
   as the Anchor code actually computed).
4. Dependency-free core: Kani, CVLR/Certora and Lean correspondence all get
   cheaper; add a dependency only with a written reason.
5. Every module ships with: Rust unit tests, a `#[cfg(kani)]` harness for
   its headline invariant, and a Lean namesake stating the same invariant.
6. Toolchain gotcha found while building this scaffold: the Lean toolchain
   in use (v4.15.0) **rejects digit-separator literals** (`10_000`) and
   lacks `norm_num` / `ring` / `Nat.div_le_div_right` — Lean specs here use
   plain digits and core lemmas + `omega` only. No Mathlib by default.

## Verification stack per property

| Layer | Tool | What it proves |
| --- | --- | --- |
| Spec | Lean 4 (`formal/lean`) | The invariant, machine-checked, no incomplete proofs |
| Implementation | Kani harnesses in `ocs-core` | The Rust code itself, bounded |
| On-chain program | Certora / CVLR + Harmonic/Aristotle | The Anchor/Pinocchio shell against the same property list (ZK-1…ZK-5 style) |
| Regression | `cargo test` + `lake build` in CI | Nothing silently drifts |

## Phasing & safety

- Phase 1 (this scaffold) is **additive only**: it deletes nothing and
  changes no live service. It lands as a branch/PR for review.
- Phase 2 rewires program shells onto `ocs-core` behind the existing tests,
  devnet first.
- Phase 3 ports services. Each service ports behind its current HTTP
  surface so the cutover is a deploy, not a rewrite of clients.
- Nothing here touches mainnet programs, keys, or live gateways. Program
  upgrades remain separate, explicitly approved steps.
