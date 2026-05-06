use crate::*;
use mpl_core::{
    ID as CORE_PROGRAM_ID,
    accounts::{ BaseAssetV1, BaseCollectionV1 },
    instructions::AddPluginV1CpiBuilder,
    types::{ FreezeDelegate, Key as CoreKey, Plugin, UpdateAuthority },
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

    /// The Metaplex Core agent asset to stake. Deserialized in the handler to
    /// avoid exporting Metaplex Core account types into this program's IDL.
    #[account(
        mut,
        owner = CORE_PROGRAM_ID @ StakingError::InvalidMetadata,
    )]
    /// CHECK: owner and decoded contents are validated in the handler.
    pub asset: UncheckedAccount<'info>,

    #[account(
        mut,
        owner = CORE_PROGRAM_ID @ StakingError::InvalidCollection,
    )]
    /// CHECK: owner and decoded contents are validated in the handler.
    pub collection: UncheckedAccount<'info>,

    #[account(address = CORE_PROGRAM_ID)]
    /// CHECK: pinned by address constraint; CPI'd into directly.
    pub core_program: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

pub fn stake_agent_handler(ctx: Context<StakeAgent>) -> Result<()> {
    let global_pool = &mut ctx.accounts.global_pool;
    let asset = BaseAssetV1::try_from(&ctx.accounts.asset.to_account_info())
        .map_err(|_| error!(StakingError::InvalidMetadata))?;
    let collection = BaseCollectionV1::try_from(&ctx.accounts.collection.to_account_info())
        .map_err(|_| error!(StakingError::InvalidCollection))?;

    require!(asset.key == CoreKey::AssetV1, StakingError::InvalidMetadata);
    require!(collection.key == CoreKey::CollectionV1, StakingError::InvalidCollection);
    require!(
        asset.owner.eq(&ctx.accounts.owner.key()),
        StakingError::InvalidOwner
    );
    require!(
        asset.update_authority == UpdateAuthority::Collection(ctx.accounts.collection.key()),
        StakingError::InvalidCollection
    );

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
