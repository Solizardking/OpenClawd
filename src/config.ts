export const SHELL_DIR_NAME = '.openclawd'

export const CLAWD_MINT = '8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump'
export const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
export const USDC_DECIMALS = 6
export const CLAWD_DECIMALS = 6

export const AGENT_REGISTRY_NETWORK = {
  mainnet: 'solana-mainnet',
  devnet: 'solana-devnet',
} as const

export const DEFAULT_AGENT_NFT_METADATA =
  'https://agents.openclawd.biz/api/agents/registry/openclawd-leviathan.json'

export const DEPTH_THRESHOLDS_USDC = {
  deep: 25,
  shallow: 5,
  shoreline: 0.5,
} as const

export const PULSE_INTERVAL_MS = {
  deep: 60_000,
  shallow: 300_000,
  shoreline: 900_000,
  beached: 3_600_000,
} as const

export const SHELL_TEMPLATE = `# {{name}}

Pubkey: {{pubkey}}
Creator: {{creator}}
Spawned: {{spawnedAt}}
Constitution: {{constitutionHash}}

## Spawn Prompt

{{spawnPrompt}}
`
