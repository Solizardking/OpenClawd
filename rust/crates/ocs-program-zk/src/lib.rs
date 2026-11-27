//! # ocs-program-zk — clawd-zk program shell
//!
//! The instruction layer of `zk-primitives/programs/clawd-zk`, restructured
//! the Pinocchio way (no framework macros, no dependencies): a fixed-layout
//! registry account plus tag-prefixed instructions delegating to
//! `ocs-core`'s Kani-verified bounded nullifier set.
//!
//! The BUDGET-5000 property list maps onto this shell as:
//! - **ZK-1 nullifier uniqueness** — `PublishAttestation` consumes the
//!   nullifier in the published set; a replay fails (Lean: exactly-once;
//!   Kani: `replay_never_succeeds`).
//! - **ZK-2 proof-gating** — out of scope for the shell: Groth16
//!   verification stays in the Light/Groth16 verifier path; the shell
//!   receives attestations only after that gate (documented boundary).
//! - **ZK-3 consume monotonicity** — `ConsumeAttestation` requires the
//!   nullifier to be published and unconsumed; the consumed set only grows.
//! - **ZK-4 replay binding** — publish binds `(nullifier, model_hash)`:
//!   the same nullifier with a *different* model hash is a distinct
//!   failure (`BindingMismatch`), not a silent accept.
//! - **ZK-5 version monotonicity** — `CommitEncryptedState` requires a
//!   strictly greater version than the stored one.
//!
//! ## Registry account layout (fixed, little-endian)
//! ```text
//!  0.. 8   state_version (u64)
//!  8..16   published_count (u64)
//! 16..24   consumed_count (u64)
//! 24..56   last_commitment [u8; 32]
//! 56..     published entries: published_count × (nullifier[32] + model_hash[32])
//!          followed by consumed entries: consumed_count × nullifier[32]
//! ```
//! Capacity: 64 published / 64 consumed in this shell (account-size bound;
//! the production design uses Light compressed accounts for unbounded
//! sets — the shell proves the transition semantics, not the storage scale).

use ocs_core::nullifier::{nullifier_eq, BoundedNullifierSet, Nullifier};
use ocs_core::CoreError;

pub const MAX_ENTRIES: usize = 64;
pub const HEADER_LEN: usize = 56;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ProgramError {
    InvalidInstructionData,
    InvalidAccountData,
    BindingMismatch,
    NotPublished,
    VersionNotIncreasing,
    Core(CoreError),
}

impl From<CoreError> for ProgramError {
    fn from(e: CoreError) -> Self {
        ProgramError::Core(e)
    }
}

pub type Result<T> = core::result::Result<T, ProgramError>;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Registry {
    pub state_version: u64,
    pub last_commitment: [u8; 32],
    /// (nullifier, model_hash) pairs, in publish order.
    pub published: Vec<(Nullifier, [u8; 32])>,
    pub consumed: BoundedNullifierSet<MAX_ENTRIES>,
}

impl Default for Registry {
    fn default() -> Self {
        Self {
            state_version: 0,
            last_commitment: [0u8; 32],
            published: Vec::new(),
            consumed: BoundedNullifierSet::new(),
        }
    }
}

impl Registry {
    pub fn serialized_len(&self) -> usize {
        HEADER_LEN + self.published.len() * 64 + self.consumed.len() * 32
    }

    pub fn load(data: &[u8]) -> Result<Self> {
        if data.len() < HEADER_LEN {
            return Err(ProgramError::InvalidAccountData);
        }
        let rd =
            |o: usize| -> u64 { u64::from_le_bytes(data[o..o + 8].try_into().unwrap_or([0u8; 8])) };
        let state_version = rd(0);
        let published_count = rd(8) as usize;
        let consumed_count = rd(16) as usize;
        if published_count > MAX_ENTRIES || consumed_count > MAX_ENTRIES {
            return Err(ProgramError::InvalidAccountData);
        }
        let mut last_commitment = [0u8; 32];
        last_commitment.copy_from_slice(&data[24..56]);
        let mut off = HEADER_LEN;
        let mut published = Vec::with_capacity(published_count);
        for _ in 0..published_count {
            let mut n = [0u8; 32];
            let mut m = [0u8; 32];
            n.copy_from_slice(
                data.get(off..off + 32)
                    .ok_or(ProgramError::InvalidAccountData)?,
            );
            m.copy_from_slice(
                data.get(off + 32..off + 64)
                    .ok_or(ProgramError::InvalidAccountData)?,
            );
            published.push((n, m));
            off += 64;
        }
        let mut consumed_items = Vec::with_capacity(consumed_count);
        for _ in 0..consumed_count {
            let mut n = [0u8; 32];
            n.copy_from_slice(
                data.get(off..off + 32)
                    .ok_or(ProgramError::InvalidAccountData)?,
            );
            consumed_items.push(n);
            off += 32;
        }
        Ok(Self {
            state_version,
            last_commitment,
            published,
            consumed: BoundedNullifierSet::from_slice(&consumed_items)?,
        })
    }

    pub fn store(&self, data: &mut [u8]) -> Result<()> {
        if data.len() < self.serialized_len() {
            return Err(ProgramError::InvalidAccountData);
        }
        let wr = |data: &mut [u8], o: usize, v: u64| {
            data[o..o + 8].copy_from_slice(&v.to_le_bytes());
        };
        wr(data, 0, self.state_version);
        wr(data, 8, self.published.len() as u64);
        wr(data, 16, self.consumed.len() as u64);
        data[24..56].copy_from_slice(&self.last_commitment);
        let mut off = HEADER_LEN;
        for (n, m) in &self.published {
            data[off..off + 32].copy_from_slice(n);
            data[off + 32..off + 64].copy_from_slice(m);
            off += 64;
        }
        for n in self.consumed.as_slice() {
            data[off..off + 32].copy_from_slice(n);
            off += 32;
        }
        Ok(())
    }

    fn find_published(&self, n: &Nullifier) -> Option<&[u8; 32]> {
        self.published
            .iter()
            .find(|(pn, _)| nullifier_eq(pn, n))
            .map(|(_, m)| m)
    }
}

/// Instructions:
/// ```text
/// 0 PublishAttestation { nullifier[32], model_hash[32] }
/// 1 ConsumeAttestation { nullifier[32] }
/// 2 CommitEncryptedState { version: u64, commitment[32] }
/// ```
/// On error the account bytes are left untouched.
pub fn process_instruction(account: &mut [u8], ix: &[u8]) -> Result<()> {
    let (tag, rest) = ix
        .split_first()
        .ok_or(ProgramError::InvalidInstructionData)?;
    let mut reg = Registry::load(account)?;
    let rd32 = |o: usize| -> Result<[u8; 32]> {
        rest.get(o..o + 32)
            .map(|s| s.try_into().unwrap_or([0u8; 32]))
            .ok_or(ProgramError::InvalidInstructionData)
    };
    match tag {
        0 => {
            let n = rd32(0)?;
            let model_hash = rd32(32)?;
            if let Some(existing) = reg.find_published(&n) {
                // ZK-4: same nullifier, different model — binding mismatch.
                // Same nullifier, same model — plain replay.
                return Err(if *existing == model_hash {
                    ProgramError::Core(CoreError::NullifierAlreadyUsed)
                } else {
                    ProgramError::BindingMismatch
                });
            }
            if reg.published.len() >= MAX_ENTRIES {
                return Err(ProgramError::Core(CoreError::Overflow));
            }
            reg.published.push((n, model_hash));
        }
        1 => {
            let n = rd32(0)?;
            if reg.find_published(&n).is_none() {
                return Err(ProgramError::NotPublished);
            }
            // ZK-3: consume succeeds exactly once (bounded-set replay error).
            reg.consumed.consume(n)?;
        }
        2 => {
            let version = rest
                .get(0..8)
                .map(|s| u64::from_le_bytes(s.try_into().unwrap_or([0u8; 8])))
                .ok_or(ProgramError::InvalidInstructionData)?;
            let commitment = rd32(8)?;
            // ZK-5: strictly increasing versions only.
            if version <= reg.state_version {
                return Err(ProgramError::VersionNotIncreasing);
            }
            reg.state_version = version;
            reg.last_commitment = commitment;
        }
        _ => return Err(ProgramError::InvalidInstructionData),
    }
    reg.store(account)
}

#[cfg(test)]
mod tests {
    use super::*;

    const ACCT_LEN: usize = HEADER_LEN + MAX_ENTRIES * 64 + MAX_ENTRIES * 32;

    fn publish(n: u8, m: u8) -> Vec<u8> {
        let mut v = vec![0u8];
        v.extend_from_slice(&[n; 32]);
        v.extend_from_slice(&[m; 32]);
        v
    }
    fn consume(n: u8) -> Vec<u8> {
        let mut v = vec![1u8];
        v.extend_from_slice(&[n; 32]);
        v
    }
    fn commit(version: u64, c: u8) -> Vec<u8> {
        let mut v = vec![2u8];
        v.extend_from_slice(&version.to_le_bytes());
        v.extend_from_slice(&[c; 32]);
        v
    }

    #[test]
    fn publish_then_consume_exactly_once() {
        let mut acct = vec![0u8; ACCT_LEN];
        process_instruction(&mut acct, &publish(1, 9)).unwrap();
        process_instruction(&mut acct, &consume(1)).unwrap();
        // ZK-3: second consume fails; ZK-1: republish fails.
        assert!(process_instruction(&mut acct, &consume(1)).is_err());
        assert_eq!(
            process_instruction(&mut acct, &publish(1, 9)),
            Err(ProgramError::Core(CoreError::NullifierAlreadyUsed))
        );
    }

    #[test]
    fn replay_binding_mismatch_is_distinct() {
        let mut acct = vec![0u8; ACCT_LEN];
        process_instruction(&mut acct, &publish(1, 9)).unwrap();
        assert_eq!(
            process_instruction(&mut acct, &publish(1, 8)),
            Err(ProgramError::BindingMismatch)
        );
    }

    #[test]
    fn consume_unpublished_fails() {
        let mut acct = vec![0u8; ACCT_LEN];
        assert_eq!(
            process_instruction(&mut acct, &consume(7)),
            Err(ProgramError::NotPublished)
        );
    }

    #[test]
    fn version_must_strictly_increase() {
        let mut acct = vec![0u8; ACCT_LEN];
        process_instruction(&mut acct, &commit(5, 1)).unwrap();
        assert_eq!(
            process_instruction(&mut acct, &commit(5, 2)),
            Err(ProgramError::VersionNotIncreasing)
        );
        assert_eq!(
            process_instruction(&mut acct, &commit(4, 2)),
            Err(ProgramError::VersionNotIncreasing)
        );
        process_instruction(&mut acct, &commit(6, 2)).unwrap();
        let reg = Registry::load(&acct).unwrap();
        assert_eq!(reg.state_version, 6);
        assert_eq!(reg.last_commitment, [2u8; 32]);
    }

    #[test]
    fn state_survives_serialization_round_trip() {
        let mut acct = vec![0u8; ACCT_LEN];
        process_instruction(&mut acct, &publish(3, 4)).unwrap();
        process_instruction(&mut acct, &commit(2, 7)).unwrap();
        let reg = Registry::load(&acct).unwrap();
        assert_eq!(reg.published.len(), 1);
        assert_eq!(reg.find_published(&[3u8; 32]), Some(&[4u8; 32]));
        // And a failed instruction leaves bytes untouched.
        let before = acct.clone();
        assert!(process_instruction(&mut acct, &publish(3, 4)).is_err());
        assert_eq!(acct, before);
    }
}
