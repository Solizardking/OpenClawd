use anchor_lang::prelude::*;

#[account]
pub struct Global {
    pub authority: Pubkey,
    pub initialized: bool,
    pub fee_recipient: Pubkey,
    pub withdraw_authority: Pubkey,
    pub initial_virtual_token_reserves: u64,
    pub initial_virtual_sol_reserves: u64,
    pub initial_real_token_reserves: u64,
    pub initial_token_supply: u64,
    pub fee_basis_points: u64,
}

#[account]
pub struct BondingCurve {
    pub virtual_sol_reserves: u64,
    pub virtual_token_reserves: u64,
    pub real_sol_reserves: u64,
    pub real_token_reserves: u64,
    pub token_total_supply: u64,
    pub complete: bool,
}

impl Global {
    pub const SEED_PREFIX: &'static [u8] = b"global";
    pub const INIT_SPACE: usize = 8 + // discriminator
        32 + // authority
        1 + // initialized
        32 + // fee_recipient
        32 + // withdraw_authority
        8 + // initial_virtual_token_reserves
        8 + // initial_virtual_sol_reserves
        8 + // initial_real_token_reserves
        8 + // initial_token_supply
        8; // fee_basis_points
}

impl BondingCurve {
    pub const SEED_PREFIX: &'static [u8] = b"bonding_curve";
    pub const INIT_SPACE: usize = 8 + // discriminator
        8 + // virtual_sol_reserves
        8 + // virtual_token_reserves
        8 + // real_sol_reserves
        8 + // real_token_reserves
        8 + // token_total_supply
        1; // complete
}
