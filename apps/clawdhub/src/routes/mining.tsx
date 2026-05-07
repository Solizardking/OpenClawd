import { createFileRoute } from '@tanstack/react-router'
import { ArrowLeft, Cpu, RefreshCw, Settings, Wifi, WifiOff, Zap } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

export const Route = createFileRoute('/mining')({
  component: MiningDashboard,
})

// ─── Types ───────────────────────────────────────────────────
type DeviceHealth = 'healthy' | 'warning' | 'critical' | 'offline'
type PetStage = 'egg' | 'larva' | 'juvenile' | 'adult' | 'alpha' | 'ghost'
type PetMood = 'ecstatic' | 'happy' | 'neutral' | 'anxious' | 'sad' | 'hot'

type MiningDevice = {
  id: string
  ip: string
  source: 'mawdaxe' | 'axeos' | 'demo'
  state: string
  health: DeviceHealth
  hashRate: number
  temp: number
  power: number
  shares: number
  rejected: number
  uptime: number
  fanSpeed: number
  freq: number
  voltage?: number
  pool?: string
  version?: string
  pet: { stage: PetStage; mood: PetMood; moodScore: number; name: string; totalShares: number; feedCount: number }
}

type FleetStats = {
  total: number
  online: number
  hashRate: number
  avgTemp: number
  totalPower: number
  totalShares: number
}

const STAGE_EMOJI: Record<PetStage, string> = { egg: '🥚', larva: '🦐', juvenile: '🦞', adult: '🦞', alpha: '👑', ghost: '💀' }
const MOOD_COLORS: Record<PetMood, string> = { ecstatic: '#00ffc8', happy: '#00ff40', neutral: '#888', anxious: '#ffc800', sad: '#4488ff', hot: '#ff2200' }
const HEALTH_COLORS: Record<DeviceHealth, string> = { healthy: '#00ff40', warning: '#ffc800', critical: '#ff2200', offline: '#555' }

// ─── Simulated data (replaced by real API when gateway connected) ─────
function generateDevice(idx: number): MiningDevice {
  const hr = 580 + Math.random() * 80
  const temp = 45 + Math.random() * 20
  const shares = Math.floor(Math.random() * 300)
  const rejected = Math.floor(Math.random() * 8)
  const stage: PetStage = shares > 200 ? 'alpha' : shares > 50 ? 'adult' : shares > 10 ? 'juvenile' : shares > 0 ? 'larva' : 'egg'
  const moodIdx = temp > 68 ? 5 : temp > 60 ? 3 : hr > 620 ? 0 : 1
  const moods: PetMood[] = ['ecstatic', 'happy', 'neutral', 'anxious', 'sad', 'hot']
  return {
    id: `mawdaxe-${String(idx + 1).padStart(3, '0')}`,
    ip: `192.168.1.${42 + idx}`,
    source: 'demo',
    state: 'running',
    health: temp > 70 ? 'critical' : temp > 62 ? 'warning' : 'healthy',
    hashRate: hr, temp, power: 15 + Math.random() * 3, shares, rejected,
    uptime: 2 + Math.random() * 48,
    fanSpeed: Math.floor(40 + Math.random() * 60),
    freq: 525 + Math.floor(Math.random() * 75),
    pet: { stage, mood: moods[moodIdx], moodScore: 1 - (moodIdx / 5) * 2, name: `MawdPet-${String(idx + 1).padStart(3, '0')}`, totalShares: shares, feedCount: shares * 12 },
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function numberFrom(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

function stringFrom(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return fallback
}

function pickDeep(record: Record<string, unknown>, keys: string[]): unknown {
  const lowerKeys = new Set(keys.map((key) => key.toLowerCase()))
  const queue: unknown[] = [record]
  while (queue.length) {
    const current = queue.shift()
    if (!isRecord(current)) continue
    for (const [key, value] of Object.entries(current)) {
      if (lowerKeys.has(key.toLowerCase())) return value
      if (isRecord(value)) queue.push(value)
    }
  }
  return undefined
}

function normalizeHashRate(value: number): number {
  if (value > 1_000_000_000) return value / 1_000_000_000
  if (value > 1_000_000) return value / 1_000_000
  if (value > 10_000) return value / 1_000
  return value
}

function devicePersonality(device: {
  hashRate: number
  temp: number
  shares: number
  rejected: number
  id: string
}): MiningDevice['pet'] {
  const stage: PetStage = device.shares > 200 ? 'alpha' : device.shares > 50 ? 'adult' : device.shares > 10 ? 'juvenile' : device.shares > 0 ? 'larva' : 'egg'
  const mood: PetMood = device.temp > 68 ? 'hot' : device.temp > 60 ? 'anxious' : device.hashRate > 620 ? 'ecstatic' : device.rejected > 5 ? 'sad' : 'happy'
  const moodScore = mood === 'ecstatic' ? 1 : mood === 'happy' ? 0.65 : mood === 'anxious' ? -0.25 : mood === 'hot' ? -0.85 : mood === 'sad' ? -0.65 : 0
  return {
    stage,
    mood,
    moodScore,
    name: `MawdPet-${device.id.replace(/[^A-Za-z0-9]/g, '').slice(-6) || 'Axe'}`,
    totalShares: device.shares,
    feedCount: device.shares * 12,
  }
}

function normalizeMawdAxeDevice(input: unknown): MiningDevice | null {
  if (!isRecord(input)) return null
  const id = stringFrom(input.id ?? input.name ?? input.hostname, 'mawdaxe')
  const shares = numberFrom(input.shares)
  const rejected = numberFrom(input.rejected)
  const hashRate = numberFrom(input.hashRate)
  const temp = numberFrom(input.temp)
  return {
    id,
    ip: stringFrom(input.ip ?? input.host, ''),
    source: 'mawdaxe',
    state: stringFrom(input.state, 'running'),
    health: stringFrom(input.health, temp > 70 ? 'critical' : temp > 62 ? 'warning' : 'healthy') as DeviceHealth,
    hashRate,
    temp,
    power: numberFrom(input.power),
    shares,
    rejected,
    uptime: numberFrom(input.uptime),
    fanSpeed: numberFrom(input.fanSpeed),
    freq: numberFrom(input.freq),
    pet: isRecord(input.pet) ? input.pet as MiningDevice['pet'] : devicePersonality({ id, hashRate, temp, shares, rejected }),
  }
}

function normalizeAxeOSDevice(host: string, info: Record<string, unknown>, dashboard: Record<string, unknown>, asic: Record<string, unknown>): MiningDevice {
  const hostname = stringFrom(pickDeep(info, ['hostname', 'hostName', 'deviceName', 'name']), 'bitaxe')
  const model = stringFrom(pickDeep(info, ['ASICModel', 'asicModel', 'deviceModel', 'model']), 'Bitaxe')
  const hashRate = normalizeHashRate(numberFrom(pickDeep(dashboard, ['hashRate', 'hashrate', 'currentHashrate', 'hashRateGHs', 'hashRateGH'])))
  const temp = numberFrom(pickDeep(dashboard, ['temp', 'temperature', 'asicTemp', 'vrTemp']))
  const shares = numberFrom(pickDeep(dashboard, ['sharesAccepted', 'acceptedShares', 'shares', 'bestDiff']))
  const rejected = numberFrom(pickDeep(dashboard, ['sharesRejected', 'rejectedShares', 'rejected']))
  const power = numberFrom(pickDeep(dashboard, ['power', 'powerW', 'watts']), numberFrom(pickDeep(asic, ['power', 'powerW', 'watts'])))
  const fanSpeed = numberFrom(pickDeep(dashboard, ['fanspeed', 'fanSpeed', 'fanrpm', 'fanRpm']))
  const freq = numberFrom(pickDeep(asic, ['frequency', 'freq', 'frequencyMHz']), numberFrom(pickDeep(dashboard, ['frequency', 'freq'])))
  const state = stringFrom(pickDeep(dashboard, ['state', 'miningState', 'status']), hashRate > 0 ? 'mining' : 'idle')
  const id = `${model}-${hostname}`.replace(/\s+/g, '-').toLowerCase()
  return {
    id,
    ip: host.replace(/^https?:\/\//, ''),
    source: 'axeos',
    state,
    health: temp > 72 ? 'critical' : temp > 65 ? 'warning' : hashRate > 0 ? 'healthy' : 'offline',
    hashRate,
    temp,
    power,
    shares,
    rejected,
    uptime: numberFrom(pickDeep(dashboard, ['uptime', 'uptimeSeconds'])) / 3600,
    fanSpeed,
    freq,
    voltage: numberFrom(pickDeep(asic, ['coreVoltage', 'voltage', 'asicVoltage'])),
    pool: stringFrom(pickDeep(info, ['stratumURL', 'stratumHost', 'poolUrl', 'pool'])),
    version: stringFrom(pickDeep(info, ['version', 'firmwareVersion', 'espMinerVersion'])),
    pet: devicePersonality({ id, hashRate, temp, shares, rejected }),
  }
}

function computeFleetStats(devices: MiningDevice[]): FleetStats {
  return {
    total: devices.length,
    online: devices.filter((d) => d.health !== 'offline').length,
    hashRate: devices.reduce((s, d) => s + d.hashRate, 0),
    avgTemp: devices.reduce((s, d) => s + d.temp, 0) / (devices.length || 1),
    totalPower: devices.reduce((s, d) => s + d.power, 0),
    totalShares: devices.reduce((s, d) => s + d.shares, 0),
  }
}

// ─── Main Dashboard ──────────────────────────────────────────
function MiningDashboard() {
  const [gatewayUrl, setGatewayUrl] = useState('')
  const [bitaxeHost, setBitaxeHost] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [connectionKind, setConnectionKind] = useState<'mawdaxe' | 'axeos'>('axeos')
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [devices, setDevices] = useState<MiningDevice[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)
  const [view, setView] = useState<'fleet' | 'device' | 'pet'>('fleet')
  const [useDemo, setUseDemo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const sseRef = useRef<EventSource | null>(null)

  // Load saved gateway URL
  useEffect(() => {
    const saved = localStorage.getItem('mawdaxe.gatewayUrl')
    const savedKey = localStorage.getItem('mawdaxe.apiKey')
    const savedBitaxe = localStorage.getItem('bitaxe.host')
    const savedKind = localStorage.getItem('mining.connectionKind')
    if (saved) setGatewayUrl(saved)
    if (savedKey) setApiKey(savedKey)
    if (savedBitaxe) setBitaxeHost(savedBitaxe)
    if (savedKind === 'mawdaxe' || savedKind === 'axeos') setConnectionKind(savedKind)
  }, [])

  // Demo mode
  useEffect(() => {
    if (!useDemo) return
    const devs = Array.from({ length: 4 }, (_, i) => generateDevice(i))
    setDevices(devs)
    if (!selectedDevice && devs.length) setSelectedDevice(devs[0].id)
    setConnected(true)

    const interval = setInterval(() => {
      setDevices((prev) =>
        prev.map((d) => ({
          ...d,
          hashRate: d.hashRate + (Math.random() - 0.5) * 8,
          temp: Math.max(40, Math.min(78, d.temp + (Math.random() - 0.5) * 1.5)),
          shares: d.shares + (Math.random() > 0.7 ? 1 : 0),
          power: d.power + (Math.random() - 0.5) * 0.3,
          pet: { ...d.pet, moodScore: Math.max(-1, Math.min(1, d.pet.moodScore + (Math.random() - 0.5) * 0.05)) },
        })),
      )
    }, 2000)
    return () => clearInterval(interval)
  }, [useDemo, selectedDevice])

  const connectToAxeOS = useCallback(async () => {
    const host = bitaxeHost.trim()
    if (!host) return
    setConnecting(true)
    setError(null)
    try {
      const base = host.startsWith('http://') || host.startsWith('https://') ? host.replace(/\/$/, '') : `http://${host.replace(/\/$/, '')}`
      const [infoRes, dashboardRes, asicRes] = await Promise.all([
        fetch(`${base}/api/system/info`),
        fetch(`${base}/api/system/statistics/dashboard`),
        fetch(`${base}/api/system/asic`),
      ])
      if (!infoRes.ok) throw new Error(`AxeOS info returned HTTP ${infoRes.status}`)
      if (!dashboardRes.ok) throw new Error(`AxeOS dashboard returned HTTP ${dashboardRes.status}`)
      const info = await infoRes.json() as unknown
      const dashboard = await dashboardRes.json() as unknown
      const asic = asicRes.ok ? await asicRes.json() as unknown : {}
      if (!isRecord(info) || !isRecord(dashboard) || !isRecord(asic)) throw new Error('AxeOS returned an unexpected payload')
      const device = normalizeAxeOSDevice(base, info, dashboard, asic)
      setDevices([device])
      setSelectedDevice(device.id)
      setConnected(true)
      setUseDemo(false)
      setConnectionKind('axeos')
      localStorage.setItem('bitaxe.host', bitaxeHost)
      localStorage.setItem('mining.connectionKind', 'axeos')
    } catch (caught) {
      setConnected(false)
      setError(caught instanceof Error ? caught.message : 'Could not connect to AxeOS')
    } finally {
      setConnecting(false)
    }
  }, [bitaxeHost])

  const refreshAxeOS = useCallback(async () => {
    if (connectionKind !== 'axeos') return
    await connectToAxeOS()
  }, [connectToAxeOS, connectionKind])

  const runAxeOSAction = useCallback(async (action: 'pause' | 'resume' | 'restart' | 'identify') => {
    const host = bitaxeHost.trim()
    if (!host) return
    const base = host.startsWith('http://') || host.startsWith('https://') ? host.replace(/\/$/, '') : `http://${host.replace(/\/$/, '')}`
    setError(null)
    const response = await fetch(`${base}/api/system/${action}`, { method: 'POST' })
    if (!response.ok) {
      setError(`${action} returned HTTP ${response.status}`)
      return
    }
    if (action !== 'restart') await refreshAxeOS()
  }, [bitaxeHost, refreshAxeOS])

  // Connect to real MawdAxe API
  const connectToGateway = useCallback(async () => {
    if (!gatewayUrl.trim()) return
    setConnecting(true)
    setError(null)
    try {
      const base = gatewayUrl.replace(/\/$/, '')
      const headers: Record<string, string> = {}
      if (apiKey) headers['X-API-Key'] = apiKey
      const res = await fetch(`${base}/health`, { headers })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      // Fetch fleet
      const fleetRes = await fetch(`${base}/api/fleet`, { headers })
      if (fleetRes.ok) {
        const data = await fleetRes.json() as unknown
        const rawDevices = isRecord(data) && Array.isArray(data.devices) ? data.devices : []
        const normalized = rawDevices.map(normalizeMawdAxeDevice).filter((device): device is MiningDevice => Boolean(device))
        if (normalized.length) setDevices(normalized)
      }

      localStorage.setItem('mawdaxe.gatewayUrl', gatewayUrl)
      if (apiKey) localStorage.setItem('mawdaxe.apiKey', apiKey)
      localStorage.setItem('mining.connectionKind', 'mawdaxe')

      // SSE stream
      if (sseRef.current) sseRef.current.close()
      const sse = new EventSource(`${base}/ws`)
      sse.addEventListener('message', (event) => {
        try {
          const update = JSON.parse(event.data) as unknown
          const rawDevices = isRecord(update) && Array.isArray(update.devices) ? update.devices : []
          const normalized = rawDevices.map(normalizeMawdAxeDevice).filter((device): device is MiningDevice => Boolean(device))
          if (normalized.length) setDevices(normalized)
        } catch { /* ignore */ }
      })
      sse.addEventListener('error', () => setConnected(false))
      sseRef.current = sse

      setConnected(true)
      setUseDemo(false)
      setConnectionKind('mawdaxe')
    } catch {
      setConnected(false)
      setError('Could not connect to MawdAxe gateway')
    } finally {
      setConnecting(false)
    }
  }, [gatewayUrl, apiKey])

  const fleet = computeFleetStats(devices)
  const sel = devices.find((d) => d.id === selectedDevice)

  return (
    <main className="section">
      {/* Header */}
      <div className="mining-header">
        <div className="mining-header-left">
          <span className="mining-logo">🦞</span>
          <div>
            <h1 className="mining-title">MawdAxe</h1>
            <p className="mining-subtitle">Bitaxe Hardware + Autonomous Mining Fleet</p>
          </div>
        </div>
        <div className="mining-header-right">
          <div className="mining-tabs">
            {(['fleet', 'device', 'pet'] as const).map((v) => (
              <button key={v} type="button" className={`mining-tab ${view === v ? 'active' : ''}`} onClick={() => setView(v)}>
                {v}
              </button>
            ))}
          </div>
          <div className={`mining-status-dot ${connected ? 'online' : 'offline'}`} />
          <span className="mining-status-text">{connected ? 'OODA ACTIVE' : 'DISCONNECTED'}</span>
        </div>
      </div>

      {/* Connection */}
      {!connected ? (
        <section className="card" style={{ marginTop: 16 }}>
          <div className="gallery-panel-header">
            <div>
              <h2>Connect Mining Hardware</h2>
              <p>Connect directly to a Bitaxe AxeOS API on your LAN, or use a MawdAxe gateway for fleet mode.</p>
            </div>
            <Cpu className="gallery-panel-icon" aria-hidden="true" />
          </div>
          <div className="gallery-form" style={{ marginTop: 12 }}>
            <div className="strategy-venue-tabs" style={{ marginBottom: 12 }}>
              <button type="button" className={`strategy-venue-tab ${connectionKind === 'axeos' ? 'active' : ''}`} onClick={() => setConnectionKind('axeos')}>
                AxeOS Bitaxe
              </button>
              <button type="button" className={`strategy-venue-tab ${connectionKind === 'mawdaxe' ? 'active' : ''}`} onClick={() => setConnectionKind('mawdaxe')}>
                MawdAxe Gateway
              </button>
            </div>
            <div className="gallery-inline-fields">
              {connectionKind === 'axeos' ? (
                <label className="gallery-field">
                  <span>Bitaxe AxeOS URL or LAN IP</span>
                  <input value={bitaxeHost} onChange={(event) => setBitaxeHost(event.target.value)} placeholder="http://bitaxe or 192.168.1.42" />
                </label>
              ) : (
                <>
                  <label className="gallery-field">
                    <span>MawdAxe URL</span>
                    <input value={gatewayUrl} onChange={(event) => setGatewayUrl(event.target.value)} placeholder="http://192.168.1.42:8420" />
                  </label>
                  <label className="gallery-field">
                    <span>API Key (optional)</span>
                    <input value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder="your-api-key" type="password" />
                  </label>
                </>
              )}
            </div>
            {error ? <div className="setup-callout">{error}</div> : null}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                className="btn btn-primary"
                disabled={connecting || (connectionKind === 'axeos' ? !bitaxeHost.trim() : !gatewayUrl.trim())}
                onClick={() => void (connectionKind === 'axeos' ? connectToAxeOS() : connectToGateway())}
              >
                <Wifi className="h-4 w-4" aria-hidden="true" />
                {connecting ? 'Connecting...' : 'Connect'}
              </button>
              <button type="button" className="btn" onClick={() => setUseDemo(true)}>
                <Zap className="h-4 w-4" aria-hidden="true" />
                Try Demo
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {/* Fleet View */}
      {connected && view === 'fleet' ? (
        <div style={{ marginTop: 16 }}>
          {/* Fleet Stats */}
          <div className="mining-stats-grid">
            {[
              { label: 'DEVICES', value: String(fleet.total), color: '#ff6600' },
              { label: 'ONLINE', value: String(fleet.online), color: '#00ff40' },
              { label: 'TOTAL GH/s', value: fleet.hashRate.toFixed(1), color: '#00ddff' },
              { label: 'AVG TEMP', value: `${fleet.avgTemp.toFixed(1)}°C`, color: fleet.avgTemp > 65 ? '#ff2200' : fleet.avgTemp > 55 ? '#ffc800' : '#00ff40' },
              { label: 'TOTAL WATTS', value: fleet.totalPower.toFixed(1), color: '#cc88ff' },
              { label: 'SHARES', value: String(fleet.totalShares), color: '#ffaa00' },
            ].map((s) => (
              <div key={s.label} className="mining-stat-card" style={{ borderLeftColor: s.color }}>
                <div className="mining-stat-label">{s.label}</div>
                <div className="mining-stat-value" style={{ color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Device Grid */}
          <div className="mining-device-grid">
            {devices.map((d) => (
              <div key={d.id} className={`mining-device-card ${d.id === selectedDevice ? 'selected' : ''}`}
                onClick={() => { setSelectedDevice(d.id); setView('device') }}>
                <div className="mining-device-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>{STAGE_EMOJI[d.pet.stage]}</span>
                    <div>
                      <div className="mining-device-name">{d.id}</div>
                      <div className="mining-device-ip">{d.ip}</div>
                    </div>
                  </div>
                  <div className="mining-health-dot" style={{ background: HEALTH_COLORS[d.health] }} />
                </div>
                <div className="mining-mini-stats">
                  {[
                    { label: 'GH/s', value: d.hashRate.toFixed(1), color: '#00ddff' },
                    { label: 'TEMP', value: `${d.temp.toFixed(1)}°`, color: d.temp > 65 ? '#ff2200' : '#00ff40' },
                    { label: 'SHARES', value: String(d.shares), color: '#ffaa00' },
                  ].map((s) => (
                    <div key={s.label} className="mining-mini-stat">
                      <div className="mining-mini-stat-label">{s.label}</div>
                      <div className="mining-mini-stat-value" style={{ color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>
                <div className="mining-mood-bar">
                  <div className="mining-mood-fill" style={{ width: `${((d.pet.moodScore + 1) / 2) * 100}%`, background: MOOD_COLORS[d.pet.mood] }} />
                </div>
                <div className="mining-mood-label" style={{ color: MOOD_COLORS[d.pet.mood] }}>{d.pet.mood}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Device Detail */}
      {connected && view === 'device' && sel ? (
        <div style={{ marginTop: 16 }}>
          <button type="button" className="btn" onClick={() => setView('fleet')} style={{ marginBottom: 16 }}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Fleet
          </button>
          <div className="mining-detail-grid">
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h2 style={{ margin: 0, color: '#ff6600', letterSpacing: 2 }}>{sel.id}</h2>
                  <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--ink-soft)' }}>{sel.ip} · {sel.state}</p>
                  {sel.version || sel.pool ? <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--ink-soft)' }}>{sel.version || 'AxeOS'} {sel.pool ? `· ${sel.pool}` : ''}</p> : null}
                </div>
                <span className="mining-health-badge" style={{ color: HEALTH_COLORS[sel.health], borderColor: `${HEALTH_COLORS[sel.health]}44`, background: `${HEALTH_COLORS[sel.health]}15` }}>
                  {sel.health}
                </span>
              </div>
              <div className="mining-detail-stats">
                {[
                  { label: 'HASHRATE', value: `${sel.hashRate.toFixed(1)} GH/s`, color: '#00ddff' },
                  { label: 'TEMPERATURE', value: `${sel.temp.toFixed(1)}°C`, color: sel.temp > 65 ? '#ff2200' : '#00ff40' },
                  { label: 'POWER', value: `${sel.power.toFixed(1)}W`, color: '#cc88ff' },
                  { label: 'FREQ', value: `${sel.freq} MHz`, color: '#ffaa00' },
                  { label: 'FAN', value: `${sel.fanSpeed}%`, color: '#00ddff' },
                  { label: 'VOLTAGE', value: sel.voltage ? `${sel.voltage} mV` : 'n/a', color: '#ffaa00' },
                  { label: 'EFFICIENCY', value: `${(sel.hashRate / sel.power).toFixed(1)} GH/J`, color: '#00ff80' },
                  { label: 'SHARES', value: String(sel.shares), color: '#00ff40' },
                  { label: 'REJECTED', value: String(sel.rejected), color: '#ff4444' },
                  { label: 'UPTIME', value: `${sel.uptime.toFixed(1)}h`, color: '#888' },
                ].map((s) => (
                  <div key={s.label} className="mining-detail-stat">
                    <div className="mining-stat-label">{s.label}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
              {connectionKind === 'axeos' && !useDemo ? (
                <div className="mining-hardware-actions">
                  <button type="button" className="btn" onClick={() => void runAxeOSAction('identify')}>
                    Identify
                  </button>
                  <button type="button" className="btn" onClick={() => void runAxeOSAction('pause')}>
                    Pause
                  </button>
                  <button type="button" className="btn" onClick={() => void runAxeOSAction('resume')}>
                    Resume
                  </button>
                  <button type="button" className="btn btn-danger" onClick={() => void runAxeOSAction('restart')}>
                    Restart
                  </button>
                </div>
              ) : null}
            </div>
            {/* Pet Card */}
            <div className="mining-pet-card">
              <div style={{ fontSize: 64, marginBottom: 8 }}>{STAGE_EMOJI[sel.pet.stage]}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ff6600' }}>{sel.pet.name}</div>
              <div style={{ fontSize: '0.85rem', color: MOOD_COLORS[sel.pet.mood], textTransform: 'uppercase', letterSpacing: 2 }}>
                {sel.pet.stage} · {sel.pet.mood}
              </div>
              <div className="mining-pet-stats">
                <div className="mining-mini-stat"><div className="mining-mini-stat-label">SHARES</div><div className="mining-mini-stat-value" style={{ color: '#ff6600' }}>{sel.pet.totalShares}</div></div>
                <div className="mining-mini-stat"><div className="mining-mini-stat-label">FEEDS</div><div className="mining-mini-stat-value" style={{ color: '#ff6600' }}>{sel.pet.feedCount}</div></div>
                <div className="mining-mini-stat"><div className="mining-mini-stat-label">ACCEPT</div><div className="mining-mini-stat-value" style={{ color: '#ff6600' }}>{sel.shares > 0 ? ((sel.shares / (sel.shares + sel.rejected)) * 100).toFixed(1) : '0'}%</div></div>
              </div>
              {/* Evolution path */}
              <div className="mining-evolution">
                {(['egg', 'larva', 'juvenile', 'adult', 'alpha'] as PetStage[]).map((s, i) => {
                  const stages: PetStage[] = ['egg', 'larva', 'juvenile', 'adult', 'alpha']
                  const currentIdx = stages.indexOf(sel.pet.stage)
                  return (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <div className={`mining-evo-node ${i <= currentIdx ? 'reached' : ''} ${i === currentIdx ? 'current' : ''}`}>
                        {STAGE_EMOJI[s]}
                      </div>
                      {i < 4 ? <div className="mining-evo-line" style={{ background: i < currentIdx ? '#ff6600' : '#333' }} /> : null}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Pet View */}
      {connected && view === 'pet' && sel ? (
        <div style={{ marginTop: 16 }}>
          <button type="button" className="btn" onClick={() => setView('fleet')} style={{ marginBottom: 16 }}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Fleet
          </button>
          <div className="mining-pet-fullview">
            <div className="mining-pet-screen">
              <span style={{ fontSize: 80 }}>{STAGE_EMOJI[sel.pet.stage]}</span>
            </div>
            <h2 style={{ color: '#ff6600', letterSpacing: 3, margin: '16px 0 4px' }}>{sel.pet.name}</h2>
            <p style={{ color: MOOD_COLORS[sel.pet.mood], textTransform: 'uppercase', letterSpacing: 2, fontSize: '0.9rem' }}>
              Feeling {sel.pet.mood}
            </p>
            <div className="mining-mood-gauge">
              <span style={{ fontSize: '0.72rem', color: '#ff2200' }}>SAD</span>
              <div className="mining-mood-gauge-track">
                <div className="mining-mood-gauge-thumb" style={{ left: `${((sel.pet.moodScore + 1) / 2) * 100}%`, background: MOOD_COLORS[sel.pet.mood], boxShadow: `0 0 10px ${MOOD_COLORS[sel.pet.mood]}` }} />
              </div>
              <span style={{ fontSize: '0.72rem', color: '#00ffc8' }}>ECSTATIC</span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Disconnect / Demo label */}
      {connected ? (
        <div style={{ marginTop: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
          {useDemo ? <span style={{ fontSize: '0.82rem', color: 'var(--ink-soft)' }}>Demo mode — connect a real MawdAxe instance for live data</span> : null}
          <button type="button" className="btn" onClick={() => { setConnected(false); setUseDemo(false); setDevices([]); if (sseRef.current) sseRef.current.close() }}>
            <WifiOff className="h-4 w-4" aria-hidden="true" />
            Disconnect
          </button>
          {!useDemo ? (
            <button type="button" className="btn" onClick={() => void (connectionKind === 'axeos' ? refreshAxeOS() : connectToGateway())}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Refresh
            </button>
          ) : null}
        </div>
      ) : null}
    </main>
  )
}
