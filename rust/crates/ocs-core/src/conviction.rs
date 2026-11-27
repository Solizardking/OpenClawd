//! Conviction staking — score and early-exit math.
//!
//! Port of `packages/clawd-protocol` `state/conviction.rs`:
//! `score = amount × duration_epochs × consistency_bps / 10_000`, where
//! `consistency_bps = min(10_000 + min(consecutive_epochs, 90) × 1_000, 100_000)`.
//!
//! **Audit fix vs. the original:** the original computed the early-exit burn
//! as `staked_amount * 2_000 / 10_000` in `u64`, which overflows for stakes
//! above ~9.2×10¹⁵. Here the intermediate is `u128` and the result is
//! checked back into `u64`.
//!
//! Lean mirror: `formal/lean/Ocs/Conviction.lean`
//! - `score_monotone_amount` — staking more never lowers the score
//! - `early_exit_split` — burn + returned == staked, always

use crate::{CoreError, Result};

pub const BPS_DENOMINATOR: u128 = 10_000;
pub const EARLY_EXIT_BURN_BPS: u128 = 2_000; // 20%

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct ConvictionPosition {
    pub staked_amount: u64,
    pub lock_duration_slots: u64,
    pub unlock_slot: u64,
    pub consecutive_epochs: u32,
}

impl ConvictionPosition {
    /// Consistency multiplier in bps: 10_000 (1.0×) up to 100_000 (10.0×).
    pub fn consistency_bps(&self) -> u128 {
        let bonus = (self.consecutive_epochs as u128).min(90) * 1_000;
        (10_000u128 + bonus).min(100_000)
    }

    pub fn compute_score(&self, epoch_duration_slots: u64) -> u128 {
        let duration_epochs = (self.lock_duration_slots / epoch_duration_slots.max(1)) as u128;
        (self.staked_amount as u128) * duration_epochs * self.consistency_bps() / BPS_DENOMINATOR
    }

    pub fn has_matured(&self, current_slot: u64) -> bool {
        current_slot >= self.unlock_slot
    }

    /// 20% of principal, computed in u128 so it cannot overflow.
    pub fn early_exit_burn_amount(&self) -> Result<u64> {
        let burn = (self.staked_amount as u128) * EARLY_EXIT_BURN_BPS / BPS_DENOMINATOR;
        u64::try_from(burn).map_err(|_| CoreError::Overflow)
    }

    pub fn early_exit_return_amount(&self) -> Result<u64> {
        let burn = self.early_exit_burn_amount()?;
        self.staked_amount
            .checked_sub(burn)
            .ok_or(CoreError::Underflow)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn pos(amount: u64, epochs_streak: u32) -> ConvictionPosition {
        ConvictionPosition {
            staked_amount: amount,
            lock_duration_slots: 1_000,
            unlock_slot: 2_000,
            consecutive_epochs: epochs_streak,
        }
    }

    #[test]
    fn score_matches_original_formula() {
        // amount 500, 10 epochs duration, streak 0 -> 500*10*10000/10000 = 5000
        assert_eq!(pos(500, 0).compute_score(100), 5_000);
        // streak 90 -> 10x consistency -> 50_000
        assert_eq!(pos(500, 90).compute_score(100), 50_000);
        // streak caps at 90
        assert_eq!(pos(500, 10_000).compute_score(100), 50_000);
    }

    #[test]
    fn score_monotone_in_amount() {
        assert!(pos(600, 3).compute_score(100) >= pos(500, 3).compute_score(100));
    }

    #[test]
    fn early_exit_split_conserves() {
        for amount in [0u64, 1, 5, 999, 1_000_000, u64::MAX] {
            let p = pos(amount, 0);
            let burn = p.early_exit_burn_amount().unwrap();
            let back = p.early_exit_return_amount().unwrap();
            assert_eq!(burn as u128 + back as u128, amount as u128);
        }
    }

    #[test]
    fn maturity_boundary() {
        let p = pos(1, 0);
        assert!(!p.has_matured(1_999));
        assert!(p.has_matured(2_000));
    }
}

#[cfg(kani)]
mod kani_proofs {
    use super::*;

    #[kani::proof]
    fn early_exit_split_conserves_bounded() {
        let amount: u64 = kani::any();
        let p = ConvictionPosition {
            staked_amount: amount,
            lock_duration_slots: 0,
            unlock_slot: 0,
            consecutive_epochs: 0,
        };
        let burn = p.early_exit_burn_amount().unwrap();
        let back = p.early_exit_return_amount().unwrap();
        assert_eq!(burn as u128 + back as u128, amount as u128);
    }
}
