use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::token;

use crate::state::*;
use crate::errors::*;

#[derive(Accounts)]
pub struct BuyTokensEnhanced<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(mut)]
    pub curve: Account<'info, BondingCurve>,

    #[account(mut)]
    pub treasury: SystemAccount<'info>,

    /// The token mint for the bonding curve
    #[account(mut)]
    pub token_mint: Account<'info, token::Mint>,

    /// The buyer's token account
    #[account(mut)]
    pub buyer_token_account: Account<'info, token::TokenAccount>,

    /// The fee recipient account
    #[account(mut)]
    pub fee_recipient: SystemAccount<'info>,

    pub global: Account<'info, Global>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, token::Token>,
}

pub fn buy_tokens_enhanced(
    ctx: Context<BuyTokensEnhanced>,
    amount_sol: u64,
) -> Result<()> {
    let curve = &mut ctx.accounts.curve;
    let global = &ctx.accounts.global;

    // Calculate tokens out using constant product formula
    let virtual_sol_reserves = curve.virtual_sol_reserves;
    let virtual_token_reserves = curve.virtual_token_reserves;

    // Constant product formula: (virtual_sol_reserves + amount_sol) * (virtual_token_reserves - tokens_out) = virtual_sol_reserves * virtual_token_reserves
    let tokens_out = virtual_token_reserves
        .saturating_mul(amount_sol)
        .saturating_div(virtual_sol_reserves.saturating_add(amount_sol));

    require!(tokens_out > 0, BondingError::InvalidPrice);

    // Calculate fee
    let fee_amount = amount_sol
        .saturating_mul(global.fee_bps as u64)
        .saturating_div(10000);

    // Transfer SOL to treasury
    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        anchor_lang::system_program::Transfer {
            from: ctx.accounts.buyer.to_account_info(),
            to: ctx.accounts.treasury.to_account_info(),
        },
    );
    system_program::transfer(cpi_context, amount_sol)?;

    // Transfer fee to fee recipient
    if fee_amount > 0 {
        let fee_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.treasury.to_account_info(),
                to: ctx.accounts.fee_recipient.to_account_info(),
            },
        );
        system_program::transfer(fee_context, fee_amount)?;
    }

    // Mint tokens to buyer
    let seeds = &[
        b"curve".as_ref(),
        curve.token_mint.as_ref(),
        &[curve.bump],
    ];
    let signer = &[&seeds[..]];

    let cpi_accounts = token::MintTo {
        mint: ctx.accounts.token_mint.to_account_info(),
        to: ctx.accounts.buyer_token_account.to_account_info(),
        authority: curve.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
    token::mint_to(cpi_ctx, tokens_out)?;

    // Update reserves
    curve.virtual_sol_reserves = curve.virtual_sol_reserves.saturating_add(amount_sol);
    curve.virtual_token_reserves = curve.virtual_token_reserves.saturating_sub(tokens_out);
    curve.real_sol_reserves = curve.real_sol_reserves.saturating_add(amount_sol.saturating_sub(fee_amount));
    curve.real_token_reserves = curve.real_token_reserves.saturating_add(tokens_out);

    emit!(TradeEvent {
        trader: ctx.accounts.buyer.key(),
        amount: tokens_out,
        price: amount_sol,
        is_buy: true,
        timestamp: Clock::get()?.unix_timestamp,
    });

    Ok(())
}