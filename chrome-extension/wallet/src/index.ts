/**
 * @openclawdsolana/pagent-wallet — unified Solana wallet adapter for OpenClawd.
 *
 * Three backends, one interface:
 *   - VaultWallet         → localhost:8421 (AES-256-GCM keystore)
 *   - InExtensionWallet   → chrome.storage.local (Ed25519 + AES-GCM)
 *   - SeekerWallet        → Solana Seeker phone via gateway WS bridge
 *
 *   import { detectWallet, HttpGatewayClient } from '@openclawdsolana/pagent-wallet'
 *
 *   const wallet  = await detectWallet({ prefer: ['vault', 'seeker'] })
 *   const gateway = new HttpGatewayClient({ baseUrl: 'http://127.0.0.1:8788' })
 *
 *   const portfolio = await gateway.portfolio(wallet!.status().then(s => s.pubkey!))
 *   const built     = await gateway.swapBuild({ ... })
 *   const signed    = await wallet.signMessage(built.messageBase58)
 *   const tx        = await gateway.submit({ ...signed, messageBase58: built.messageBase58 })
 */

export * from './types.js'
export { HttpGatewayClient } from './gateway.js'
export type { GatewayClientOptions } from './gateway.js'
export { VaultWallet } from './vault.js'
export type { VaultWalletOptions } from './vault.js'
export { InExtensionWallet } from './in-extension.js'
export { SeekerWallet } from './seeker.js'
export type { SeekerWalletOptions } from './seeker.js'
export { detectWallet } from './auto-detect.js'
export type { DetectOptions } from './auto-detect.js'
