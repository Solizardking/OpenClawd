//! Access gate — the gateway's tier policy as a pure decision function.
//!
//! Port of the policy scattered through `services/gateway/` (Express
//! middleware): public reads are open; live mutations and paid features
//! require a holder tier (`CLAWD_MIN_LIVE_TIER`, `CLAWD_MIN_PAID_TIER`) or
//! an admin key. As a pure function it becomes unit-testable, Kani-able,
//! and Lean-mirrorable — middleware becomes a thin shell over `decide`.
//!
//! Lean mirror: `formal/lean/Ocs/Gate.lean`
//! - `admin_always_allowed`
//! - `below_tier_never_allowed` — no path grants access below the minimum tier

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum Tier {
    None = 0,
    Shoreline = 1,
    Shallow = 2,
    Deep = 3,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RouteClass {
    /// Public read-only route — always open.
    PublicRead,
    /// Live mutation route — requires `min_live_tier`.
    LiveMutation,
    /// Paid hosted feature — requires `min_paid_tier`.
    PaidFeature,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct GatePolicy {
    pub production_mode: bool,
    pub min_live_tier: Tier,
    pub min_paid_tier: Tier,
    pub paid_features_gated: bool,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Caller {
    pub tier: Tier,
    pub is_admin: bool,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Decision {
    Allow,
    Deny,
}

/// The whole policy in one pure function.
pub fn decide(policy: &GatePolicy, caller: &Caller, route: RouteClass) -> Decision {
    if caller.is_admin {
        return Decision::Allow;
    }
    match route {
        RouteClass::PublicRead => Decision::Allow,
        RouteClass::LiveMutation => {
            if !policy.production_mode || caller.tier >= policy.min_live_tier {
                Decision::Allow
            } else {
                Decision::Deny
            }
        }
        RouteClass::PaidFeature => {
            if !policy.paid_features_gated || caller.tier >= policy.min_paid_tier {
                Decision::Allow
            } else {
                Decision::Deny
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn prod_policy() -> GatePolicy {
        GatePolicy {
            production_mode: true,
            min_live_tier: Tier::Shoreline,
            min_paid_tier: Tier::Shallow,
            paid_features_gated: true,
        }
    }

    #[test]
    fn public_reads_open_to_all() {
        let p = prod_policy();
        assert_eq!(
            decide(
                &p,
                &Caller {
                    tier: Tier::None,
                    is_admin: false
                },
                RouteClass::PublicRead
            ),
            Decision::Allow
        );
    }

    #[test]
    fn below_tier_denied_in_production() {
        let p = prod_policy();
        let anon = Caller {
            tier: Tier::None,
            is_admin: false,
        };
        assert_eq!(decide(&p, &anon, RouteClass::LiveMutation), Decision::Deny);
        assert_eq!(decide(&p, &anon, RouteClass::PaidFeature), Decision::Deny);
        let shore = Caller {
            tier: Tier::Shoreline,
            is_admin: false,
        };
        assert_eq!(
            decide(&p, &shore, RouteClass::LiveMutation),
            Decision::Allow
        );
        assert_eq!(decide(&p, &shore, RouteClass::PaidFeature), Decision::Deny);
    }

    #[test]
    fn admin_always_allowed() {
        let p = prod_policy();
        let admin = Caller {
            tier: Tier::None,
            is_admin: true,
        };
        for r in [
            RouteClass::PublicRead,
            RouteClass::LiveMutation,
            RouteClass::PaidFeature,
        ] {
            assert_eq!(decide(&p, &admin, r), Decision::Allow);
        }
    }

    #[test]
    fn non_production_live_routes_open() {
        let mut p = prod_policy();
        p.production_mode = false;
        let anon = Caller {
            tier: Tier::None,
            is_admin: false,
        };
        assert_eq!(decide(&p, &anon, RouteClass::LiveMutation), Decision::Allow);
    }
}
