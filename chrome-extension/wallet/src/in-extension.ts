// InExtensionWallet — adapter wrapper around the existing
// `openclawd-chrome-extension/solana-wallet.js` keystore (Ed25519 + AES-GCM,
// PBKDF2 310k, auto-lock 15 min). It runs in an MV3 service worker and only
// exists when the `chrome.runtime` global is available.
//
// We don't reimplement the crypto here — we route through the service worker
// via `chrome.runtime.sendMessage({kind:'wallet', op:..., args:[...]})` so the
// secret stays in the worker's memory.

import type {
  Base58,
  Pubkey,
  SignatureBase58,
  WalletAdapter,
  WalletStatus,
} from './types.js'

interface ChromeRuntimeLike {
  sendMessage<T = unknown>(msg: unknown, cb?: (resp: T) => void): Promise<T> | void
}
interface ChromeLike {
  runtime?: ChromeRuntimeLike
}

function getChrome(): ChromeLike | undefined {
  return (globalThis as { chrome?: ChromeLike }).chrome
}

interface RuntimeResponse<T> {
  ok?: boolean
  result?: T
  error?: string
}

interface InExtStatus {
  exists?: boolean
  pubkey?: string
  unlocked?: boolean
  createdAt?: number
}

interface InExtSign {
  signature?: string
  pubkey?: string
}

function send<T>(op: string, args: unknown[] = []): Promise<T> {
  const chrome = getChrome()
  if (!chrome?.runtime) {
    return Promise.reject(new Error('InExtensionWallet requires chrome.runtime — load this inside an MV3 extension.'))
  }
  return new Promise<T>((resolve, reject) => {
    try {
      const maybe = chrome.runtime!.sendMessage<RuntimeResponse<T>>({ kind: 'wallet', op, args }, (resp) => {
        if (!resp || resp.ok === false) reject(new Error(resp?.error ?? `wallet.${op} failed`))
        else resolve(resp.result as T)
      })
      // Some Chrome polyfills return a Promise directly.
      if (maybe && typeof (maybe as Promise<RuntimeResponse<T>>).then === 'function') {
        ;(maybe as Promise<RuntimeResponse<T>>).then(
          (resp) => resp && resp.ok !== false ? resolve(resp.result as T) : reject(new Error(resp?.error ?? `wallet.${op} failed`)),
          reject,
        )
      }
    } catch (err) {
      reject(err)
    }
  })
}

export class InExtensionWallet implements WalletAdapter {
  readonly backend = 'in-extension' as const

  async status(): Promise<WalletStatus> {
    try {
      const r = await send<InExtStatus>('status', [])
      return {
        exists: r.exists ?? false,
        unlocked: r.unlocked ?? false,
        pubkey: r.pubkey,
        createdAt: r.createdAt,
        backend: this.backend,
      }
    } catch {
      return { exists: false, unlocked: false, backend: this.backend }
    }
  }

  async unlock(passphrase?: string): Promise<void> {
    if (!passphrase) throw new Error('passphrase required to unlock in-extension wallet')
    await send('unlock', [passphrase])
  }

  async lock(): Promise<void> {
    await send('lock', [])
  }

  async signMessage(messageBase58: Base58): Promise<{ signature: SignatureBase58; pubkey: Pubkey }> {
    const r = await send<InExtSign>('signSolanaMessage', [messageBase58])
    if (!r.signature || !r.pubkey) throw new Error('in-extension wallet returned no signature')
    return { signature: r.signature, pubkey: r.pubkey }
  }
}
