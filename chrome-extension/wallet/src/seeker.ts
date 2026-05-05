// SeekerWallet — Solana Seeker phone bridge via the OpenClawd gateway WS.
// Hardware-backed Ed25519 — the secret never leaves the secure element.
//
// This adapter wraps the gateway's HTTP /api/wallet/seeker/* surface so the
// caller doesn't need to manage the WS lifecycle directly. If you want a
// streaming UX (pairing dialogs, etc.), use the gateway WS directly.

import type {
  Base58,
  Pubkey,
  SignatureBase58,
  WalletAdapter,
  WalletStatus,
} from './types.js'

export interface SeekerWalletOptions {
  gatewayBaseUrl?: string      // default http://127.0.0.1:8788
  bearerToken?: string
  fetch?: typeof globalThis.fetch
}

interface SeekerStatusResponse {
  paired?: boolean
  pubkey?: string
  pairedAt?: number
}

interface SeekerSignResponse {
  signature?: string
  pubkey?: string
}

const DEFAULT_BASE = 'http://127.0.0.1:8788'

export class SeekerWallet implements WalletAdapter {
  readonly backend = 'seeker' as const
  private baseUrl: string
  private headers: Record<string, string>
  private fetchImpl: typeof globalThis.fetch

  constructor(opts: SeekerWalletOptions = {}) {
    this.baseUrl = (opts.gatewayBaseUrl ?? DEFAULT_BASE).replace(/\/$/, '')
    this.headers = { 'content-type': 'application/json' }
    if (opts.bearerToken) this.headers.authorization = `Bearer ${opts.bearerToken}`
    this.fetchImpl = opts.fetch ?? globalThis.fetch.bind(globalThis)
  }

  async status(): Promise<WalletStatus> {
    try {
      const r = await this.fetchImpl(`${this.baseUrl}/api/wallet/seeker/status`, { headers: this.headers })
      if (!r.ok) return { exists: false, unlocked: false, backend: this.backend }
      const j = (await r.json()) as SeekerStatusResponse
      return {
        exists: j.paired ?? false,
        unlocked: j.paired ?? false,    // Seeker stays "unlocked" while paired
        pubkey: j.pubkey,
        createdAt: j.pairedAt,
        backend: this.backend,
      }
    } catch {
      return { exists: false, unlocked: false, backend: this.backend }
    }
  }

  async unlock(): Promise<void> { /* no-op — pairing handled via gateway setup-code flow */ }
  async lock(): Promise<void> { /* no-op — paired Seeker disconnect is its own command */ }

  async signMessage(messageBase58: Base58): Promise<{ signature: SignatureBase58; pubkey: Pubkey }> {
    const r = await this.fetchImpl(`${this.baseUrl}/api/wallet/seeker/sign`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ messageBase58 }),
    })
    if (!r.ok) throw new Error(`seeker sign failed: ${r.status}`)
    const j = (await r.json()) as SeekerSignResponse
    if (!j.signature || !j.pubkey) throw new Error('seeker returned no signature')
    return { signature: j.signature, pubkey: j.pubkey }
  }
}
