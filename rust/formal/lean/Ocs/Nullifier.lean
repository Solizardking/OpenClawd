/-!
Mirror of `crates/ocs-core/src/nullifier.rs` (ZK-1: exactly-once).
The on-chain set is modeled as a `List` of consumed nullifiers.
-/

namespace Ocs.Nullifier

variable {α : Type} [DecidableEq α]

/-- Consume `n`: fails (`none`) if already used, else records it. -/
def consume (used : List α) (n : α) : Option (List α) :=
  if n ∈ used then none else some (n :: used)

theorem consume_used_none {used : List α} {n : α} (h : n ∈ used) :
    consume used n = none := by
  simp [consume, h]

theorem consume_fresh {used : List α} {n : α} (h : n ∉ used) :
    consume used n = some (n :: used) := by
  simp [consume, h]

/-- Exactly-once: after a successful consume, the same nullifier can
never be consumed again. -/
theorem consume_replay_fails {used : List α} {n : α} (h : n ∉ used) :
    consume used n = some (n :: used) ∧ consume (n :: used) n = none := by
  refine ⟨consume_fresh h, ?_⟩
  exact consume_used_none (List.mem_cons_self n used)

end Ocs.Nullifier
