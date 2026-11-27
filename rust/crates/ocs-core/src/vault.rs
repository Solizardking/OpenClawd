//! Vault ledger — deposit / withdraw / burn accounting.
//!
//! Distilled from `packages/clawd-protocol` `state/vault.rs` (which tracks
//! `total_locked`, `total_burned`, `total_fees_collected` as loose counters
//! updated by separate instructions, with no stated invariant). Here the
//! ledger makes the invariant structural:
//!
//! **Conservation:** `balance + total_withdrawn + total_burned == total_deposited`
//! at every reachable state. Burns destroy balance; they never create it.
//!
//! Lean mirror: `formal/lean/Ocs/Vault.lean` — `conservation` theorem,
//! proved for every operation.

use crate::{CoreError, Result};

#[derive(Debug, Default, Clone, Copy, PartialEq, Eq)]
pub struct VaultLedger {
    pub balance: u64,
    pub total_deposited: u64,
    pub total_withdrawn: u64,
    pub total_burned: u64,
}

impl VaultLedger {
    pub fn new() -> Self {
        Self::default()
    }

    /// The conservation invariant, checkable at any time (and the exact
    /// statement proved in Lean).
    pub fn conservation_holds(&self) -> bool {
        (self.balance as u128) + (self.total_withdrawn as u128) + (self.total_burned as u128)
            == self.total_deposited as u128
    }

    pub fn deposit(&mut self, amount: u64) -> Result<()> {
        if amount == 0 {
            return Err(CoreError::ZeroAmount);
        }
        self.balance = self
            .balance
            .checked_add(amount)
            .ok_or(CoreError::Overflow)?;
        self.total_deposited = self
            .total_deposited
            .checked_add(amount)
            .ok_or(CoreError::Overflow)?;
        Ok(())
    }

    pub fn withdraw(&mut self, amount: u64) -> Result<()> {
        if amount == 0 {
            return Err(CoreError::ZeroAmount);
        }
        self.balance = self
            .balance
            .checked_sub(amount)
            .ok_or(CoreError::Underflow)?;
        self.total_withdrawn = self
            .total_withdrawn
            .checked_add(amount)
            .ok_or(CoreError::Overflow)?;
        Ok(())
    }

    /// Burn `amount` from the balance (entropy / epoch burns in the
    /// original). A burn is not a withdrawal: it reduces supply.
    pub fn burn(&mut self, amount: u64) -> Result<()> {
        if amount == 0 {
            return Err(CoreError::ZeroAmount);
        }
        self.balance = self
            .balance
            .checked_sub(amount)
            .ok_or(CoreError::Underflow)?;
        self.total_burned = self
            .total_burned
            .checked_add(amount)
            .ok_or(CoreError::Overflow)?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn conservation_across_mixed_ops() {
        let mut v = VaultLedger::new();
        v.deposit(1_000).unwrap();
        v.withdraw(250).unwrap();
        v.burn(50).unwrap();
        v.deposit(10).unwrap();
        assert_eq!(v.balance, 710);
        assert!(v.conservation_holds());
    }

    #[test]
    fn overdraw_and_overburn_fail_closed() {
        let mut v = VaultLedger::new();
        v.deposit(100).unwrap();
        assert_eq!(v.withdraw(101), Err(CoreError::Underflow));
        assert_eq!(v.burn(101), Err(CoreError::Underflow));
        assert_eq!(v.balance, 100);
        assert!(v.conservation_holds());
    }

    #[test]
    fn zero_amounts_rejected() {
        let mut v = VaultLedger::new();
        assert_eq!(v.deposit(0), Err(CoreError::ZeroAmount));
        assert_eq!(v.withdraw(0), Err(CoreError::ZeroAmount));
        assert_eq!(v.burn(0), Err(CoreError::ZeroAmount));
    }
}

#[cfg(kani)]
mod kani_proofs {
    use super::*;

    #[kani::proof]
    fn deposit_preserves_conservation() {
        let mut v = VaultLedger {
            balance: kani::any(),
            total_deposited: kani::any(),
            total_withdrawn: kani::any(),
            total_burned: kani::any(),
        };
        kani::assume(v.conservation_holds());
        let amount: u64 = kani::any();
        if v.deposit(amount).is_ok() {
            assert!(v.conservation_holds());
        }
    }
}
