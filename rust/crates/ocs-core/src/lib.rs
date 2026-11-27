//! # ocs-core — OpenClawd Solana core state machines
//!
//! Pure-Rust ports of the value-bearing logic that today lives scattered
//! across the TypeScript monorepo and three disconnected Anchor programs
//! (`packages/clawd-protocol`, `zk-primitives`, and the triplicated staking
//! program). Design rules, chosen so this crate is *Lean-ready*:
//!
//! 1. **No dependencies, `no_std`-compatible.** Nothing here needs an
//!    allocator beyond `alloc` collections, an OS, or a runtime.
//! 2. **Pure transitions.** Every operation is `state -> Result<state>`;
//!    no hidden I/O, no clocks except explicit slot/time parameters.
//! 3. **Checked arithmetic only.** Overflow/underflow is a typed error.
//!    (The original TS/Anchor code has unchecked `u64` multiplications —
//!    see `docs/AUDIT.md`.)
//! 4. **One-to-one Lean mirror.** Each module has a namesake in
//!    `formal/lean/Ocs/` stating the same transition and its invariant,
//!    ready for Harmonic/Aristotle runs and Kani harnesses in-tree.

#![cfg_attr(not(test), no_std)]

extern crate alloc;

pub mod conviction;
pub mod gate;
pub mod nullifier;
pub mod vault;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CoreError {
    /// Arithmetic overflowed the machine type.
    Overflow,
    /// Arithmetic would underflow (e.g. withdrawing more than the balance).
    Underflow,
    /// A nullifier was presented twice — exactly-once violated by the caller.
    NullifierAlreadyUsed,
    /// Position has not reached its unlock slot.
    NotMatured,
    /// Zero-amount operation where a positive amount is required.
    ZeroAmount,
}

pub type Result<T> = core::result::Result<T, CoreError>;
