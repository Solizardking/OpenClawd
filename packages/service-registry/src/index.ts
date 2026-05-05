// OpenClawd service registry — canonical hostnames, ports, and health endpoints
// for every long-running local service in the monorepo. Importers should call
// `discover(name)` instead of hard-coding `http://localhost:18790` etc.; that
// way a single env override (or future remote config) reaches every consumer.

export type ServiceName =
  | 'gateway'
  | 'clawdrouter'
  | 'walletApi'
  | 'mawdaxe'
  | 'mcpBridge'
  | 'browserMcp'
  | 'clawdhub'
  | 'attestationAgent'
  | 'hermesVault'
  | 'pumpScannerCron'

export interface ServiceConfig {
  name: ServiceName
  host: string
  port: number
  url: string
  healthPath: string
  envOverride: string
}

const env = (key: string): string | undefined => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key]
  }
  return undefined
}

const defaults: Record<ServiceName, Omit<ServiceConfig, 'name' | 'url'>> = {
  gateway:          { host: '127.0.0.1', port: 18790, healthPath: '/healthz', envOverride: 'OPENCLAWD_GATEWAY_URL' },
  clawdrouter:      { host: '127.0.0.1', port: 4000,  healthPath: '/healthz', envOverride: 'CLAWDROUTER_URL' },
  walletApi:        { host: '127.0.0.1', port: 8421,  healthPath: '/health',  envOverride: 'OPENCLAWD_WALLET_API_URL' },
  mawdaxe:          { host: '127.0.0.1', port: 8420,  healthPath: '/health',  envOverride: 'OPENCLAWD_MAWDAXE_URL' },
  mcpBridge:        { host: '127.0.0.1', port: 3001,  healthPath: '/healthz', envOverride: 'OPENCLAWD_MCP_URL' },
  browserMcp:       { host: '127.0.0.1', port: 38401, healthPath: '/healthz', envOverride: 'OPENCLAWD_BROWSER_MCP_URL' },
  clawdhub:         { host: '127.0.0.1', port: 3000,  healthPath: '/api/health', envOverride: 'CLAWDHUB_URL' },
  attestationAgent: { host: '127.0.0.1', port: 8430,  healthPath: '/health',  envOverride: 'OPENCLAWD_ATTESTATION_URL' },
  hermesVault:      { host: '127.0.0.1', port: 8431,  healthPath: '/health',  envOverride: 'OPENCLAWD_HERMES_VAULT_URL' },
  pumpScannerCron:  { host: '127.0.0.1', port: 8432,  healthPath: '/health',  envOverride: 'OPENCLAWD_PUMP_SCANNER_URL' },
}

const buildUrl = (host: string, port: number): string => `http://${host}:${port}`

const parseOverride = (raw: string, fallback: { host: string; port: number }): { host: string; port: number } => {
  try {
    const u = new URL(raw)
    return {
      host: u.hostname || fallback.host,
      port: u.port ? Number(u.port) : fallback.port,
    }
  } catch {
    return fallback
  }
}

export const discover = (name: ServiceName): ServiceConfig => {
  const def = defaults[name]
  const override = env(def.envOverride)
  const { host, port } = override ? parseOverride(override, def) : { host: def.host, port: def.port }
  return {
    name,
    host,
    port,
    url: buildUrl(host, port),
    healthPath: def.healthPath,
    envOverride: def.envOverride,
  }
}

export const SERVICES: Record<ServiceName, ServiceConfig> = (Object.keys(defaults) as ServiceName[]).reduce(
  (acc, name) => {
    acc[name] = discover(name)
    return acc
  },
  {} as Record<ServiceName, ServiceConfig>,
)

export interface HealthResult {
  name: ServiceName
  ok: boolean
  status?: number
  latencyMs: number
  error?: string
}

export const health = async (name: ServiceName, timeoutMs = 1500): Promise<HealthResult> => {
  const cfg = discover(name)
  const target = cfg.url + cfg.healthPath
  const started = Date.now()
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(target, { signal: ctrl.signal })
    return {
      name,
      ok: res.ok,
      status: res.status,
      latencyMs: Date.now() - started,
    }
  } catch (e) {
    return {
      name,
      ok: false,
      latencyMs: Date.now() - started,
      error: e instanceof Error ? e.message : String(e),
    }
  } finally {
    clearTimeout(timer)
  }
}

export const healthAll = async (): Promise<HealthResult[]> =>
  Promise.all((Object.keys(defaults) as ServiceName[]).map((n) => health(n)))
