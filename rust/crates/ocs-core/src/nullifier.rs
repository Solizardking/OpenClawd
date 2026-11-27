//! Nullifier registry — exactly-once semantics for attestations & claims.
//!
//! Port of `zk-primitives/programs/clawd-zk` (`nullifier.rs` / ZK-1 in the
//! BUDGET-5000 property list): a nullifier derived from `(secret, context)`
//! may be consumed **at most once**. On-chain this is a compressed account's
//! existence; here it is the pure state machine the program wraps.
//!
//! Lean mirror: `formal/lean/Ocs/Nullifier.lean`
//! - `consume_replay_fails` — a used nullifier can never be consumed again
//! - `consume_fresh_succeeds` — a fresh nullifier is recorded after consume

use crate::{CoreError, Result};
use alloc::collections::BTreeSet;

/// A nullifier is an opaque 32-byte value (hash of secret + context).
pub type Nullifier = [u8; 32];

#[derive(Debug, Default, Clone, PartialEq, Eq)]
pub struct NullifierSet {
    used: BTreeSet<Nullifier>,
}

impl NullifierSet {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn contains(&self, n: &Nullifier) -> bool {
        self.used.contains(n)
    }

    pub fn len(&self) -> usize {
        self.used.len()
    }

    pub fn is_empty(&self) -> bool {
        self.used.is_empty()
    }

    /// Consume `n`. Fails with `NullifierAlreadyUsed` — leaving the set
    /// unchanged — if `n` was ever consumed before.
    pub fn consume(&mut self, n: Nullifier) -> Result<()> {
        if self.used.contains(&n) {
            return Err(CoreError::NullifierAlreadyUsed);
        }
        self.used.insert(n);
        Ok(())
    }
}

/// Chunk-wise nullifier equality: two `u128` compares instead of a
/// 32-iteration byte `memcmp`. Same semantics, but symbolic executors
/// (Kani) handle integer compares far better than byte loops — the
/// BTreeSet-backed harness below timed out at 240s still unwinding
/// `memcmp`; this representation is the fix.
pub fn nullifier_eq(a: &Nullifier, b: &Nullifier) -> bool {
    let (a1, a2) = a.split_at(16);
    let (b1, b2) = b.split_at(16);
    u128::from_le_bytes(a1.try_into().unwrap_or([0u8; 16]))
        == u128::from_le_bytes(b1.try_into().unwrap_or([0u8; 16]))
        && u128::from_le_bytes(a2.try_into().unwrap_or([0u8; 16]))
            == u128::from_le_bytes(b2.try_into().unwrap_or([0u8; 16]))
}

/// Fixed-capacity nullifier set over a plain array — the shape a
/// registry *account* actually has on-chain (bounded account data),
/// and the Kani-verifiable representation of the same exactly-once
/// semantics. Capacity exhaustion is a typed failure, never a wrap.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct BoundedNullifierSet<const N: usize> {
    entries: [Nullifier; N],
    len: usize,
}

impl<const N: usize> Default for BoundedNullifierSet<N> {
    fn default() -> Self {
        Self {
            entries: [[0u8; 32]; N],
            len: 0,
        }
    }
}

impl<const N: usize> BoundedNullifierSet<N> {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn len(&self) -> usize {
        self.len
    }

    pub fn is_empty(&self) -> bool {
        self.len == 0
    }

    pub fn contains(&self, n: &Nullifier) -> bool {
        self.entries[..self.len].iter().any(|e| nullifier_eq(e, n))
    }

    pub fn consume(&mut self, n: Nullifier) -> Result<()> {
        if self.contains(&n) {
            return Err(CoreError::NullifierAlreadyUsed);
        }
        if self.len >= N {
            return Err(CoreError::Overflow);
        }
        self.entries[self.len] = n;
        self.len += 1;
        Ok(())
    }

    pub fn as_slice(&self) -> &[Nullifier] {
        &self.entries[..self.len]
    }

    /// Rebuild from a slice (account deserialization path).
    pub fn from_slice(items: &[Nullifier]) -> Result<Self> {
        let mut s = Self::new();
        for n in items {
            s.consume(*n)?;
        }
        Ok(s)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn fresh_consume_succeeds_and_records() {
        let mut s = NullifierSet::new();
        let n = [7u8; 32];
        assert_eq!(s.consume(n), Ok(()));
        assert!(s.contains(&n));
        assert_eq!(s.len(), 1);
    }

    #[test]
    fn replay_fails_and_state_unchanged() {
        let mut s = NullifierSet::new();
        let n = [9u8; 32];
        assert_eq!(s.consume(n), Ok(()));
        let before = s.clone();
        assert_eq!(s.consume(n), Err(CoreError::NullifierAlreadyUsed));
        assert_eq!(s, before);
    }

    #[test]
    fn distinct_nullifiers_are_independent() {
        let mut s = NullifierSet::new();
        assert_eq!(s.consume([1u8; 32]), Ok(()));
        assert_eq!(s.consume([2u8; 32]), Ok(()));
        assert_eq!(s.len(), 2);
    }
}

#[cfg(test)]
mod bounded_tests {
    use super::*;

    #[test]
    fn bounded_replay_fails_and_capacity_is_typed() {
        let mut s = BoundedNullifierSet::<2>::new();
        assert_eq!(s.consume([1u8; 32]), Ok(()));
        assert_eq!(s.consume([1u8; 32]), Err(CoreError::NullifierAlreadyUsed));
        assert_eq!(s.consume([2u8; 32]), Ok(()));
        // Full: a *fresh* nullifier fails with Overflow, never silently.
        assert_eq!(s.consume([3u8; 32]), Err(CoreError::Overflow));
        assert_eq!(s.len(), 2);
    }

    #[test]
    fn bounded_round_trip_via_slice() {
        let items = [[5u8; 32], [6u8; 32]];
        let s = BoundedNullifierSet::<4>::from_slice(&items).unwrap();
        assert!(s.contains(&[5u8; 32]));
        assert_eq!(s.as_slice(), &items);
        // A slice containing a duplicate is rejected on rebuild.
        assert!(BoundedNullifierSet::<4>::from_slice(&[[5u8; 32], [5u8; 32]]).is_err());
    }

    #[test]
    fn chunk_eq_matches_byte_eq() {
        let a = [7u8; 32];
        let mut b = [7u8; 32];
        assert!(nullifier_eq(&a, &b));
        b[31] = 8;
        assert!(!nullifier_eq(&a, &b));
        b = a;
        b[0] = 9;
        assert!(!nullifier_eq(&a, &b));
    }
}

#[cfg(kani)]
mod kani_proofs {
    use super::*;

    /// ZK-1, Kani-verified form: over the bounded array representation
    /// (chunk-wise equality, no BTree, no byte-memcmp loops), two
    /// consumes of the same nullifier can never both succeed.
    /// The BTreeSet version of this harness timed out at 240s still
    /// unwinding `memcmp`; this representation is the fix.
    #[kani::proof]
    #[kani::unwind(8)]
    fn replay_never_succeeds() {
        let n: Nullifier = kani::any();
        let mut s = BoundedNullifierSet::<4>::new();
        assert!(s.consume(n).is_ok());
        assert!(s.consume(n).is_err());
        assert!(s.contains(&n));
    }
}
