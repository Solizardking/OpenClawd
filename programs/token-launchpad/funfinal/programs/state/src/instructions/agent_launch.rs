use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use solana_program::{program::invoke, system_program};
use crate::{
    state::{AgentConfig, EnhancedBondingCurve, Vesting}, 
    utils::pumpfun_integration::{MPL_TOKEN_METADATA_PROGRAM_ID, PumpFunLaunchType}
};
use anchor_spl::metadata::{create_metadata_accounts_v3, mpl_token_metadata::types::DataV2, Metadata, CreateMetadataAccountsV3};

/// Account structure for AI agent launches
#[account]
#[derive(InitSpace)]
pub struct AgentLaunch {
    pub creator: Pubkey,                  // The creator of the agent
    pub token_mint: Pubkey,               // The token mint address
    pub agent_type: u8,                   // Type of agent deployed
    pub agent_name: String,               // Name of the agent
    pub token_name: String,               // Name of the token
    pub launch_timestamp: i64,            // When the token was launched
    pub dna_hash: [u8; 32],               // Hash of the agent's DNA
    pub bump: u8,                         // Bump seed for PDA derivation
}

impl AgentLaunch {
    pub const SEED_PREFIX: &'static [u8; 13] = b"agent-launch-";
}

#[derive(Accounts)]
pub struct LaunchTokenWithAgent<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    
    #[account(
        init,
        payer = creator,
        space = 8 + AgentLaunch::INIT_SPACE,
        seeds = [AgentLaunch::SEED_PREFIX, creator.key().as_ref()],
        bump
    )]
    pub agent_launch: Account<'info, AgentLaunch>,
    
    #[account(
        init,
        payer = creator,
        space = 8 + AgentConfig::INIT_SPACE,
        seeds = [AgentConfig::SEED_PREFIX, creator.key().as_ref()],
        bump
    )]
    pub agent_config: Account<'info, AgentConfig>,
    
    // Token mint that will be created
    pub token_mint: Account<'info, Mint>,
    
    // Bonding curve account (conditionally initialized based on launch type)
    #[account(
        init_if_needed,
        payer = creator,
        space = 8 + EnhancedBondingCurve::INIT_SPACE,
        seeds = [EnhancedBondingCurve::SEED_PREFIX, token_mint.key().as_ref()],
        bump
    )]
    pub curve: Account<'info, EnhancedBondingCurve>,
    
    // Token account for the bonding curve (where tokens will be minted)
    #[account(mut)]
    pub curve_token_account: Account<'info, TokenAccount>,
    
    /// CHECK: Metadata account, validated in instruction
    #[account(mut)]
    pub metadata: UncheckedAccount<'info>,
    
    /// CHECK: Metadata program ID
    #[account(address = MPL_TOKEN_METADATA_PROGRAM_ID)]
    pub metadata_program: UncheckedAccount<'info>,
    
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

// Context for linking an existing agent to a token
#[derive(Accounts)]
pub struct LinkAgentToToken<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        mut,
        seeds = [AgentConfig::SEED_PREFIX, authority.key().as_ref()],
        bump = agent_config.bump,
        constraint = agent_config.creator == authority.key() @ AgentError::Unauthorized,
    )]
    pub agent_config: Account<'info, AgentConfig>,
    
    // Token mint to be linked
    pub token_mint: Account<'info, Mint>,
    
    pub system_program: Program<'info, System>,
}

// Instruction implementations
pub fn launch_token_with_agent(
    ctx: Context<LaunchTokenWithAgent>,
    name: String,
    symbol: String,
    uri: String,
    agent_name: String,
    agent_type: u8,
    personality: u8,
    capabilities: Vec<String>,
    complexity: u8,
    api_access: bool,
    dna_hash: [u8; 32],
    initial_price: u64,
    slope: u64,
    curve_type: u8,
    launch_type: u8, // 0 = Bonding Curve, 1 = PumpFun, 2 = FunPump
) -> Result<()> {
    // Initialize agent launch account
    let agent_launch = &mut ctx.accounts.agent_launch;
    agent_launch.creator = ctx.accounts.creator.key();
    agent_launch.token_mint = ctx.accounts.token_mint.key();
    agent_launch.agent_type = agent_type;
    agent_launch.agent_name = agent_name.clone();
    agent_launch.token_name = name.clone();
    agent_launch.launch_timestamp = Clock::get()?.unix_timestamp;
    agent_launch.dna_hash = dna_hash;
    agent_launch.bump = ctx.bumps.agent_launch;
    
    // Initialize agent config
    let agent_config = &mut ctx.accounts.agent_config;
    agent_config.name = agent_name.clone();
    agent_config.agent_type = agent_type;
    agent_config.personality = personality;
    agent_config.capabilities = capabilities;
    agent_config.complexity = complexity;
    agent_config.api_access = api_access;
    agent_config.dna_hash = dna_hash;
    agent_config.creator = ctx.accounts.creator.key();
    agent_config.token_mint = Some(ctx.accounts.token_mint.key());
    agent_config.creation_timestamp = Clock::get()?.unix_timestamp;
    agent_config.bump = ctx.bumps.agent_config;

    // If bonding curve launch or FunPump, initialize the curve
    if launch_type == PumpFunLaunchType::BondingCurve as u8 || launch_type == 2 /* FunPump */ {
        let curve = &mut ctx.accounts.curve;
        curve.authority = ctx.accounts.creator.key();
        curve.token_mint = ctx.accounts.token_mint.key();
        curve.initial_price = initial_price;
        curve.slope = slope;
        curve.curve_type = curve_type;
        curve.total_supply = 0;
        curve.treasury_balance = 0;
        curve.virtual_sol_reserves = 1_000_000; // Default virtual reserves
        curve.virtual_token_reserves = 1_000_000_000; // Default virtual reserves
        curve.real_sol_reserves = 0;
        curve.real_token_reserves = 0;
        curve.is_complete = false;
        curve.launch_timestamp = Clock::get()?.unix_timestamp;
        curve.bump = ctx.bumps.curve;
    }

    // Set Token Metadata
    let token_data = DataV2 {
        name: name.clone(),
        symbol: symbol.clone(),
        uri: uri.clone(),
        seller_fee_basis_points: 0,
        creators: None,
        collection: None,
        uses: None,
    };

    // Create metadata accounts
    let metadata_infos = vec![
        ctx.accounts.metadata_program.to_account_info(),
        ctx.accounts.metadata.to_account_info(),
        ctx.accounts.token_mint.to_account_info(),
        ctx.accounts.creator.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        ctx.accounts.rent.to_account_info(),
    ];

    let metadata_ctx = CpiContext::new(
        ctx.accounts.metadata_program.to_account_info(),
        CreateMetadataAccountsV3 {
            metadata: ctx.accounts.metadata.to_account_info(),
            mint: ctx.accounts.token_mint.to_account_info(),
            mint_authority: ctx.accounts.creator.to_account_info(),
            payer: ctx.accounts.creator.to_account_info(),
            update_authority: ctx.accounts.creator.to_account_info(),
            system_program: ctx.accounts.system_program.to_account_info(),
            rent: ctx.accounts.rent.to_account_info(),
        },
    );

    create_metadata_accounts_v3(metadata_ctx, token_data, true, true, None)?;

    // Emit the appropriate event based on launch type
    match launch_type {
        0 => { // Bonding Curve
            emit!(AgentBondingCurveLaunchEvent {
                creator: ctx.accounts.creator.key(),
                token_mint: ctx.accounts.token_mint.key(),
                agent_name: agent_name.clone(),
                token_name: name.clone(),
                token_symbol: symbol.clone(),
                agent_type,
                timestamp: Clock::get()?.unix_timestamp,
            });
        },
        1 => { // PumpFun
            emit!(AgentPumpFunLaunchEvent {
                creator: ctx.accounts.creator.key(),
                token_mint: ctx.accounts.token_mint.key(),
                agent_name: agent_name.clone(),
                token_name: name.clone(),
                token_symbol: symbol.clone(),
                agent_type,
                timestamp: Clock::get()?.unix_timestamp,
            });
        },
        2 => { // FunPump
            emit!(AgentFunPumpLaunchEvent {
                creator: ctx.accounts.creator.key(),
                token_mint: ctx.accounts.token_mint.key(),
                agent_name: agent_name.clone(),
                token_name: name.clone(),
                token_symbol: symbol.clone(),
                agent_type,
                timestamp: Clock::get()?.unix_timestamp,
            });
        },
        _ => {
            return err!(AgentError::InvalidLaunchType);
        }
    }

    Ok(())
}

pub fn link_agent_to_token(
    ctx: Context<LinkAgentToToken>,
    token_mint: Pubkey,
) -> Result<()> {
    let agent_config = &mut ctx.accounts.agent_config;
    
    // Update agent with token mint
    agent_config.token_mint = Some(token_mint);
    
    emit!(AgentLinkedEvent {
        agent_name: agent_config.name.clone(),
        token_mint,
        agent_type: agent_config.agent_type,
        creator: agent_config.creator,
        timestamp: Clock::get()?.unix_timestamp,
    });
    
    Ok(())
}

// Events 
#[event]
pub struct AgentBondingCurveLaunchEvent {
    pub creator: Pubkey,
    pub token_mint: Pubkey,
    pub agent_name: String,
    pub token_name: String,
    pub token_symbol: String,
    pub agent_type: u8,
    pub timestamp: i64,
}

#[event]
pub struct AgentPumpFunLaunchEvent {
    pub creator: Pubkey,
    pub token_mint: Pubkey,
    pub agent_name: String,
    pub token_name: String,
    pub token_symbol: String,
    pub agent_type: u8,
    pub timestamp: i64,
}

#[event]
pub struct AgentFunPumpLaunchEvent {
    pub creator: Pubkey,
    pub token_mint: Pubkey,
    pub agent_name: String,
    pub token_name: String,
    pub token_symbol: String,
    pub agent_type: u8,
    pub timestamp: i64,
}

#[event]
pub struct AgentLinkedEvent {
    pub agent_name: String,
    pub token_mint: Pubkey,
    pub agent_type: u8,
    pub creator: Pubkey,
    pub timestamp: i64,
}

#[error_code]
pub enum AgentError {
    #[msg("Unauthorized access to agent account")]
    Unauthorized,
    
    #[msg("Invalid agent type")]
    InvalidAgentType,
    
    #[msg("Invalid launch type")]
    InvalidLaunchType,
    
    #[msg("Agent already linked to token")]
    AlreadyLinked,
}