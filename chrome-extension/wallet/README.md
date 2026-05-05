# @openclawdsolana/pagent-wallet

Unified Solana wallet adapter for the OpenClawd pAGENT — wraps three signing backends behind one interface, plus an HTTP client for the OpenClawd Gateway.

## Three backends, one contract

| Backend | Where the secret lives | When to use |
|---|---|---|
| `VaultWallet` | `~/.openclawd/vault.json` (AES-256-GCM, `chmod 0600`), accessed via `localhost:8421` | Default for desktop installs — daemon owns the key. |
| `InExtensionWallet` | `chrome.storage.local` (Ed25519 + AES-GCM, PBKDF2 310k, 15-min auto-lock) | When you want signing without a running daemon. Routes through `chrome.runtime.sendMessage({kind:'wallet'})`. |
| `SeekerWallet` | Solana Seeker secure element | Hardware-backed signing via the gateway pairing flow. |

Every backend implements the same `WalletAdapter`:

```ts
interface WalletAdapter {
  readonly backend: 'vault' | 'in-extension' | 'seeker' | 'unknown'
  status(): Promise<WalletStatus>
  unlock(passphrase?: string): Promise<void>
  lock(): Promise<void>
  signMessage(messageBase58: string): Promise<{ signature: string; pubkey: string }>
}
```

## Quick start

```ts
import { detectWallet, HttpGatewayClient } from '@openclawdsolana/pagent-wallet'

// Probe backends in order, pick the first that exists.
const wallet = await detectWallet({ prefer: ['vault', 'in-extension', 'seeker'] })
if (!wallet) throw new Error('No wallet — run `openclawd wallet create`')

const gateway = new HttpGatewayClient({ baseUrl: 'http://127.0.0.1:8788' })

// Build → sign → submit. The wallet only ever sees the serialized message;
// the gateway constructs and broadcasts.
const built  = await gateway.swapBuild({
  fromMint: 'So11111111111111111111111111111111111111112',
  toMint:   'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  amount:   1.5,
  owner:    (await wallet.status()).pubkey!,
})
const signed = await wallet.signMessage(built.messageBase58)
const tx     = await gateway.submit({
  messageBase58: built.messageBase58,
  signature: signed.signature,
  signerPubkey: signed.pubkey,
})

console.log(tx.txSignature)
```

## Why no `@solana/web3.js`?

The package is intentionally dependency-free. The gateway already owns the heavy `@solana/web3.js` + Jupiter routing dependencies — duplicating them in every browser surface would balloon bundle size and create CSP problems inside MV3. Instead:

```
[caller]  swapBuild(req)            ──▶  gateway constructs tx
                                          returns messageBase58
[wallet]  signMessage(messageBase58)──▶  Ed25519 signature
[caller]  submit({sig, msg, pub})   ──▶  gateway broadcasts via Helius RPC
```

The wallet never sees the raw transaction — only the serialized message bytes. Same secret-isolation property the existing `openclawd-chrome-extension/solana-wallet.js` keystore relies on.

## Gateway client

```ts
const gateway = new HttpGatewayClient({
  baseUrl: 'http://127.0.0.1:8788',
  bearerToken: process.env.GATEWAY_TOKEN,
})

await gateway.health()
await gateway.tokenOverview('So11111111111111111111111111111111111111112')
await gateway.portfolio('YourBase58Pubkey...')
await gateway.swapBuild({...})
await gateway.submit({...})
```

The client tolerates both `{ data: {...} }` and unwrapped response shapes — same forgiving behavior as the legacy `openclawd-chrome-extension/gateway-client.js`.

## Pair with `pagent-llms`

```ts
import { solanaWalletTools } from '@openclawdsolana/pagent-llms'
import { detectWallet, HttpGatewayClient } from '@openclawdsolana/pagent-wallet'

const wallet  = await detectWallet()
const gateway = new HttpGatewayClient()
const tools   = solanaWalletTools({ wallet: wallet!, gateway })

// Hand to any LLM client that implements the @openclawdsolana/pagent-llms Tool surface.
```

## Pair with `pagent-ui`

```ts
import { WalletPanel } from '@openclawdsolana/pagent-ui'

new WalletPanel({ wallet, gateway, mount: document.getElementById('wallet') })
```

## Files

```
src/
├── types.ts          WalletAdapter, GatewayClient, DTOs
├── gateway.ts        HttpGatewayClient
├── vault.ts          VaultWallet (localhost:8421)
├── in-extension.ts   InExtensionWallet (chrome.runtime sendMessage bridge)
├── seeker.ts         SeekerWallet (gateway HTTP)
├── auto-detect.ts    detectWallet({ prefer })
└── index.ts          re-exports
```
