/-!
Mirror of `crates/ocs-x402/src/lib.rs`.
Assets and payment ids are modeled abstractly with decidable equality;
`seen` is the nullifier list of already-accepted payment ids.
Acceptance is a proposition here; the Rust `verify` returns Accept exactly
when this proposition holds and consumes the id.
-/

namespace Ocs.X402

variable {α : Type}

structure Requirement (α : Type) where
  asset : α
  minAmount : Nat
  expiresAt : Nat

structure Payment (α : Type) where
  asset : α
  amount : Nat
  id : α

/-- The acceptance condition, stated once. -/
def Acceptable (req : Requirement α) (pay : Payment α) (now : Nat) (seen : List α) : Prop :=
  pay.asset = req.asset ∧ req.minAmount ≤ pay.amount ∧ now ≤ req.expiresAt ∧ pay.id ∉ seen

theorem underpaid_never_accepted {req : Requirement α} {pay : Payment α}
    {now : Nat} {seen : List α} (h : pay.amount < req.minAmount) :
    ¬ Acceptable req pay now seen := by
  intro hacc; exact Nat.not_le.mpr h hacc.2.1

theorem expired_never_accepted {req : Requirement α} {pay : Payment α}
    {now : Nat} {seen : List α} (h : req.expiresAt < now) :
    ¬ Acceptable req pay now seen := by
  intro hacc; exact Nat.not_le.mpr h hacc.2.2.1

theorem wrong_asset_never_accepted {req : Requirement α} {pay : Payment α}
    {now : Nat} {seen : List α} (h : pay.asset ≠ req.asset) :
    ¬ Acceptable req pay now seen := by
  intro hacc; exact h hacc.1

theorem replay_never_accepted {req : Requirement α} {pay : Payment α}
    {now : Nat} {seen : List α} (h : pay.id ∈ seen) :
    ¬ Acceptable req pay now seen := by
  intro hacc; exact hacc.2.2.2 h

end Ocs.X402
