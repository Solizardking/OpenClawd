/-!
Mirror of `crates/ocs-core/src/gate.rs`.
Tiers are ranks (`Nat`): None=0, Shoreline=1, Shallow=2, Deep=3.
`decide` returns `true` for Allow.
-/

namespace Ocs.Gate

inductive Route where
  | publicRead
  | liveMutation
  | paidFeature
  deriving DecidableEq

structure Policy where
  productionMode : Bool
  minLiveTier : Nat
  minPaidTier : Nat
  paidGated : Bool

structure Caller where
  tier : Nat
  isAdmin : Bool

def tierOk (t min : Nat) : Bool := min ≤ t

def decide (p : Policy) (c : Caller) (r : Route) : Bool :=
  if c.isAdmin then true
  else match r with
    | .publicRead => true
    | .liveMutation => !p.productionMode || tierOk c.tier p.minLiveTier
    | .paidFeature => !p.paidGated || tierOk c.tier p.minPaidTier

theorem admin_always_allowed (p : Policy) (t : Nat) (r : Route) :
    decide p ⟨t, true⟩ r = true := by
  simp [decide]

theorem below_tier_live_denied (p : Policy) {t : Nat}
    (hprod : p.productionMode = true) (h : t < p.minLiveTier) :
    decide p ⟨t, false⟩ .liveMutation = false := by
  simp [decide, tierOk, hprod, Nat.not_le.mpr h]

theorem below_tier_paid_denied (p : Policy) {t : Nat}
    (hgate : p.paidGated = true) (h : t < p.minPaidTier) :
    decide p ⟨t, false⟩ .paidFeature = false := by
  simp [decide, tierOk, hgate, Nat.not_le.mpr h]

end Ocs.Gate
