/**
 * Nous Research Inference API Client
 *
 * OpenAI-compatible API client for Nous Research's inference backend.
 * Supports both API-key auth AND x402 (HTTP 402 Payment Required) protocol.
 *
 * @package @openclawdsolana/nous-x402
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface NousModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  permission?: any[];
}

export interface NousModelsResponse {
  object: string;
  data: NousModel[];
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stop?: string | string[];
  stream?: boolean;
}

export interface ChatCompletionChoice {
  index: number;
  message: ChatMessage;
  finish_reason: 'stop' | 'length' | null;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: ChatCompletionChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * x402 Payment Required response from the server
 * Returned when server sends HTTP 402 with payment headers
 */
export interface X402PaymentRequired {
  schemes: string[];
  networks: string[];
  amount: number | { min: number; max: number } | { amount: number; interval: string };
  token: string;
  payTo: string;
  facilitatorUrl: string;
  nonce?: string;
  expiresAt?: number;
}

/**
 * Payment signature payload to sign with wallet
 */
export interface PaymentPayload {
  amount: number;
  recipient: string;
  token: string;
  chainId: string;
  nonce: string;
  timestamp: number;
  endpoint: string;
}

/**
 * Complete payment signature
 */
export interface PaymentSignature {
  payload: PaymentPayload;
  signature: string;    // base64 wallet signature
  publicKey: string;    // wallet public key
  signatureType: 'ed25519' | 'secp256k1' | 'secp256r1';
}

// ─── Constants ───────────────────────────────────────────────────────────────

export const NOUS_API_BASE = 'https://inference-api.nousresearch.com/v1';
export const NOUS_MODELS = {
  HERMES_4_3_36B: 'hermes-4.3-36b',
  HERMES_4_3_70B: 'hermes-4.3-70b',
  HERMES_4_105B: 'hermes-4-105b',
  HERMES_3_405B: 'hermes-3-405b',
  HERMES_3_70B: 'hermes-3-70b',
} as const;

// ─── Price Cache ─────────────────────────────────────────────────────────────

interface CachedPrice {
  price: number;
  timestamp: number;
}

let cachedUsdcPrice: CachedPrice | null = null;

/**
 * Get current SOL/USDC price from Jupiter
 */
export async function getSolUsdcPrice(): Promise<number> {
  if (cachedUsdcPrice && Date.now() - cachedUsdcPrice.timestamp < 30_000) {
    return cachedUsdcPrice.price;
  }
  try {
    const res = await fetch(
      'https://api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112',
      { headers: { Accept: 'application/json' } }
    );
    if (!res.ok) throw new Error(`Jupiter price API: ${res.status}`);
    const data = (await res.json()) as any;
    const price = parseFloat(data.data?.So11111111111111111111111111111111111111112?.price ?? '0');
    cachedUsdcPrice = { price, timestamp: Date.now() };
    return price;
  } catch {
    // Fallback to CoinGecko
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd',
      { headers: { Accept: 'application/json' } }
    );
    const data = (await res.json()) as any;
    return data?.solana?.usd ?? 0;
  }
}

// ─── Nous API Client ─────────────────────────────────────────────────────────

export class NousApiClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor(opts?: { baseUrl?: string; apiKey?: string }) {
    this.baseUrl = opts?.baseUrl ?? NOUS_API_BASE;
    this.apiKey = opts?.apiKey;
  }

  /**
   * List available models
   */
  async listModels(): Promise<NousModelsResponse> {
    const res = await fetch(`${this.baseUrl}/models`, {
      headers: this.apiKey
        ? { Authorization: `Bearer ${this.apiKey}` }
        : undefined,
    });
    if (!res.ok) {
      throw new Error(`Nous API /models: ${res.status} ${res.statusText}`);
    }
    return res.json() as Promise<NousModelsResponse>;
  }

  /**
   * Send a chat completion request
   * For standard API-key auth.
   */
  async chatCompletion(req: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    if (!this.apiKey) {
      throw new Error(
        'No API key configured. Use sendWithX402() for x402 payment flow.'
      );
    }
    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(req),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Nous API chat/completions: ${res.status} - ${text}`);
    }
    return res.json() as Promise<ChatCompletionResponse>;
  }

  /**
   * Send a chat completion request using x402 payment protocol.
   *
   * Flow:
   * 1. Send request WITHOUT auth header → server returns HTTP 402
   * 2. Parse PaymentRequired from response headers
   * 3. Sign the payment payload with the Solana wallet
   * 4. Retry with X-PAYMENT header containing the signature
   *
   * @returns The chat completion response
   */
  async sendWithX402(
    req: ChatCompletionRequest,
    signer: (payload: PaymentPayload) => Promise<PaymentSignature>,
  ): Promise<ChatCompletionResponse> {
    // Step 1: Send request without auth to trigger 402
    const initialRes = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });

    if (initialRes.status !== 402) {
      // If we get a successful response directly (shouldn't happen for x402 endpoints)
      if (initialRes.ok) {
        return initialRes.json() as Promise<ChatCompletionResponse>;
      }
      const text = await initialRes.text();
      throw new Error(
        `Nous API: expected 402 for x402 flow, got ${initialRes.status} - ${text}`
      );
    }

    // Step 2: Parse payment requirements from headers
    const paymentRequired = this.parsePaymentRequired(initialRes.headers);
    console.error('[x402] Payment required:', JSON.stringify(paymentRequired, null, 2));

    // Step 3: Construct and sign the payment payload
    const amount = typeof paymentRequired.amount === 'number'
      ? paymentRequired.amount
      : 'min' in paymentRequired
        ? paymentRequired.min
        : paymentRequired.amount;

    const payload: PaymentPayload = {
      amount,
      recipient: paymentRequired.payTo,
      token: paymentRequired.token,
      chainId: paymentRequired.networks[0] ?? 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
      nonce: paymentRequired.nonce ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: Math.floor(Date.now() / 1000),
      endpoint: '/v1/chat/completions',
    };

    const signature = await signer(payload);
    console.error('[x402] Payment signed, retrying request...');

    // Step 4: Retry with payment signature header
    const retryRes = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-PAYMENT': JSON.stringify(signature),
      },
      body: JSON.stringify(req),
    });

    if (!retryRes.ok) {
      const text = await retryRes.text();
      throw new Error(
        `Nous API x402 payment failed: ${retryRes.status} - ${text}`
      );
    }

    return retryRes.json() as Promise<ChatCompletionResponse>;
  }

  /**
   * Parse PaymentRequired from response headers
   */
  private parsePaymentRequired(headers: Headers): X402PaymentRequired {
    // Try multiple possible header names
    const headerNames = [
      'x-payment-required',
      'X-Payment-Required',
      'payment-required',
      'Payment-Required',
    ];

    let raw: string | null = null;
    for (const name of headerNames) {
      raw = headers.get(name);
      if (raw) break;
    }

    if (!raw) {
      // Try to parse from response body if header not found
      throw new Error(
        'No X-Payment-Required header in 402 response. The server may not support x402 for this endpoint.'
      );
    }

    try {
      return JSON.parse(raw) as X402PaymentRequired;
    } catch {
      throw new Error(`Failed to parse PaymentRequired: ${raw}`);
    }
  }
}

// ─── Helper: Fee Estimation ──────────────────────────────────────────────────

/**
 * Estimate the cost (in USD) of a chat completion based on token count.
 * Hermes 4.3 36B: ~$0.50/M input tokens, ~$1.50/M output tokens
 */
export function estimateCost(model: string, inputTokens: number, outputTokens: number): number {
  const rates: Record<string, { input: number; output: number }> = {
    'hermes-4.3-36b': { input: 0.50, output: 1.50 },
    'hermes-4.3-70b': { input: 0.90, output: 2.70 },
    'hermes-4-105b': { input: 1.50, output: 4.50 },
    'hermes-3-405b': { input: 2.50, output: 7.50 },
    'hermes-3-70b': { input: 0.80, output: 2.40 },
  };

  const rate = rates[model] ?? rates['hermes-4.3-36b'];
  const inputCost = (inputTokens / 1_000_000) * rate.input;
  const outputCost = (outputTokens / 1_000_000) * rate.output;
  return inputCost + outputCost;
}
