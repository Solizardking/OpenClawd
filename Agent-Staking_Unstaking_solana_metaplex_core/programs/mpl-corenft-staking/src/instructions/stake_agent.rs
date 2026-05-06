use crate::*;
use mpl_core::{
    ID as CORE_PROGRAM_ID,
    accounts::{ BaseAssetV1, BaseCollectionV1 },
    instructions::AddPluginV1CpiBuilder,
    types::{ FreezeDelegate, Plugin, UpdateAuthority },
};

#[derive(Accounts)]
pub struct StakeAgent<'info> {
    /// Owner of the agent NFT being staked. Must sign.
    pub owner: Signer<'info>,

    /// Tx fee payer. Usually equal to `owner`.
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [GLOBAL_AUTHORITY_SEED],
        bump
    )]
    pub global_pool: Account<'info, GlobalPool>,

    /// The Metaplex Core agent asset to stake. `has_one = owner` enforces that
    /// `asset.owner == owner.key()`. The collection-update-authority constraint
    /// pins the asset to the configured agent collection.
    #[account(
        mut,
        has_one = owner @ StakingError::InvalidOwner,
        constraint = asset.update_authority == UpdateAuthority::Collection(collection.key()) @ StakingError::InvalidCollection,
    )]
    pub asset: Account<'info, BaseAssetV1>,

    #[account(mut)]
    pub collection: Account<'info, BaseCollectionV1>,

    #[account(address = CORE_PROGRAM_ID)]
    /// CHECK: pinned by address constraint; CPI'd into directly.
    pub core_program: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

pub fn stake_agent_handler(ctx: Context<StakeAgent>) -> Result<()> {
    let global_pool = &mut ctx.accounts.global_pool;

    // Add the FreezeDelegate plugin (frozen=true) so the asset is non-transferable
    // while staked. The asset itself never leaves the owner's wallet.
    AddPluginV1CpiBuilder::new(&ctx.accounts.core_program.to_account_info())
        .asset(&ctx.accounts.asset.to_account_info())
        .collection(Some(&ctx.accounts.collection.to_account_info()))
        .payer(&ctx.accounts.user.to_account_info())
        .system_program(&ctx.accounts.system_program.to_account_info())
        .plugin(Plugin::FreezeDelegate(FreezeDelegate { frozen: true }))
        .invoke()?;

    global_pool.total_agents_staked = global_pool
        .total_agents_staked
        .checked_add(1)
        .ok_or(StakingError::CounterOverflow)?;

    Ok(())
}
