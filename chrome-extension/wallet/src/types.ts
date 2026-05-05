// Unified wallet types — every backend speaks the same shape.

export type Pubkey = string // base58
export type Base58 = string
export type SignatureBase58 = string

export interface TokenHolding {
  mint: string
  symbol?: string
  amount: number          // human units (already divided by decimals)
  decimals: number
  usdValue?: number
  logoURI?: string
}

export interface Portfolio {
  pubkey: Pubkey
  solBalance: number
  totalUsd: number
  tokens: TokenHolding[]
  fetchedAt: number       // epoch ms
}

export interface TokenOverview {
  mint: string
  symbol: string
  name?: string
  priceUsd: number
  marketCapUsd?: number
  liquidityUsd?: number
  priceChange24h?: number
  holders?: number
}

export interface SwapBuildRequest {
  fromMint: string
  toMint: string
  amount: number          // human units
  slippageBps?: number    // basis points; default 50 = 0.5%
  owner: Pubkey
}

export interface SwapBuildResponse {
  messageBase58: Base58   // serialized message, ready to sign
  blockhash: string
  expiresAt: number
  estimateOutAmount?: number
}

export interface SubmitRequest {
  messageBase58: Base58
  signature: SignatureBase58
  signerPubkey: Pubkey
}

export interface SubmitResponse {
  txSignature: SignatureBase58
  status: 'submitted' | 'confirmed' | 'failed'
  error?: string
}

export interface WalletStatus {
  exists: boolean
  pubkey?: Pubkey
  unlocked: boolean
  createdAt?: number
  backend: WalletBackend
}

export type WalletBackend = 'in-extension' | 'vault' | 'seeker' | 'unknown'

/**
 * The contract every wallet backend implements.
 * - `in-extension`: keystore in chrome.storage.local, unlocked via passphrase
 * - `vault`:        localhost daemon at :8421, unlocked via daemon
 * - `seeker`:       Solana Seeker phone via gateway WS bridge
 */
export interface WalletAdapter {
  readonly backend: WalletBackend

  status(): Promise<WalletStatus>
  unlock(passphrase?: string): Promise<void>
  lock(): Promise<void>

  /** Sign a serialized Solana transaction message (base58). */
  signMessage(messageBase58: Base58): Promise<{ signature: SignatureBase58; pubkey: Pubkey }>
}

/** Read-only market + portfolio surface — provided by the gateway, not the wallet itself. */
export interface GatewayClient {
  health(): Promise<{ ok: boolean; version?: string }>
  tokenOverview(mintOrAddress: string): Promise<TokenOverview>
  portfolio(owner: Pubkey): Promise<Portfolio>
  swapBuild(req: SwapBuildRequest): Promise<SwapBuildResponse>
  submit(req: SubmitRequest): Promise<SubmitResponse>
}
