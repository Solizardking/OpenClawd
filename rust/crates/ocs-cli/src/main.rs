//! `ocs` — Rust CLI for the OpenClawd Solana rewrite.
//!
//! First commands exercise the core state machines end-to-end (the same
//! invariants the Lean files prove). Wallet/RPC commands land behind this
//! shell as the port proceeds — see docs/MIGRATION.md.

use ocs_core::conviction::ConvictionPosition;
use ocs_core::gate::{decide, Caller, Decision, GatePolicy, RouteClass, Tier};
use ocs_core::nullifier::NullifierSet;
use ocs_core::vault::VaultLedger;
use ocs_x402::{verify, Payment, Requirement, Verdict};

fn main() {
    let args: Vec<String> = std::env::args().collect();
    let cmd = args.get(1).map(String::as_str).unwrap_or("demo");
    match cmd {
        "demo" => demo(),
        "score" => score(&args),
        "-h" | "--help" | "help" => usage(),
        other => {
            eprintln!("unknown command: {other}");
            usage();
            std::process::exit(2);
        }
    }
}

fn usage() {
    println!(
        "ocs — OpenClawd Solana (Rust rewrite)\n\n\
         USAGE:\n  ocs demo            run the core invariant demo\n\
         \x20 ocs score <amount> <lock_slots> <epoch_slots> <streak>\n\
         \x20 ocs help            this text"
    );
}

fn score(args: &[String]) {
    let parse = |i: usize| args.get(i).and_then(|s| s.parse::<u64>().ok());
    let (Some(amount), Some(lock), Some(epoch), Some(streak)) =
        (parse(2), parse(3), parse(4), parse(5))
    else {
        eprintln!("usage: ocs score <amount> <lock_slots> <epoch_slots> <streak>");
        std::process::exit(2);
    };
    let p = ConvictionPosition {
        staked_amount: amount,
        lock_duration_slots: lock,
        unlock_slot: lock,
        consecutive_epochs: streak as u32,
    };
    println!("conviction_score={}", p.compute_score(epoch));
    println!(
        "early_exit: burn={} return={}",
        p.early_exit_burn_amount().unwrap_or(0),
        p.early_exit_return_amount().unwrap_or(0)
    );
}

fn demo() {
    println!("== ocs-core demo ==");

    // Vault conservation
    let mut v = VaultLedger::new();
    v.deposit(1_000).expect("deposit");
    v.withdraw(250).expect("withdraw");
    v.burn(50).expect("burn");
    println!(
        "vault: balance={} conservation_holds={}",
        v.balance,
        v.conservation_holds()
    );
    assert!(v.conservation_holds());

    // Nullifier exactly-once
    let mut set = NullifierSet::new();
    let n = [42u8; 32];
    println!("nullifier first consume: {:?}", set.consume(n));
    println!("nullifier replay:        {:?}", set.consume(n));

    // Gate policy
    let policy = GatePolicy {
        production_mode: true,
        min_live_tier: Tier::Shoreline,
        min_paid_tier: Tier::Shallow,
        paid_features_gated: true,
    };
    let anon = Caller {
        tier: Tier::None,
        is_admin: false,
    };
    println!(
        "gate anon->paid: {:?} (expect Deny)",
        decide(&policy, &anon, RouteClass::PaidFeature)
    );
    let _ = Decision::Allow; // keep enum visible in demo output docs

    // x402 verify + replay
    let req = Requirement {
        asset: [1u8; 32],
        min_amount: 100,
        expires_at: 1_000,
    };
    let pay = Payment {
        asset: [1u8; 32],
        amount: 100,
        payment_id: [7u8; 32],
    };
    let mut seen = NullifierSet::new();
    let first = verify(&req, &pay, 999, &mut seen);
    let replay = verify(&req, &pay, 999, &mut seen);
    println!("x402 first: {first:?}  replay: {replay:?}");
    assert_eq!(first, Verdict::Accept);

    println!("demo ok");
}
