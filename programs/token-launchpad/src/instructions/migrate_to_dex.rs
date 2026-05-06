use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
pub struct MigrateToDex<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [BondingCurve::SEED_PREFIX, token_mint.key().as_ref()],
        bump,
        constraint = bonding_curve.authority == authority.key(),
        constraint = !bonding_curve.complete @ BondingError::AlreadyMigrated,
    )]
    pub bonding_curve: Account<'info, BondingCurve>,

    pub token_mint: Account<'info, token::Mint>,

    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = bonding_curve,
    )]
    pub curve_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = token_mint,
        associated_token::authority = dex_program,
    )]
    pub dex_token_account: Account<'info, TokenAccount>,

    /// CHECK: DEX program that will receive liquidity
    pub dex_program: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn migrate_to_dex(ctx: Context<MigrateToDex>) -> Result<()> {
    let bonding_curve = &mut ctx.accounts.bonding_curve;
    let curve_token_account = &ctx.accounts.curve_token_account;
    
    // Verify minimum liquidity requirements
    require!(
        bonding_curve.real_sol_reserves >= bonding_curve.minimum_liquidity,
        BondingError::InsufficientLiquidity
    );

    // Calculate tokens to migrate based on real reserves
    let tokens_to_migrate = curve_token_account.amount;
    require!(tokens_to_migrate > 0, BondingError::NoTokensToMigrate);

    // Transfer tokens to DEX
    let seeds = &[
        BondingCurve::SEED_PREFIX,
        ctx.accounts.token_mint.key().as_ref(),
        &[bonding_curve.bump],
    ];
    let signer = &[&seeds[..]];

    let transfer_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.curve_token_account.to_account_info(),
            to: ctx.accounts.dex_token_account.to_account_info(),
            authority: bonding_curve.to_account_info(),
        },
        signer,
    );
    token::transfer(transfer_ctx, tokens_to_migrate)?;

    // Mark bonding curve as complete
    bonding_curve.complete = true;

    // Emit migration event
    emit!(MigrationEvent {
        token_mint: ctx.accounts.token_mint.key(),
        dex_program: ctx.accounts.dex_program.key(),
        token_amount: tokens_to_migrate,
        sol_amount: bonding_curve.real_sol_reserves,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}

#[event]
pub struct MigrationEvent {
    pub token_mint: Pubkey,
    pub dex_program: Pubkey,
    pub token_amount: u64,
    pub sol_amount: u64,
    pub timestamp: i64,
}
