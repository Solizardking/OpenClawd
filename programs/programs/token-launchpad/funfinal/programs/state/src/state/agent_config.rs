use anchor_lang::prelude::*;

/// Represents the type of AI agent associated with the token
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum AgentType {
    Oracle = 0,       // Market data and price prediction
    Creator = 1,      // Content generation and social media
    Analyst = 2,      // Technical analysis and reporting
    Community = 3,    // Community management and engagement
    Trader = 4,       // Automated trading strategies
    Custom = 5,       // Custom agent with specific instructions
}

/// Represents the personality traits of the AI agent
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum AgentPersonality {
    Professional = 0,
    Friendly = 1,
    Witty = 2,
    Technical = 3,
    Creative = 4,
}

/// Configuration for an AI agent linked to a token
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, InitSpace)]
pub struct AgentConfig {
    pub name: String,                   // Name of the agent
    pub agent_type: u8,                 // Type of agent (using AgentType enum values)
    pub personality: u8,                // Personality traits (using AgentPersonality enum)
    pub capabilities: Vec<String>,      // List of capabilities this agent has
    pub complexity: u8,                 // Complexity level 1-10
    pub api_access: bool,               // Whether the agent has API access
    pub dna_hash: [u8; 32],             // Unique DNA hash identifying this agent
    pub api_key_hash: Option<[u8; 32]>, // Optional hash of the API key
    pub creator: Pubkey,                // Creator of this agent
    pub token_mint: Option<Pubkey>,     // Associated token mint (if any)
    pub creation_timestamp: i64,        // When the agent was created
    pub bump: u8,                       // PDA bump
}

impl AgentConfig {
    pub const SEED_PREFIX: &'static [u8; 6] = b"agent-";
    
    /// Gets a string representation of the agent type
    pub fn get_agent_type_string(&self) -> &'static str {
        match self.agent_type {
            0 => "Oracle",
            1 => "Creator",
            2 => "Analyst",
            3 => "Community",
            4 => "Trader",
            5 => "Custom",
            _ => "Unknown",
        }
    }
    
    /// Gets a string representation of the agent personality
    pub fn get_personality_string(&self) -> &'static str {
        match self.personality {
            0 => "Professional",
            1 => "Friendly",
            2 => "Witty",
            3 => "Technical",
            4 => "Creative",
            _ => "Unknown",
        }
    }
}