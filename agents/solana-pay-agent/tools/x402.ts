/**
 * x402 (HTTP 402) payment-flow tools for the ADK agent.
 *
 * Implements the full x402 client cycle:
 *   1. Probe an endpoint — receive a 402 with X-Payment-Required header
 *   2. Build a signed Solana payment payload
 *   3. Retry the request with X-Payment header
 *   4. Verify settlement via the facilitator
 *
 * All signing happens server-side using SOLANA_PRIVATE_KEY from env.
 * The LLM only sees payment metadata, never private key material.
 */

import { Connection, PublicKey, Keypair, SystemProgram, Transaction, LAMPORTS_PER_SOL, sendAndConfirmTransaction } from '@solana/web3.js';
import { FunctionTool } from '@google/adk';
import { z } from 'zod';
import nacl from 'tweetnacl';

// ── Helpers ─────────────────────────────────────────────────────────────────

function getConnection(): Connection {
  const rpc = process.env.SOLANA_RPC_URL;
  if (!rpc) throw new Error('SOLANA_RPC_URL not set');
  return new Connection(rpc, 'confirmed');
}

async function loadKeypair(): Promise<Keypair | null> {
  const raw = process.env.SOLANA_PRIVATE_KEY;
  if (!raw) return null;
  const { default: bs58 } = await import('bs58') as any;
  return Keypair.fromSecretKey(bs58.decode(raw));
}

function generateNonce(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Parse the X-Payment-Required header value into a structured object.
 * Header is a base64-encoded JSON blob per the x402 spec.
 */
function parsePaymentRequired(headerValue: string): Record<string, unknown> {
  try {
    const decoded = Buffer.from(headerValue, 'base64').toString('utf8');
    return JSON.parse(decoded);
  } catch {
    // Some implementations send raw JSON instead of base64
    return JSON.parse(headerValue);
  }
}

/**
 * Build the X-Payment header value.
 * The payload is signed with the agent's ed25519 keypair and base64-encoded.
 */
async function buildPaymentHeader(
  paymentRequired: Record<string, unknown>,
  keypair: Keypair,
  endpoint: string
): Promise<string> {
  const nonce = generateNonce();
  const timestamp = Math.floor(Date.now() / 1000);

  const payload = {
    scheme: (paymentRequired.schemes as string[])?.[0] ?? 'exact',
    amount: paymentRequired.amount,
    token: paymentRequired.token,
    payTo: paymentRequired.payTo,
    chainId: (paymentRequired.networks as string[])?.[0] ?? 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
    endpoint,
    nonce,
    timestamp,
    publicKey: keypair.publicKey.toBase58(),
  };

  // Canonical JSON string for signing (sorted keys)
  const sigMsg = JSON.stringify(
    Object.fromEntries(Object.entries(payload).sort(([a], [b]) => a.localeCompare(b)))
  );
  const sigBytes = nacl.sign.detached(new TextEncoder().encode(sigMsg), keypair.secretKey);

  const header = {
    ...payload,
    signature: Buffer.from(sigBytes).toString('hex'),
  };

  return Buffer.from(JSON.stringify(header)).toString('base64');
}

// ── Tool: probe_x402_endpoint ───────────────────────────────────────────────
export const probeX402Endpoint = new FunctionTool({
  name: 'probe_x402_endpoint',
  description: [
    'Sends a HEAD/GET request to an endpoint and returns payment requirements',
    'if the server responds with HTTP 402. Use this before attempting a paid request',
    'so the user can confirm the payment amount.',
  ].join(' '),
  parameters: z.object({
    url: z.string().url().describe('Endpoint URL to probe'),
    method: z.enum(['GET', 'HEAD', 'POST']).default('GET').describe('HTTP method'),
  }),
  execute: async ({ url, method }) => {
    try {
      const res = await fetch(url, { method, headers: { Accept: 'application/json' } });

      if (res.status !== 402) {
        return {
          status: 'no_payment_required',
          httpStatus: res.status,
          message: 'Endpoint does not require payment.',
        };
      }

      const rawHeader =
        res.headers.get('X-Payment-Required') ??
        res.headers.get('x-payment-required');

      if (!rawHeader) {
        return {
          status: 'error',
          error: 'Received 402 but no X-Payment-Required header was present.',
        };
      }

      const requirements = parsePaymentRequired(rawHeader);
      return {
        status: 'payment_required',
        url,
        requirements,
        summary: {
          amount: requirements.amount,
          token: (requirements.token as any)?.symbol ?? 'unknown',
          networks: requirements.networks,
          facilitatorUrl: requirements.facilitatorUrl,
          expiresAt: requirements.expiresAt,
        },
      };
    } catch (err: any) {
      return { status: 'error', error: err.message };
    }
  },
});

// ── Tool: execute_x402_request ─────────────────────────────────────────────
export const executeX402Request = new FunctionTool({
  name: 'execute_x402_request',
  description: [
    'Executes an x402 paid HTTP request end-to-end:',
    '(1) sends the request, (2) if 402 returned, signs a Solana payment,',
    '(3) retries with X-Payment header, (4) returns the response body.',
    'Requires SOLANA_PRIVATE_KEY in env. The user must have already confirmed',
    'the payment amount via probe_x402_endpoint.',
  ].join(' '),
  parameters: z.object({
    url: z.string().url().describe('Endpoint URL to call'),
    method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).default('GET'),
    body: z.record(z.unknown()).optional().describe('Optional JSON request body'),
    headers: z.record(z.string()).optional().describe('Extra HTTP headers'),
    maxAmountSol: z
      .number()
      .positive()
      .optional()
      .describe('Safety cap: refuse payment if amount exceeds this SOL value'),
  }),
  execute: async ({ url, method, body, headers: extraHeaders = {}, maxAmountSol }) => {
    const keypair = await loadKeypair();
    if (!keypair) {
      return {
        status: 'error',
        error: 'No signing key configured. Set SOLANA_PRIVATE_KEY to enable x402 payments.',
      };
    }

    const requestHeaders: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...extraHeaders,
    };

    // ── First attempt (may return 402) ─────────────────────────────────────
    const firstRes = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (firstRes.status !== 402) {
      const text = await firstRes.text();
      return { status: 'success', httpStatus: firstRes.status, body: safeParse(text) };
    }

    // ── Parse payment requirements ────────────────────────────────────────
    const rawHeader =
      firstRes.headers.get('X-Payment-Required') ??
      firstRes.headers.get('x-payment-required');

    if (!rawHeader) {
      return { status: 'error', error: 'Server returned 402 without X-Payment-Required header.' };
    }

    const requirements = parsePaymentRequired(rawHeader);
    const amountRaw = requirements.amount as number;
    const tokenInfo = requirements.token as any;
    const decimals = tokenInfo?.decimals ?? 9;
    const amountHuman = amountRaw / 10 ** decimals;
    const symbol: string = tokenInfo?.symbol ?? 'SOL';

    // ── Safety cap check ──────────────────────────────────────────────────
    if (maxAmountSol !== undefined && symbol === 'SOL' && amountHuman > maxAmountSol) {
      return {
        status: 'payment_rejected',
        reason: `Required payment (${amountHuman} SOL) exceeds your safety cap (${maxAmountSol} SOL).`,
        requirements,
      };
    }

    // ── On-chain settlement (SOL native transfer) ─────────────────────────
    const payTo = requirements.payTo as string;
    let txSignature: string | undefined;

    if (symbol === 'SOL') {
      const conn = getConnection();
      const tx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: keypair.publicKey,
          toPubkey: new PublicKey(payTo),
          lamports: amountRaw,
        })
      );
      txSignature = await sendAndConfirmTransaction(conn, tx, [keypair], {
        commitment: 'confirmed',
      });
    }
    // For SPL tokens, extend here with createTransferInstruction pattern from solana.ts

    // ── Build X-Payment header ────────────────────────────────────────────
    const xPayment = await buildPaymentHeader(requirements, keypair, url);

    // ── Retry with payment proof ──────────────────────────────────────────
    const paidRes = await fetch(url, {
      method,
      headers: {
        ...requestHeaders,
        'X-Payment': xPayment,
        ...(txSignature ? { 'X-Payment-Tx': txSignature } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const responseText = await paidRes.text();
    return {
      status: 'success',
      httpStatus: paidRes.status,
      paymentSettled: true,
      txSignature,
      explorerUrl: txSignature ? `https://solscan.io/tx/${txSignature}` : undefined,
      amountPaid: `${amountHuman} ${symbol}`,
      body: safeParse(responseText),
    };
  },
});

// ── Tool: verify_x402_payment ──────────────────────────────────────────────
export const verifyX402Payment = new FunctionTool({
  name: 'verify_x402_payment',
  description: 'Queries a facilitator endpoint to verify that a payment was successfully settled on-chain.',
  parameters: z.object({
    facilitatorUrl: z.string().url().describe('Facilitator verification endpoint'),
    txSignature: z.string().describe('Solana transaction signature to verify'),
    expectedAmount: z.number().optional().describe('Expected amount in token base units'),
    expectedRecipient: z.string().optional().describe('Expected recipient wallet address'),
  }),
  execute: async ({ facilitatorUrl, txSignature, expectedAmount, expectedRecipient }) => {
    try {
      const body = {
        txSignature,
        ...(expectedAmount !== undefined ? { expectedAmount } : {}),
        ...(expectedRecipient ? { expectedRecipient } : {}),
      };

      const res = await fetch(`${facilitatorUrl}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json() as Record<string, unknown>;
      return {
        status: res.ok ? 'verified' : 'failed',
        httpStatus: res.status,
        facilitatorResponse: data,
        txSignature,
        explorerUrl: `https://solscan.io/tx/${txSignature}`,
      };
    } catch (err: any) {
      return { status: 'error', error: err.message };
    }
  },
});

// ── Tool: check_x402_receipt ───────────────────────────────────────────────
export const checkX402Receipt = new FunctionTool({
  name: 'check_x402_receipt',
  description: 'Looks up a stored payment receipt from the facilitator KV store by transaction signature.',
  parameters: z.object({
    facilitatorUrl: z.string().url().describe('Facilitator base URL'),
    txSignature: z.string().describe('Transaction signature to look up'),
  }),
  execute: async ({ facilitatorUrl, txSignature }) => {
    try {
      const res = await fetch(`${facilitatorUrl}/receipt/${txSignature}`, {
        headers: { Accept: 'application/json' },
      });

      if (res.status === 404) {
        return { status: 'not_found', txSignature };
      }

      const data = await res.json() as Record<string, unknown>;
      return { status: 'found', receipt: data };
    } catch (err: any) {
      return { status: 'error', error: err.message };
    }
  },
});

// ── Utility ──────────────────────────────────────────────────────────────────
function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const x402Tools = [
  probeX402Endpoint,
  executeX402Request,
  verifyX402Payment,
  checkX402Receipt,
];
