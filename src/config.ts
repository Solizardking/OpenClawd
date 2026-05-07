export const SHELL_DIR_NAME = '.openclawd'

export const OPENCLAWD_SITE_NAME = 'OpenClawd'
export const OPENCLAWD_SITE_URL = normalizeBaseUrl(
  process.env.OPENCLAWD_SITE_URL ??
    process.env.OPENROUTER_SITE_URL ??
    'https://solanaclawd.com',
)
export const OPENCLAWD_BACKEND_URL = normalizeBaseUrl(
  process.env.OPENCLAWD_BACKEND_URL ??
    process.env.OPENCLAWD_GATEWAY_URL ??
    OPENCLAWD_SITE_URL,
)
export const OPENCLAWD_AGENT_API_URL = normalizeBaseUrl(
  process.env.OPENCLAWD_AGENT_API_URL ?? 'https://agents.openclawd.biz',
)

export const CLAWD_MINT = '8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump'
export const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
export const USDC_DECIMALS = 6
export const CLAWD_DECIMALS = 6

export const AGENT_REGISTRY_NETWORK = {
  mainnet: 'solana-mainnet',
  devnet: 'solana-devnet',
} as const

export const DEFAULT_AGENT_NFT_METADATA =
  `${OPENCLAWD_AGENT_API_URL}/api/agents/registry/openclawd-leviathan.json`

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

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '')
}
