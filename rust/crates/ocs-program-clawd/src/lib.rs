//! # ocs-program-clawd — clawd-protocol program shell
//!
//! The instruction layer of `packages/clawd-protocol`, restructured the
//! Pinocchio way: **no framework macros, no dependencies** — account state
//! is a fixed byte layout, instructions are tag-prefixed byte strings, and
//! every state transition delegates to `ocs-core` (vault ledger +
//! conviction). An Anchor or Pinocchio entrypoint that owns accounts and
//! CPIs binds to `process_instruction` without changing any semantics.
//!
//! Scope of this shell: the vault + conviction instructions. The original
//! program's agent-binding / milestone / sentiment / hook instructions are
//! Phase 2 (they carry account-graph logic, not new math).
//!
//! ## Account layout (VaultAccount, 48 bytes, little-endian)
//! ```text
//!  0.. 8  balance            (ocs-core VaultLedger)
//!  8..16  total_deposited
//! 16..24  total_withdrawn
//! 24..32  total_burned
//! 32..40  epoch_duration_slots
//! 40..48  total_conviction_score (low 64 bits; score itself is u128 in-core)
//! ```
//! ## Instructions
//! ```text
//! 0 Deposit    { amount: u64 }
//! 1 Withdraw   { amount: u64 }
//! 2 Burn       { amount: u64 }
//! 3 Stake      { amount: u64, lock_slots: u64, streak: u32 } -> score in Outcome
//! 4 EarlyExit  { staked_amount: u64 }  (burns 20% from the vault, returns 80%)
//! ```

use ocs_core::conviction::ConvictionPosition;
use ocs_core::vault::VaultLedger;
use ocs_core::CoreError;

pub const VAULT_ACCOUNT_LEN: usize = 48;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ProgramError {
    InvalidInstructionData,
    InvalidAccountData,
    Core(CoreError),
}

pub type Result<T> = core::result::Result<T, ProgramError>;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct VaultAccount {
    pub ledger: VaultLedger,
    pub epoch_duration_slots: u64,
    pub total_conviction_score: u64,
}

impl VaultAccount {
    pub fn load(data: &[u8]) -> Result<Self> {
        if data.len() < VAULT_ACCOUNT_LEN {
            return Err(ProgramError::InvalidAccountData);
        }
        let rd =
            |o: usize| -> u64 { u64::from_le_bytes(data[o..o + 8].try_into().unwrap_or([0u8; 8])) };
        Ok(Self {
            ledger: VaultLedger {
                balance: rd(0),
                total_deposited: rd(8),
                total_withdrawn: rd(16),
                total_burned: rd(24),
            },
            epoch_duration_slots: rd(32),
            total_conviction_score: rd(40),
        })
    }

    pub fn store(&self, data: &mut [u8]) -> Result<()> {
        if data.len() < VAULT_ACCOUNT_LEN {
            return Err(ProgramError::InvalidAccountData);
        }
        let wr = |data: &mut [u8], o: usize, v: u64| {
            data[o..o + 8].copy_from_slice(&v.to_le_bytes());
        };
        wr(data, 0, self.ledger.balance);
        wr(data, 8, self.ledger.total_deposited);
        wr(data, 16, self.ledger.total_withdrawn);
        wr(data, 24, self.ledger.total_burned);
        wr(data, 32, self.epoch_duration_slots);
        wr(data, 40, self.total_conviction_score);
        Ok(())
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Outcome {
    None,
    /// Conviction score computed by Stake (full u128 from ocs-core).
    Score(u128),
}

fn rd_u64(ix: &[u8], o: usize) -> Result<u64> {
    ix.get(o..o + 8)
        .map(|s| u64::from_le_bytes(s.try_into().unwrap_or([0u8; 8])))
        .ok_or(ProgramError::InvalidInstructionData)
}

/// Process one instruction against the vault account bytes.
/// On error the account bytes are left untouched (load → mutate a copy →
/// store only on success), matching Solana's fail-atomic semantics.
pub fn process_instruction(account: &mut [u8], ix: &[u8]) -> Result<Outcome> {
    let (tag, rest) = ix
        .split_first()
        .ok_or(ProgramError::InvalidInstructionData)?;
    let mut acct = VaultAccount::load(account)?;
    let mut outcome = Outcome::None;
    match tag {
        0 => acct.ledger.deposit(rd_u64(rest, 0)?)?,
        1 => acct.ledger.withdraw(rd_u64(rest, 0)?)?,
        2 => acct.ledger.burn(rd_u64(rest, 0)?)?,
        3 => {
            let amount = rd_u64(rest, 0)?;
            let lock_slots = rd_u64(rest, 8)?;
            let streak = rest
                .get(16..20)
                .map(|s| u32::from_le_bytes(s.try_into().unwrap_or([0u8; 4])))
                .ok_or(ProgramError::InvalidInstructionData)?;
            // Staking locks value into the vault.
            acct.ledger.deposit(amount)?;
            let pos = ConvictionPosition {
                staked_amount: amount,
                lock_duration_slots: lock_slots,
                unlock_slot: lock_slots,
                consecutive_epochs: streak,
            };
            let score = pos.compute_score(acct.epoch_duration_slots);
            acct.total_conviction_score = acct
                .total_conviction_score
                .checked_add(score as u64)
                .ok_or(CoreError::Overflow)?;
            outcome = Outcome::Score(score);
        }
        4 => {
            let amount = rd_u64(rest, 0)?;
            let pos = ConvictionPosition {
                staked_amount: amount,
                lock_duration_slots: 0,
                unlock_slot: 0,
                consecutive_epochs: 0,
            };
            let burn = pos.early_exit_burn_amount()?;
            let back = pos.early_exit_return_amount()?;
            acct.ledger.burn(burn)?;
            acct.ledger.withdraw(back)?;
        }
        _ => return Err(ProgramError::InvalidInstructionData),
    }
    acct.store(account)?;
    Ok(outcome)
}

impl From<CoreError> for ProgramError {
    fn from(e: CoreError) -> Self {
        ProgramError::Core(e)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn ix(tag: u8, args: &[u64]) -> Vec<u8> {
        let mut v = vec![tag];
        for a in args {
            v.extend_from_slice(&a.to_le_bytes());
        }
        v
    }

    fn funded() -> Vec<u8> {
        let mut acct = vec![0u8; VAULT_ACCOUNT_LEN];
        // epoch_duration_slots = 100 at offset 32
        acct[32..40].copy_from_slice(&100u64.to_le_bytes());
        process_instruction(&mut acct, &ix(0, &[1_000])).unwrap();
        acct
    }

    #[test]
    fn deposit_withdraw_burn_round_trip() {
        let mut acct = funded();
        process_instruction(&mut acct, &ix(1, &[250])).unwrap();
        process_instruction(&mut acct, &ix(2, &[50])).unwrap();
        let a = VaultAccount::load(&acct).unwrap();
        assert_eq!(a.ledger.balance, 700);
        assert!(a.ledger.conservation_holds());
    }

    #[test]
    fn failed_instruction_leaves_account_untouched() {
        let mut acct = funded();
        let before = acct.clone();
        assert!(process_instruction(&mut acct, &ix(1, &[2_000])).is_err());
        assert_eq!(acct, before);
    }

    #[test]
    fn stake_scores_and_locks() {
        let mut acct = funded();
        let mut stake_ix = ix(3, &[500, 1_000]);
        stake_ix.extend_from_slice(&0u32.to_le_bytes());
        let out = process_instruction(&mut acct, &stake_ix).unwrap();
        assert_eq!(out, Outcome::Score(5_000));
        let a = VaultAccount::load(&acct).unwrap();
        assert_eq!(a.ledger.balance, 1_500);
        assert_eq!(a.total_conviction_score, 5_000);
    }

    #[test]
    fn early_exit_burns_20_returns_80() {
        let mut acct = funded();
        process_instruction(&mut acct, &ix(4, &[500])).unwrap();
        let a = VaultAccount::load(&acct).unwrap();
        // 100 burned + 400 returned out of the 1_000 balance
        assert_eq!(a.ledger.balance, 500);
        assert_eq!(a.ledger.total_burned, 100);
        assert_eq!(a.ledger.total_withdrawn, 400);
        assert!(a.ledger.conservation_holds());
    }

    #[test]
    fn bad_tag_and_short_data_rejected() {
        let mut acct = funded();
        assert_eq!(
            process_instruction(&mut acct, &[99]),
            Err(ProgramError::InvalidInstructionData)
        );
        assert_eq!(
            process_instruction(&mut acct, &[0, 1, 2]),
            Err(ProgramError::InvalidInstructionData)
        );
    }
}
