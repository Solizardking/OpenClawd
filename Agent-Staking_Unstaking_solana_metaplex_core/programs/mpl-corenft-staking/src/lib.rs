use anchor_lang::{ prelude::*, AnchorDeserialize };

pub mod constant;
pub mod error;
pub mod instructions;
pub mod state;
use constant::*;
use error::*;
use instructions::*;
use state::*;

// Placeholder program ID. Replaced post-`anchor build` via `anchor keys sync`
// (which writes the real keypair-derived ID into both this declare_id! and Anchor.toml).
declare_id!("Fg6PaFpoGXkYsidMpWxTWqz4iyToFhRmD31x9WfP3YpR");

#[program]
pub mod openclawd_agent_staking {
    use super::*;

    /// Initialize the global staking authority for OpenClawd agent assets.
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        initialize::initialize_handler(ctx)
    }

    /// Stake an OpenClawd agent NFT (Metaplex Core asset) by adding a FreezeDelegate
    /// plugin. The asset stays in the owner's wallet but becomes non-transferable
    /// for the duration of the stake.
    pub fn stake_agent(ctx: Context<StakeAgent>) -> Result<()> {
        stake_agent::stake_agent_handler(ctx)
    }

    /// Unstake an agent NFT. The owner can always unstake; the configured program
    /// admin can also unstake any asset for emergency recovery. Removes the
    /// FreezeDelegate plugin entirely, restoring full transferability.
    pub fn unstake_agent(ctx: Context<UnstakeAgent>) -> Result<()> {
        unstake_agent::unstake_agent_handler(ctx)
    }
}
