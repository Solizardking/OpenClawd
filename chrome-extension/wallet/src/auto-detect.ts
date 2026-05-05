// Auto-detect which wallet backend is available and return the first one
// that responds. Order: vault (:8421) → in-extension (chrome.runtime) →
// seeker (gateway pairing). Callers can override with an explicit `prefer`.

import { InExtensionWallet } from './in-extension.js'
import { SeekerWallet } from './seeker.js'
import type { WalletAdapter, WalletBackend } from './types.js'
import { VaultWallet } from './vault.js'

export interface DetectOptions {
  vaultUrl?: string
  vaultBearer?: string
  gatewayUrl?: string
  gatewayBearer?: string
  prefer?: WalletBackend[]   // try these in order before falling back
  fetch?: typeof globalThis.fetch
}

export async function detectWallet(opts: DetectOptions = {}): Promise<WalletAdapter | null> {
  const order: WalletBackend[] = opts.prefer ?? ['vault', 'in-extension', 'seeker']
  for (const backend of order) {
    const adapter = makeAdapter(backend, opts)
    if (!adapter) continue
    const status = await adapter.status().catch(() => null)
    if (status?.exists) return adapter
  }
  return null
}

function makeAdapter(backend: WalletBackend, opts: DetectOptions): WalletAdapter | null {
  switch (backend) {
    case 'vault':
      return new VaultWallet({ baseUrl: opts.vaultUrl, bearerToken: opts.vaultBearer, fetch: opts.fetch })
    case 'in-extension':
      // Only useful inside an MV3 extension — return adapter, status() will fail gracefully elsewhere.
      return new InExtensionWallet()
    case 'seeker':
      return new SeekerWallet({ gatewayBaseUrl: opts.gatewayUrl, bearerToken: opts.gatewayBearer, fetch: opts.fetch })
    default:
      return null
  }
}
