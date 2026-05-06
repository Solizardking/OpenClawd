use anchor_lang::{ prelude::*, AnchorDeserialize };

pub mod constant;
pub mod error;
pub mod instructions;
pub mod state;
use constant::*;
use error::*;
use instructions::*;
use state::*;

declare_id!("Fg6PaFpoGXkYsidMpWxTWqz4iyToFhRmD31x9WfP3YpR");

#[program]
pub mod openclawd_agent_staking {
    use super::*;

    /**
     * Initialize the global staking authority for OpenClawd agent assets.
     */
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        initialize::initialize_handler(ctx)
    }

    /**
     * User can lock a Metaplex Core agent asset from the configured collection.
     */
    pub fn lock_corenft(ctx: Context<LockCoreNFT>) -> Result<()> {
        lock_corenft::lock_corenft_handler(ctx)
    }

    /**
     * User or admin can unlock a Metaplex Core agent asset.
     */
    pub fn unlock_corenft(ctx: Context<UnlockCoreNFT>) -> Result<()> {
        unlock_corenft::unlock_corenft_handler(ctx)
    }
}
