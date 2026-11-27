/-!
Mirror of `crates/ocs-core/src/conviction.rs`.
`score = amount * durationEpochs * consistencyBps / 10000`,
early-exit burn is 20% (2000 bps).
-/

namespace Ocs.Conviction

def consistencyBps (streak : Nat) : Nat :=
  min (10000 + (min streak 90) * 1000) 100000

def score (amount durationEpochs streak : Nat) : Nat :=
  amount * durationEpochs * consistencyBps streak / 10000

/-- Staking more never lowers the score (same lock and streak).
Proved via `le_div_iff_mul_le`: `(X / 10000) * 10000 ≤ X ≤ Y` gives
`X / 10000 ≤ Y / 10000`. (This Lean core has no `Nat.div_le_div_right`
and no `norm_num`/`ring` — the proof uses only core lemmas + `omega`.) -/
theorem score_monotone_amount {a a' e s : Nat} (h : a ≤ a') :
    score a e s ≤ score a' e s := by
  unfold score
  have h2 : a * (e * consistencyBps s) ≤ a' * (e * consistencyBps s) :=
    Nat.mul_le_mul_right _ h
  have e1 : ∀ x : Nat, x * e * consistencyBps s = x * (e * consistencyBps s) :=
    fun x => Nat.mul_assoc x e (consistencyBps s)
  rw [e1 a, e1 a']
  rw [Nat.le_div_iff_mul_le (by omega : 0 < 10000)]
  exact Nat.le_trans (Nat.div_mul_le_self _ _) h2

def burnAmount (amount : Nat) : Nat := amount * 2000 / 10000

def returnAmount (amount : Nat) : Nat := amount - burnAmount amount

theorem burn_le (amount : Nat) : burnAmount amount ≤ amount := by
  unfold burnAmount; omega

/-- Early exit splits the stake exactly: burn + returned = staked. -/
theorem early_exit_split (amount : Nat) :
    burnAmount amount + returnAmount amount = amount := by
  unfold returnAmount
  exact Nat.add_sub_cancel' (burn_le amount)

end Ocs.Conviction
