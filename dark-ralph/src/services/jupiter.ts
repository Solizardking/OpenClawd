// ═══════════════════════════════════════════════════════════════════════════════
// DARK RALPH TUI - Jupiter Swap API Service
// Real swap execution via Jupiter /order + /execute (Meta-Aggregator)
// Docs: https://dev.jup.ag/docs/swap/order-and-execute
// ═══════════════════════════════════════════════════════════════════════════════

import {
  Connection,
  Keypair,
  PublicKey,
  VersionedTransaction,
} from '@solana/web3.js';
import { getMint } from '@solana/spl-token';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface JupiterOrderRequest {
  inputMint: string;
  outputMint: string;
  amount: string | number;
  taker: string;
  slippageBps?: number;
  receiver?: string;
  referralAccount?: string;
  referralFee?: number;
  payer?: string;
  excludeRouters?: string;
}

export interface JupiterOrderResponse {
  transaction: string | null;
  requestId: string;
  outAmount: string;
  router: 'iris' | 'jupiterz' | 'dflow' | 'okx' | string;
  mode: 'ultra' | 'manual' | string;
  feeBps: number;
  feeMint: string;
  inputMint?: string;
  outputMint?: string;
  inAmount?: string;
  slippageBps?: number;
}

export interface JupiterExecuteRequest {
  signedTransaction: string;
  requestId: string;
  lastValidBlockHeight?: number;
}

export interface JupiterExecuteResponse {
  status: 'Success' | 'Failed' | string;
  signature?: string;
  code?: number;
  inputAmountResult?: string;
  outputAmountResult?: string;
  error?: string;
}

export interface JupiterSwapResult {
  ok: boolean;
  signature?: string;
  router?: string;
  inputAmount?: string;
  outputAmount?: string;
  requestId?: string;
  error?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Common Solana token mints — used to resolve symbols like "SOL"/"USDC"
// ─────────────────────────────────────────────────────────────────────────────

export const TOKEN_MINTS: Record<string, string> = {
  SOL: 'So11111111111111111111111111111111111111112',
  WSOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  WIF: 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm',
  JUP: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
  JTO: 'jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL',
  PYTH: 'HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3',
  RAY: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
  ORCA: 'orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE',
};

const LAMPORTS_PER_SOL = 1_000_000_000;
const SOL_MINT = TOKEN_MINTS.SOL;

// ─────────────────────────────────────────────────────────────────────────────
// Jupiter Service
// ─────────────────────────────────────────────────────────────────────────────

export class JupiterService {
  private apiKey?: string;
  private baseUrl = 'https://api.jup.ag/swap/v2';
  private connection?: Connection;
  private decimalsCache = new Map<string, number>();

  constructor(apiKey?: string, connection?: Connection) {
    this.apiKey = apiKey;
    this.connection = connection;
    // Pre-seed common decimals so swaps work even when only an RPC-less call is made
    this.decimalsCache.set(TOKEN_MINTS.SOL, 9);
    this.decimalsCache.set(TOKEN_MINTS.USDC, 6);
    this.decimalsCache.set(TOKEN_MINTS.USDT, 6);
    this.decimalsCache.set(TOKEN_MINTS.BONK, 5);
    this.decimalsCache.set(TOKEN_MINTS.WIF, 6);
    this.decimalsCache.set(TOKEN_MINTS.JUP, 6);
    this.decimalsCache.set(TOKEN_MINTS.JTO, 9);
    this.decimalsCache.set(TOKEN_MINTS.PYTH, 6);
    this.decimalsCache.set(TOKEN_MINTS.RAY, 6);
    this.decimalsCache.set(TOKEN_MINTS.ORCA, 6);
  }

  setConnection(connection: Connection): void {
    this.connection = connection;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Symbol / mint helpers
  // ─────────────────────────────────────────────────────────────────────────────

  static resolveMint(symbolOrMint: string): string {
    const trimmed = symbolOrMint.trim();
    const upper = trimmed.toUpperCase();
    return TOKEN_MINTS[upper] ?? trimmed;
  }

  async getDecimals(mint: string): Promise<number> {
    const cached = this.decimalsCache.get(mint);
    if (cached !== undefined) return cached;
    if (!this.connection) {
      throw new Error(`Decimals for ${mint} unknown and no RPC connection set`);
    }
    const info = await getMint(this.connection, new PublicKey(mint));
    this.decimalsCache.set(mint, info.decimals);
    return info.decimals;
  }

  // Convert a UI-friendly amount (e.g. 1.5) to base units (e.g. 1500000000 lamports)
  async toBaseUnits(mint: string, uiAmount: number): Promise<bigint> {
    const decimals = await this.getDecimals(mint);
    // Use string math to avoid float precision loss
    const [whole, frac = ''] = uiAmount.toString().split('.');
    const fracPadded = (frac + '0'.repeat(decimals)).slice(0, decimals);
    return BigInt(whole + fracPadded);
  }

  async fromBaseUnits(mint: string, baseAmount: string | bigint | number): Promise<number> {
    const decimals = await this.getDecimals(mint);
    const big = typeof baseAmount === 'bigint' ? baseAmount : BigInt(String(baseAmount));
    const divisor = 10 ** decimals;
    return Number(big) / divisor;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Low-level REST: GET /order
  // ─────────────────────────────────────────────────────────────────────────────

  async getOrder(req: JupiterOrderRequest): Promise<JupiterOrderResponse> {
    const params = new URLSearchParams({
      inputMint: req.inputMint,
      outputMint: req.outputMint,
      amount: String(req.amount),
      taker: req.taker,
    });
    if (req.slippageBps !== undefined) params.set('slippageBps', String(req.slippageBps));
    if (req.receiver) params.set('receiver', req.receiver);
    if (req.referralAccount) params.set('referralAccount', req.referralAccount);
    if (req.referralFee !== undefined) params.set('referralFee', String(req.referralFee));
    if (req.payer) params.set('payer', req.payer);
    if (req.excludeRouters) params.set('excludeRouters', req.excludeRouters);

    const url = `${this.baseUrl}/order?${params.toString()}`;
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (this.apiKey) headers['x-api-key'] = this.apiKey;

    const response = await fetch(url, { method: 'GET', headers });
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`Jupiter /order ${response.status}: ${text || response.statusText}`);
    }
    return JSON.parse(text) as JupiterOrderResponse;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Low-level REST: POST /execute
  // ─────────────────────────────────────────────────────────────────────────────

  async executeOrder(req: JupiterExecuteRequest): Promise<JupiterExecuteResponse> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (this.apiKey) headers['x-api-key'] = this.apiKey;

    const response = await fetch(`${this.baseUrl}/execute`, {
      method: 'POST',
      headers,
      body: JSON.stringify(req),
    });
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`Jupiter /execute ${response.status}: ${text || response.statusText}`);
    }
    return JSON.parse(text) as JupiterExecuteResponse;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // High-level: full swap (quote → sign → execute)
  // ─────────────────────────────────────────────────────────────────────────────

  async swap(params: {
    inputMint: string;
    outputMint: string;
    uiAmount: number;
    keypair: Keypair;
    slippageBps?: number;
  }): Promise<JupiterSwapResult> {
    try {
      const inputMint = JupiterService.resolveMint(params.inputMint);
      const outputMint = JupiterService.resolveMint(params.outputMint);
      const baseAmount = await this.toBaseUnits(inputMint, params.uiAmount);

      const order = await this.getOrder({
        inputMint,
        outputMint,
        amount: baseAmount.toString(),
        taker: params.keypair.publicKey.toBase58(),
        slippageBps: params.slippageBps,
      });

      if (!order.transaction) {
        return {
          ok: false,
          requestId: order.requestId,
          error: 'Jupiter returned no transaction (taker may be missing or route unavailable)',
        };
      }

      const txBuffer = Buffer.from(order.transaction, 'base64');
      const tx = VersionedTransaction.deserialize(txBuffer);
      tx.sign([params.keypair]);
      const signedTransaction = Buffer.from(tx.serialize()).toString('base64');

      const result = await this.executeOrder({
        signedTransaction,
        requestId: order.requestId,
      });

      const ok = result.status === 'Success' && (result.code === 0 || result.code === undefined);
      return {
        ok,
        signature: result.signature,
        router: order.router,
        inputAmount: result.inputAmountResult ?? baseAmount.toString(),
        outputAmount: result.outputAmountResult ?? order.outAmount,
        requestId: order.requestId,
        error: ok ? undefined : result.error || `status=${result.status} code=${result.code}`,
      };
    } catch (error: any) {
      return { ok: false, error: error?.message || String(error) };
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Quote-only helper: returns expected output without signing/sending
  // ─────────────────────────────────────────────────────────────────────────────

  async quote(params: {
    inputMint: string;
    outputMint: string;
    uiAmount: number;
    taker: string;
    slippageBps?: number;
  }): Promise<{
    inputMint: string;
    outputMint: string;
    inUiAmount: number;
    outUiAmount: number;
    outAmount: string;
    router: string;
    mode: string;
    feeBps: number;
    requestId: string;
  }> {
    const inputMint = JupiterService.resolveMint(params.inputMint);
    const outputMint = JupiterService.resolveMint(params.outputMint);
    const baseAmount = await this.toBaseUnits(inputMint, params.uiAmount);

    const order = await this.getOrder({
      inputMint,
      outputMint,
      amount: baseAmount.toString(),
      taker: params.taker,
      slippageBps: params.slippageBps,
    });

    const outUi = await this.fromBaseUnits(outputMint, order.outAmount);
    return {
      inputMint,
      outputMint,
      inUiAmount: params.uiAmount,
      outUiAmount: outUi,
      outAmount: order.outAmount,
      router: order.router,
      mode: order.mode,
      feeBps: order.feeBps,
      requestId: order.requestId,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Health check (no key required for endpoint reachability)
  // ─────────────────────────────────────────────────────────────────────────────

  async healthCheck(): Promise<boolean> {
    try {
      // 1 SOL → USDC quote with a dummy taker; any 2xx means the API is reachable.
      const dummyTaker = '11111111111111111111111111111111';
      const params = new URLSearchParams({
        inputMint: SOL_MINT,
        outputMint: TOKEN_MINTS.USDC,
        amount: String(LAMPORTS_PER_SOL),
        taker: dummyTaker,
      });
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (this.apiKey) headers['x-api-key'] = this.apiKey;
      const res = await fetch(`${this.baseUrl}/order?${params.toString()}`, { headers });
      return res.ok;
    } catch {
      return false;
    }
  }

  formatAmount(amount: number, maxDecimals = 6): string {
    if (amount >= 1) return amount.toFixed(Math.min(4, maxDecimals));
    if (amount >= 0.01) return amount.toFixed(Math.min(6, maxDecimals));
    return amount.toFixed(maxDecimals);
  }
}

export default JupiterService;
