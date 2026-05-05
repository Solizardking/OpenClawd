/**
 * Solana wallet tools for the pAGENT Re-Act loop.
 *
 *   import { LLM } from '@openclawdsolana/pagent-llms'
 *   import { solanaWalletTools } from '@openclawdsolana/pagent-llms/solana-tools'
 *   import { detectWallet, HttpGatewayClient } from '@openclawdsolana/pagent-wallet'
 *
 *   const wallet  = await detectWallet()
 *   const gateway = new HttpGatewayClient()
 *   const tools   = solanaWalletTools({ wallet, gateway })
 *
 *   await llm.invoke({ messages, tools })
 *
 * The tools intentionally avoid pulling in `@solana/web3.js` — the gateway
 * builds transactions, the wallet signs the serialized message, the gateway
 * broadcasts. This keeps the agent surface small and CSP-friendly inside MV3.
 */

import type { Tool } from './index.js'

// We import only the *types* from pagent-wallet so this module compiles even
// if pagent-wallet isn't installed (consumers can use solanaGatewayTools
// alone for read-only flows).
type Pubkey = string
type Base58 = string

interface WalletAdapterLike {
  status(): Promise<{ exists: boolean; pubkey?: Pubkey; unlocked: boolean }>
  unlock(passphrase?: string): Promise<void>
  signMessage(messageBase58: Base58): Promise<{ signature: string; pubkey: Pubkey }>
}

interface GatewayLike {
  health(): Promise<{ ok: boolean; version?: string }>
  tokenOverview(mint: string): Promise<unknown>
  portfolio(owner: Pubkey): Promise<unknown>
  swapBuild(req: {
    fromMint: string; toMint: string; amount: number; slippageBps?: number; owner: Pubkey
  }): Promise<{ messageBase58: Base58; blockhash: string; expiresAt: number; estimateOutAmount?: number }>
  submit(req: {
    messageBase58: Base58; signature: string; signerPubkey: Pubkey
  }): Promise<{ txSignature: string; status: 'submitted' | 'confirmed' | 'failed'; error?: string }>
}

export interface SolanaToolsOptions {
  wallet?: WalletAdapterLike
  gateway: GatewayLike
  /** Default slippage in basis points for swap_token. Default: 50 (0.5%). */
  defaultSlippageBps?: number
}

/** JSON Schema describing common args. Inlined to stay zero-dep. */
const schemas = {
  noArgs: { type: 'object', properties: {}, additionalProperties: false } as const,
  ownerArg: {
    type: 'object',
    properties: {
      owner: { type: 'string', description: 'Solana public key (base58). Defaults to the active wallet.' },
    },
    additionalProperties: false,
  } as const,
  mintArg: {
    type: 'object',
    properties: {
      mint: { type: 'string', description: 'Solana SPL mint address (base58).' },
    },
    required: ['mint'],
    additionalProperties: false,
  } as const,
  swapArgs: {
    type: 'object',
    properties: {
      fromMint: { type: 'string', description: 'SPL mint to swap from (or the SOL pseudo-mint).' },
      toMint:   { type: 'string', description: 'SPL mint to swap into.' },
      amount:   { type: 'number', description: 'Amount in human units (e.g. 1.5 SOL).' },
      slippageBps: { type: 'number', description: 'Slippage tolerance in basis points (50 = 0.5%).' },
    },
    required: ['fromMint', 'toMint', 'amount'],
    additionalProperties: false,
  } as const,
  signArgs: {
    type: 'object',
    properties: {
      messageBase58: { type: 'string', description: 'Serialized Solana transaction message in base58.' },
    },
    required: ['messageBase58'],
    additionalProperties: false,
  } as const,
  unlockArgs: {
    type: 'object',
    properties: {
      passphrase: { type: 'string', description: 'Wallet passphrase (in-extension backend).' },
    },
    additionalProperties: false,
  } as const,
} satisfies Record<string, unknown>

export function solanaWalletTools(opts: SolanaToolsOptions): Record<string, Tool> {
  const { wallet, gateway } = opts
  const defaultSlippage = opts.defaultSlippageBps ?? 50

  const requireWallet = (): WalletAdapterLike => {
    if (!wallet) throw new Error('No wallet adapter configured — pass `wallet` to solanaWalletTools.')
    return wallet
  }

  const tools: Record<string, Tool> = {
    solana_health: {
      description: 'Check the OpenClawd Gateway is reachable and report its version.',
      inputSchema: schemas.noArgs,
      execute: async () => gateway.health(),
    },

    solana_wallet_status: {
      description: 'Return the active wallet status (exists, pubkey, unlocked).',
      inputSchema: schemas.noArgs,
      execute: async () => requireWallet().status(),
    },

    solana_unlock: {
      description: 'Unlock the wallet. Required before signing for in-extension backend.',
      inputSchema: schemas.unlockArgs,
      execute: async (args: { passphrase?: string }) => {
        await requireWallet().unlock(args.passphrase)
        return { ok: true }
      },
    },

    solana_token_overview: {
      description: 'Get live price, market cap, liquidity, and 24h delta for a Solana SPL token.',
      inputSchema: schemas.mintArg,
      execute: async (args: { mint: string }) => gateway.tokenOverview(args.mint),
    },

    solana_portfolio: {
      description: 'Fetch the SOL balance and SPL holdings for a wallet (defaults to the active wallet).',
      inputSchema: schemas.ownerArg,
      execute: async (args: { owner?: string }) => {
        const owner = args.owner ?? (await requireWallet().status()).pubkey
        if (!owner) throw new Error('No owner — wallet has no pubkey and `owner` was not provided.')
        return gateway.portfolio(owner)
      },
    },

    solana_swap: {
      description: 'Build, sign, and submit a swap. Slippage defaults to 0.5% if not supplied.',
      inputSchema: schemas.swapArgs,
      execute: async (args: { fromMint: string; toMint: string; amount: number; slippageBps?: number }) => {
        const w = requireWallet()
        const status = await w.status()
        if (!status.pubkey) throw new Error('Wallet has no pubkey — initialize it first.')
        const built = await gateway.swapBuild({
          fromMint: args.fromMint,
          toMint: args.toMint,
          amount: args.amount,
          slippageBps: args.slippageBps ?? defaultSlippage,
          owner: status.pubkey,
        })
        const signed = await w.signMessage(built.messageBase58)
        return gateway.submit({
          messageBase58: built.messageBase58,
          signature: signed.signature,
          signerPubkey: signed.pubkey,
        })
      },
    },

    solana_sign_message: {
      description: 'Sign a serialized base58 Solana message with the active wallet.',
      inputSchema: schemas.signArgs,
      execute: async (args: { messageBase58: string }) =>
        requireWallet().signMessage(args.messageBase58),
    },
  }

  return tools
}

/** Read-only subset — useful when no wallet is connected (chat surfaces, research). */
export function solanaGatewayTools(gateway: GatewayLike): Record<string, Tool> {
  return {
    solana_health: {
      description: 'Check the OpenClawd Gateway is reachable.',
      inputSchema: schemas.noArgs,
      execute: async () => gateway.health(),
    },
    solana_token_overview: {
      description: 'Get live price, market cap, liquidity, and 24h delta for a Solana SPL token.',
      inputSchema: schemas.mintArg,
      execute: async (args: { mint: string }) => gateway.tokenOverview(args.mint),
    },
    solana_portfolio: {
      description: 'Fetch the SOL balance and SPL holdings for any wallet by base58 address.',
      inputSchema: { ...schemas.ownerArg, required: ['owner'] },
      execute: async (args: { owner: string }) => gateway.portfolio(args.owner),
    },
  }
}
