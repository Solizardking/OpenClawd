import {
  CLAWD_MINT,
  OPENCLAWD_AGENT_API_URL,
  OPENCLAWD_BACKEND_URL,
  OPENCLAWD_SITE_NAME,
  OPENCLAWD_SITE_URL,
} from '../config.js'

export {
  OPENCLAWD_AGENT_API_URL,
  OPENCLAWD_BACKEND_URL,
  OPENCLAWD_SITE_NAME,
  OPENCLAWD_SITE_URL,
}

export const OPENCLAWD_ROUTE_PATHS = {
  home: '/',
  vault: '/vault',
  chat: '/chat',
  agents: '/agents',
  trading: '/trading',
  dex: '/dex',
  wallet: '/wallet',
  staking: '/staking',
  mining: '/mining',
  settings: '/settings',
  docs: '/docs',
} as const

export type OpenClawdRoute = keyof typeof OPENCLAWD_ROUTE_PATHS

export type OpenClawdCapability = {
  key: string
  route: OpenClawdRoute
  backendPath: string
  description: string
}

export const OPENCLAWD_CAPABILITIES: readonly OpenClawdCapability[] = [
  {
    key: 'vault',
    route: 'vault',
    backendPath: '/api/vault',
    description: 'Encrypted notes, secrets, agent memory, and holder workspace storage.',
  },
  {
    key: 'voice',
    route: 'chat',
    backendPath: '/api/voice',
    description: 'Speech input/output for hands-free agent sessions.',
  },
  {
    key: 'vim',
    route: 'chat',
    backendPath: '/api/editor/vim',
    description: 'Keyboard-first editing controls wired into Clawd sessions.',
  },
  {
    key: 'tools',
    route: 'agents',
    backendPath: '/api/tools',
    description: 'Trading, wallet, filesystem, and hardware tools exposed to agents.',
  },
  {
    key: 'trading',
    route: 'trading',
    backendPath: '/api/trading',
    description: 'Jupiter, Helius, Birdeye, Pump.fun, and risk-managed execution surfaces.',
  },
  {
    key: 'staking',
    route: 'staking',
    backendPath: '/api/staking',
    description: 'CLAWD holder and staking state for gated access.',
  },
  {
    key: 'mining',
    route: 'mining',
    backendPath: '/api/mining',
    description: 'Bitaxe and hardware telemetry for the OpenClawd operations console.',
  },
] as const

export const OPENCLAWD_TOKEN = {
  symbol: 'CLAWD',
  mint: CLAWD_MINT,
  decimals: 6,
} as const

export function getOpenClawdRouteUrl(route: OpenClawdRoute): string {
  return `${OPENCLAWD_SITE_URL}${OPENCLAWD_ROUTE_PATHS[route]}`
}

export function getOpenClawdBackendUrl(path: string): string {
  return `${OPENCLAWD_BACKEND_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export function getOpenClawdCapabilityMap(): Record<string, OpenClawdCapability> {
  return Object.fromEntries(OPENCLAWD_CAPABILITIES.map((capability) => [capability.key, capability]))
}
