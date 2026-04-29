/**
 * JupiterService — Solana DEX aggregator (jup.ag) wrapper.
 *
 * Quote-only by default (no transaction signing). Building swap
 * transactions is exposed but each agent must hand the resulting
 * serialized message to its own wallet for signing — Jupiter never
 * sees a private key.
 */

const JUP_QUOTE_BASE = 'https://quote-api.jup.ag/v6'

export interface JupiterQuote {
  inputMint: string
  outputMint: string
  inAmount: string
  outAmount: string
  otherAmountThreshold: string
  swapMode: 'ExactIn' | 'ExactOut'
  slippageBps: number
  priceImpactPct: string
  routePlan: Array<{
    swapInfo: {
      ammKey: string
      label?: string
      inputMint: string
      outputMint: string
      inAmount: string
      outAmount: string
      feeAmount: string
      feeMint: string
    }
    percent: number
  }>
  contextSlot?: number
  timeTaken?: number
}

export interface QuoteOptions {
  slippageBps?: number          // default 100 (1%)
  swapMode?: 'ExactIn' | 'ExactOut'
  onlyDirectRoutes?: boolean
  maxAccounts?: number
  dexes?: string[]
  excludeDexes?: string[]
}

export interface SwapBuildOptions {
  userPublicKey: string
  quote: JupiterQuote
  wrapAndUnwrapSol?: boolean
  prioritizationFeeLamports?: number | 'auto'
  computeUnitPriceMicroLamports?: number | 'auto'
  asLegacyTransaction?: boolean
}

export interface SwapBuildResult {
  swapTransaction: string       // base64-encoded transaction
  lastValidBlockHeight: number
  prioritizationFeeLamports?: number
}

export class JupiterService {
  /**
   * Get an indicative quote for swapping `inputMint` → `outputMint`.
   * Amount is in raw (token-decimals-aware) units.
   */
  async quote(
    inputMint: string,
    outputMint: string,
    amount: string | bigint | number,
    opts: QuoteOptions = {},
  ): Promise<JupiterQuote> {
    const url = new URL(`${JUP_QUOTE_BASE}/quote`)
    url.searchParams.set('inputMint', inputMint)
    url.searchParams.set('outputMint', outputMint)
    url.searchParams.set('amount', String(amount))
    url.searchParams.set('slippageBps', String(opts.slippageBps ?? 100))
    if (opts.swapMode) url.searchParams.set('swapMode', opts.swapMode)
    if (opts.onlyDirectRoutes) url.searchParams.set('onlyDirectRoutes', 'true')
    if (opts.maxAccounts) url.searchParams.set('maxAccounts', String(opts.maxAccounts))
    if (opts.dexes?.length) url.searchParams.set('dexes', opts.dexes.join(','))
    if (opts.excludeDexes?.length) url.searchParams.set('excludeDexes', opts.excludeDexes.join(','))

    const res = await fetch(url, { headers: { accept: 'application/json' } })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`Jupiter quote ${res.status}: ${body.slice(0, 200)}`)
    }
    return (await res.json()) as JupiterQuote
  }

  /**
   * Build a swap transaction message from a quote. The result is a
   * base64-encoded VersionedTransaction the caller signs and submits.
   */
  async buildSwap(opts: SwapBuildOptions): Promise<SwapBuildResult> {
    const res = await fetch(`${JUP_QUOTE_BASE}/swap`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        userPublicKey: opts.userPublicKey,
        quoteResponse: opts.quote,
        wrapAndUnwrapSol: opts.wrapAndUnwrapSol ?? true,
        prioritizationFeeLamports: opts.prioritizationFeeLamports ?? 'auto',
        computeUnitPriceMicroLamports: opts.computeUnitPriceMicroLamports ?? 'auto',
        asLegacyTransaction: opts.asLegacyTransaction ?? false,
      }),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      throw new Error(`Jupiter swap ${res.status}: ${body.slice(0, 200)}`)
    }
    return (await res.json()) as SwapBuildResult
  }

  /** Convenience: fetch a price for `mint` denominated in USDC. */
  async priceUsd(mint: string): Promise<number | null> {
    try {
      const url = new URL('https://api.jup.ag/price/v2')
      url.searchParams.set('ids', mint)
      const res = await fetch(url, { headers: { accept: 'application/json' } })
      if (!res.ok) return null
      const json = (await res.json()) as {
        data?: Record<string, { price?: number | string }>
      }
      const raw = json.data?.[mint]?.price
      if (raw == null) return null
      return typeof raw === 'string' ? Number.parseFloat(raw) : raw
    } catch {
      return null
    }
  }
}
