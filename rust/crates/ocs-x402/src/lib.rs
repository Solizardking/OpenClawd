//! # ocs-x402 — x402 payment-requirement verification, pure Rust
//!
//! Port of the verification core from `x402/` and `services/gateway/`
//! (TypeScript): given a payment requirement and a presented payment,
//! decide — purely — whether it satisfies the requirement. Signature
//! verification itself stays at the edge (wallet/RPC); everything that
//! decides *whether a verified payment is acceptable* lives here:
//! asset match, amount sufficiency, expiry, and replay protection
//! (via `ocs-core` nullifiers, keyed by payment id).
//!
//! Lean mirror: `formal/lean/Ocs/X402.lean`
//! - `underpaid_never_accepted`
//! - `expired_never_accepted`
//! - `replay_never_accepted`

use ocs_core::nullifier::NullifierSet;
use ocs_core::CoreError;

/// Assets are identified by mint address bytes (32B Solana pubkey).
pub type AssetId = [u8; 32];

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Requirement {
    pub asset: AssetId,
    pub min_amount: u64,
    /// Unix seconds; payment must be presented at or before this time.
    pub expires_at: u64,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Payment {
    pub asset: AssetId,
    pub amount: u64,
    /// Unique payment id — doubles as the replay nullifier.
    pub payment_id: [u8; 32],
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RejectReason {
    WrongAsset,
    Underpaid,
    Expired,
    Replay,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Verdict {
    Accept,
    Reject(RejectReason),
}

/// Verify `payment` against `req` at time `now`, consuming its id in
/// `seen` on acceptance so the same payment can never be accepted twice.
pub fn verify(req: &Requirement, payment: &Payment, now: u64, seen: &mut NullifierSet) -> Verdict {
    if payment.asset != req.asset {
        return Verdict::Reject(RejectReason::WrongAsset);
    }
    if payment.amount < req.min_amount {
        return Verdict::Reject(RejectReason::Underpaid);
    }
    if now > req.expires_at {
        return Verdict::Reject(RejectReason::Expired);
    }
    match seen.consume(payment.payment_id) {
        Ok(()) => Verdict::Accept,
        Err(CoreError::NullifierAlreadyUsed) => Verdict::Reject(RejectReason::Replay),
        Err(_) => Verdict::Reject(RejectReason::Replay),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn req() -> Requirement {
        Requirement {
            asset: [1u8; 32],
            min_amount: 100,
            expires_at: 1_000,
        }
    }
    fn pay(amount: u64, id: u8) -> Payment {
        Payment {
            asset: [1u8; 32],
            amount,
            payment_id: [id; 32],
        }
    }

    #[test]
    fn exact_payment_accepted_once() {
        let mut seen = NullifierSet::new();
        assert_eq!(
            verify(&req(), &pay(100, 1), 999, &mut seen),
            Verdict::Accept
        );
        assert_eq!(
            verify(&req(), &pay(100, 1), 999, &mut seen),
            Verdict::Reject(RejectReason::Replay)
        );
    }

    #[test]
    fn underpaid_wrong_asset_expired_rejected() {
        let mut seen = NullifierSet::new();
        assert_eq!(
            verify(&req(), &pay(99, 2), 999, &mut seen),
            Verdict::Reject(RejectReason::Underpaid)
        );
        let mut wrong = pay(100, 3);
        wrong.asset = [2u8; 32];
        assert_eq!(
            verify(&req(), &wrong, 999, &mut seen),
            Verdict::Reject(RejectReason::WrongAsset)
        );
        assert_eq!(
            verify(&req(), &pay(100, 4), 1_001, &mut seen),
            Verdict::Reject(RejectReason::Expired)
        );
    }

    #[test]
    fn rejected_payment_does_not_burn_its_id() {
        let mut seen = NullifierSet::new();
        assert_eq!(
            verify(&req(), &pay(50, 5), 999, &mut seen),
            Verdict::Reject(RejectReason::Underpaid)
        );
        // Same id, now sufficient — must still be acceptable.
        assert_eq!(
            verify(&req(), &pay(100, 5), 999, &mut seen),
            Verdict::Accept
        );
    }
}
