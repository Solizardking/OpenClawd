// VaultWallet — talks to the local agentwallet-vault daemon at :8421.
// The daemon owns the AES-256-GCM keystore at ~/.openclawd/vault.json.
// We never see the secret here — we just send messageBase58 and receive a
// signature.

import type {
  Base58,
  Pubkey,
  SignatureBase58,
  WalletAdapter,
  WalletStatus,
} from './types.js'

export interface VaultWalletOptions {
  baseUrl?: string             // default http://127.0.0.1:8421
  bearerToken?: string         // bearer for the local vault
  fetch?: typeof globalThis.fetch
}

const DEFAULT_BASE = 'http://127.0.0.1:8421'

interface VaultStatus {
  exists?: boolean
  unlocked?: boolean
  pubkey?: string
  createdAt?: number
}

interface VaultSignResponse {
  signature?: string
  pubkey?: string
}

export class VaultWallet implements WalletAdapter {
  readonly backend = 'vault' as const
  private baseUrl: string
  private headers: Record<string, string>
  private fetchImpl: typeof globalThis.fetch

  constructor(opts: VaultWalletOptions = {}) {
    this.baseUrl = (opts.baseUrl ?? DEFAULT_BASE).replace(/\/$/, '')
    this.headers = { 'content-type': 'application/json' }
    if (opts.bearerToken) this.headers.authorization = `Bearer ${opts.bearerToken}`
    this.fetchImpl = opts.fetch ?? globalThis.fetch.bind(globalThis)
  }

  async status(): Promise<WalletStatus> {
    try {
      const r = await this.fetchImpl(`${this.baseUrl}/status`, { headers: this.headers })
      if (!r.ok) return { exists: false, unlocked: false, backend: this.backend }
      const j = (await r.json()) as VaultStatus
      return {
        exists: j.exists ?? false,
        unlocked: j.unlocked ?? false,
        pubkey: j.pubkey,
        createdAt: j.createdAt,
        backend: this.backend,
      }
    } catch {
      return { exists: false, unlocked: false, backend: this.backend }
    }
  }

  async unlock(passphrase?: string): Promise<void> {
    const r = await this.fetchImpl(`${this.baseUrl}/unlock`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ passphrase }),
    })
    if (!r.ok) throw new Error(`vault unlock failed: ${r.status}`)
  }

  async lock(): Promise<void> {
    await this.fetchImpl(`${this.baseUrl}/lock`, { method: 'POST', headers: this.headers })
  }

  async signMessage(messageBase58: Base58): Promise<{ signature: SignatureBase58; pubkey: Pubkey }> {
    const r = await this.fetchImpl(`${this.baseUrl}/sign`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ messageBase58 }),
    })
    if (!r.ok) throw new Error(`vault sign failed: ${r.status}`)
    const j = (await r.json()) as VaultSignResponse
    if (!j.signature || !j.pubkey) throw new Error('vault returned no signature')
    return { signature: j.signature, pubkey: j.pubkey }
  }
}
