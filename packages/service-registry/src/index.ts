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
  | 'apiRegistrar'
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
  /** Service-specific env var that overrides only the port (kept for back-compat with each service's existing knob). */
  portEnvOverride?: string
}

const env = (key: string): string | undefined => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key]
  }
  return undefined
}

// Defaults match what each service actually defaults to today (audited against
// gateway/src/http.ts, clawdrouter/src/index.ts, services/agent-wallet/api.go,
// chrome-extension/mcp/src/index.js, etc.). Updating these without updating
// the matching service constant will silently desync the registry from reality.
const defaults: Record<ServiceName, Omit<ServiceConfig, 'name' | 'url'>> = {
  gateway:          { host: '127.0.0.1', port: 8788,  healthPath: '/healthz',     envOverride: 'OPENCLAWD_GATEWAY_URL',     portEnvOverride: 'GATEWAY_HTTP_PORT' },
  clawdrouter:      { host: '127.0.0.1', port: 8402,  healthPath: '/healthz',     envOverride: 'CLAWDROUTER_URL',           portEnvOverride: 'CLAWDROUTER_PORT' },
  walletApi:        { host: '127.0.0.1', port: 3000,  healthPath: '/healthz',     envOverride: 'OPENCLAWD_WALLET_API_URL',  portEnvOverride: 'WALLET_API_PORT' },
  mawdaxe:          { host: '127.0.0.1', port: 8420,  healthPath: '/health',      envOverride: 'OPENCLAWD_MAWDAXE_URL' },
  mcpBridge:        { host: '127.0.0.1', port: 3001,  healthPath: '/health',      envOverride: 'OPENCLAWD_MCP_URL',         portEnvOverride: 'OPENCLAWD_MCP_PORT' },
  browserMcp:       { host: '127.0.0.1', port: 38401, healthPath: '/healthz',     envOverride: 'OPENCLAWD_BROWSER_MCP_URL', portEnvOverride: 'PORT' },
  apiRegistrar:     { host: '127.0.0.1', port: 3001,  healthPath: '/health',      envOverride: 'OPENCLAWD_REGISTRAR_URL',   portEnvOverride: 'API_REGISTRAR_PORT' },
  clawdhub:         { host: '127.0.0.1', port: 5173,  healthPath: '/api/health',  envOverride: 'CLAWDHUB_URL' },
  attestationAgent: { host: '127.0.0.1', port: 8430,  healthPath: '/health',      envOverride: 'OPENCLAWD_ATTESTATION_URL' },
  hermesVault:      { host: '127.0.0.1', port: 8431,  healthPath: '/health',      envOverride: 'OPENCLAWD_HERMES_VAULT_URL' },
  pumpScannerCron:  { host: '127.0.0.1', port: 8432,  healthPath: '/health',      envOverride: 'OPENCLAWD_PUMP_SCANNER_URL' },
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
  const urlOverride = env(def.envOverride)
  let host = def.host
  let port = def.port

  if (urlOverride) {
    const parsed = parseOverride(urlOverride, def)
    host = parsed.host
    port = parsed.port
  }

  // Port-only override (kept for compat with each service's existing knob —
  // GATEWAY_HTTP_PORT, CLAWDROUTER_PORT, etc.). Applied after the URL override
  // so an explicit URL still wins.
  if (!urlOverride && def.portEnvOverride) {
    const portOverride = env(def.portEnvOverride)
    if (portOverride && /^\d+$/.test(portOverride)) {
      port = Number(portOverride)
    }
  }

  return {
    name,
    host,
    port,
    url: buildUrl(host, port),
    healthPath: def.healthPath,
    envOverride: def.envOverride,
    portEnvOverride: def.portEnvOverride,
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
