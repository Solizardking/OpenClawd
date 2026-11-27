import Ocs.Nullifier
import Ocs.Vault
import Ocs.Conviction
import Ocs.Gate
import Ocs.X402

/-!
# OpenClawd Solana — Lean 4 specification mirror

Each module models one `ocs-core` / `ocs-x402` Rust module with the same
transition functions and proves the invariant the Rust tests and Kani
harnesses check. Correspondence rule: a Rust function and its Lean namesake
must agree on inputs, outputs, and failure cases; when they diverge, the
Lean statement is the spec and the Rust is the bug (or the spec is amended
in the same commit — never silently).

Proved here (complete proofs, no Mathlib):
- Nullifier: exactly-once (fresh succeeds, replay fails)
- Vault: conservation of value across deposit / withdraw / burn
- Conviction: score monotonicity in amount; early-exit split conserves
- Gate: admins always allowed; below-tier callers never allowed
- X402: underpaid / expired / wrong-asset / replayed payments never accepted
-/
