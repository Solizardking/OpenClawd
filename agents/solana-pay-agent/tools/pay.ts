/**
 * pay.sh catalog and gateway tools for the ADK agent.
 *
 * pay.sh is a micropayment gateway that wraps paid HTTP APIs (web search,
 * enrichment, AI generation, blockchain data, etc.) behind HTTP 402 flows.
 * These tools expose catalog discovery and pay-gated curl calls so the
 * agent can autonomously find and invoke services.
 *
 * Gateway URL: https://pay.anthropic.tools (or PAY_GATEWAY_URL env var)
 */

import { FunctionTool } from '@google/adk';
import { z } from 'zod';

// ── Gateway base URL ─────────────────────────────────────────────────────────
function gatewayBase(): string {
  return process.env.PAY_GATEWAY_URL ?? 'https://pay.anthropic.tools';
}

// ── Tool: pay_list_catalog ───────────────────────────────────────────────────
export const payListCatalog = new FunctionTool({
  name: 'pay_list_catalog',
  description: [
    'Lists all available services in the pay.sh catalog.',
    'Use this first to discover what paid APIs are available.',
    'Returns provider FQNs, categories, and brief descriptions.',
  ].join(' '),
  parameters: z.object({
    category: z
      .string()
      .optional()
      .describe('Optional filter category (e.g. "search", "blockchain", "ai")'),
  }),
  execute: async ({ category }) => {
    try {
      const url = new URL(`${gatewayBase()}/catalog`);
      if (category) url.searchParams.set('category', category);

      const res = await fetch(url.toString(), {
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) {
        return { status: 'error', httpStatus: res.status, body: await res.text() };
      }

      const data = await res.json() as Record<string, unknown>;
      return { status: 'success', catalog: data };
    } catch (err: any) {
      return { status: 'error', error: err.message };
    }
  },
});

// ── Tool: pay_search_catalog ─────────────────────────────────────────────────
export const paySearchCatalog = new FunctionTool({
  name: 'pay_search_catalog',
  description: [
    'Searches the pay.sh catalog for services matching a natural-language query.',
    'Returns ranked results with provider FQNs, endpoint descriptions, and pricing.',
    'Use this to find the best provider for a specific task before calling pay_curl.',
  ].join(' '),
  parameters: z.object({
    query: z.string().describe('Natural-language description of the service you need'),
    maxResults: z.number().int().positive().default(5).describe('Max results to return'),
  }),
  execute: async ({ query, maxResults }) => {
    try {
      const res = await fetch(`${gatewayBase()}/catalog/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ query, limit: maxResults }),
      });

      if (!res.ok) {
        return { status: 'error', httpStatus: res.status, body: await res.text() };
      }

      const data = await res.json() as Record<string, unknown>;
      return { status: 'success', results: data };
    } catch (err: any) {
      return { status: 'error', error: err.message };
    }
  },
});

// ── Tool: pay_get_catalog_entry ──────────────────────────────────────────────
export const payGetCatalogEntry = new FunctionTool({
  name: 'pay_get_catalog_entry',
  description: 'Returns full details (schema, pricing, auth requirements) for a specific pay.sh catalog entry by FQN.',
  parameters: z.object({
    fqn: z.string().describe('Fully-qualified provider name (e.g. "exa/search", "helius/rpc")'),
  }),
  execute: async ({ fqn }) => {
    try {
      const res = await fetch(`${gatewayBase()}/catalog/${encodeURIComponent(fqn)}`, {
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) {
        return { status: 'error', httpStatus: res.status, fqn };
      }

      const data = await res.json() as Record<string, unknown>;
      return { status: 'success', entry: data };
    } catch (err: any) {
      return { status: 'error', error: err.message };
    }
  },
});

// ── Tool: pay_curl ───────────────────────────────────────────────────────────
export const payCurl = new FunctionTool({
  name: 'pay_curl',
  description: [
    'Executes an HTTP request through the pay.sh micropayment gateway.',
    'The gateway automatically handles HTTP 402 challenges, paying via the',
    'connected wallet, and retrying the request with a valid payment proof.',
    'Use pay_search_catalog first to find the right endpoint URL.',
    'DO NOT modify gateway URLs returned by catalog tools — copy them verbatim.',
  ].join(' '),
  parameters: z.object({
    url: z.string().url().describe('pay.sh gateway URL (from catalog results — do not guess)'),
    method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).default('GET'),
    headers: z.record(z.string()).optional().describe('Additional HTTP headers'),
    body: z.record(z.unknown()).optional().describe('JSON request body for POST/PUT/PATCH'),
    maxSpendUsd: z
      .number()
      .positive()
      .optional()
      .describe('Safety cap in USD — reject the call if the quoted price exceeds this'),
  }),
  execute: async ({ url, method, headers: extraHeaders = {}, body, maxSpendUsd }) => {
    const walletKey = process.env.SOLANA_PRIVATE_KEY;
    const rpcUrl = process.env.SOLANA_RPC_URL;

    if (!walletKey || !rpcUrl) {
      return {
        status: 'error',
        error: 'SOLANA_PRIVATE_KEY and SOLANA_RPC_URL must be set to use pay.sh.',
      };
    }

    const requestHeaders: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      // Forward wallet public key so the gateway knows which wallet to charge
      'X-Wallet-Pubkey': await derivePublicKey(walletKey),
      'X-Solana-Rpc': rpcUrl,
      ...extraHeaders,
    };

    if (maxSpendUsd !== undefined) {
      requestHeaders['X-Max-Spend-Usd'] = maxSpendUsd.toString();
    }

    try {
      const res = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
      });

      const responseText = await res.text();
      const parsedBody = safeParse(responseText);

      if (!res.ok) {
        return {
          status: 'error',
          httpStatus: res.status,
          body: parsedBody,
        };
      }

      const paymentTx = res.headers.get('X-Payment-Tx');
      const amountCharged = res.headers.get('X-Amount-Charged');

      return {
        status: 'success',
        httpStatus: res.status,
        body: parsedBody,
        ...(paymentTx ? { paymentTx, explorerUrl: `https://solscan.io/tx/${paymentTx}` } : {}),
        ...(amountCharged ? { amountCharged } : {}),
      };
    } catch (err: any) {
      return { status: 'error', error: err.message };
    }
  },
});

// ── Tool: pay_get_balance ────────────────────────────────────────────────────
export const payGetBalance = new FunctionTool({
  name: 'pay_get_balance',
  description: 'Returns the current wallet balance as seen by the pay.sh gateway, along with recent spend history.',
  parameters: z.object({}),
  execute: async () => {
    const pubkey = process.env.SOLANA_PUBLIC_KEY;
    const rpcUrl = process.env.SOLANA_RPC_URL;

    if (!rpcUrl) return { status: 'error', error: 'SOLANA_RPC_URL not set.' };

    try {
      const res = await fetch(`${gatewayBase()}/wallet/balance`, {
        headers: {
          Accept: 'application/json',
          ...(pubkey ? { 'X-Wallet-Pubkey': pubkey } : {}),
          'X-Solana-Rpc': rpcUrl,
        },
      });

      const data = await res.json() as Record<string, unknown>;
      return { status: 'success', balance: data };
    } catch (err: any) {
      return { status: 'error', error: err.message };
    }
  },
});

// ── Utility ──────────────────────────────────────────────────────────────────
async function derivePublicKey(privateKeyBase58: string): Promise<string> {
  const { Keypair } = await import('@solana/web3.js');
  const { default: bs58 } = await import('bs58') as any;
  const keypair = Keypair.fromSecretKey(bs58.decode(privateKeyBase58));
  return keypair.publicKey.toBase58();
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const payTools = [
  payListCatalog,
  paySearchCatalog,
  payGetCatalogEntry,
  payCurl,
  payGetBalance,
];
