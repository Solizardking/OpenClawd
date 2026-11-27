/-!
Mirror of `crates/ocs-core/src/vault.rs`.
Invariant (conservation): `balance + totalWithdrawn + totalBurned = totalDeposited`.
-/

namespace Ocs.Vault

structure Vault where
  balance : Nat
  totalDeposited : Nat
  totalWithdrawn : Nat
  totalBurned : Nat
  deriving DecidableEq, Repr

def Inv (v : Vault) : Prop :=
  v.balance + v.totalWithdrawn + v.totalBurned = v.totalDeposited

def deposit (v : Vault) (a : Nat) : Option Vault :=
  if a = 0 then none
  else some { v with balance := v.balance + a, totalDeposited := v.totalDeposited + a }

def withdraw (v : Vault) (a : Nat) : Option Vault :=
  if a = 0 then none
  else if a > v.balance then none
  else some { v with balance := v.balance - a, totalWithdrawn := v.totalWithdrawn + a }

def burn (v : Vault) (a : Nat) : Option Vault :=
  if a = 0 then none
  else if a > v.balance then none
  else some { v with balance := v.balance - a, totalBurned := v.totalBurned + a }

theorem deposit_preserves {v v' : Vault} {a : Nat}
    (hinv : Inv v) (h : deposit v a = some v') : Inv v' := by
  unfold deposit at h
  split at h
  · simp at h
  · injection h with h'; subst h'; unfold Inv at *; dsimp only at *; omega

theorem withdraw_preserves {v v' : Vault} {a : Nat}
    (hinv : Inv v) (h : withdraw v a = some v') : Inv v' := by
  unfold withdraw at h
  split at h
  · simp at h
  · split at h
    · simp at h
    · injection h with h'; subst h'; unfold Inv at *; dsimp only at *; omega

theorem burn_preserves {v v' : Vault} {a : Nat}
    (hinv : Inv v) (h : burn v a = some v') : Inv v' := by
  unfold burn at h
  split at h
  · simp at h
  · split at h
    · simp at h
    · injection h with h'; subst h'; unfold Inv at *; dsimp only at *; omega

/-- The empty vault satisfies conservation, so by the three preservation
theorems every reachable vault does. -/
theorem empty_inv : Inv ⟨0, 0, 0, 0⟩ := rfl

end Ocs.Vault
