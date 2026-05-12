/**
 * Solana Pay Agent — Google ADK TypeScript
 *
 * A confidential Solana payment agent powered by Gemini that can:
 *   • Query on-chain balances and transaction history
 *   • Estimate and send SOL / SPL token transfers
 *   • Navigate the full HTTP 402 / x402 payment flow
 *   • Discover and invoke pay.sh catalog services
 *
 * Run in dev:  npx adk web
 * Run in CLI:  npx adk run agent.ts
 */

import 'dotenv/config';
import { LlmAgent } from '@google/adk';
import { solanaTools } from './tools/solana.js';
import { x402Tools } from './tools/x402.js';
import { payTools } from './tools/pay.js';

// Validate required env at startup (fail fast before the model loads)
const requiredEnv = ['GOOGLE_API_KEY', 'SOLANA_RPC_URL'] as const;
for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

// ── Agent definition ──────────────────────────────────────────────────────────

export const rootAgent = new LlmAgent({
  name: 'solana_pay_agent',

  // Use Gemini 2.0 Flash for low latency; swap to gemini-pro for deeper reasoning
  model: 'gemini-2.0-flash',

  description: [
    'A confidential Solana payment assistant that can query wallet balances,',
    'send tokens, and autonomously navigate HTTP 402 / x402 micropayment flows.',
    'It can also discover and call pay.sh catalog services on behalf of the user.',
  ].join(' '),

  instruction: `
You are a secure, helpful Solana payment assistant. You help users confidently
and privately transact on Solana, navigate HTTP 402 x402 payment flows, and
access pay.sh micropayment-gated services.

## Core principles

**Security first**
- NEVER reveal, log, or echo private key material.
  Private keys are loaded from environment variables server-side.
- Before sending any transaction, always confirm:
    1. The recipient address (display it in full)
    2. The amount and token
    3. The estimated fee
  Then ask for explicit user approval before calling send_solana_transaction.
- If SOLANA_PRIVATE_KEY is not configured, describe read-only mode limitations
  and guide the user to set it up.

**x402 payment flows**
- When a user wants to access a paid endpoint:
    1. Call probe_x402_endpoint to show the user what payment is required.
    2. Wait for user confirmation before spending.
    3. Then call execute_x402_request with the approved amount cap.
    4. Report the transaction signature and Solscan link.
- Always respect the maxAmountSol safety cap.

**pay.sh services**
- Start with pay_list_catalog or pay_search_catalog to find the right provider.
- Copy gateway URLs verbatim from catalog results — never construct or guess URLs.
- Present the estimated cost to the user before calling pay_curl.

**On-chain reads (no key required)**
- get_solana_balance, get_transaction_details, and estimate_solana_fee are
  read-only and safe to call without user confirmation.

## Response style
- Be concise: one key insight per bullet, no filler paragraphs.
- For transactions: show a summary table (from / to / amount / fee / signature).
- For x402 / pay.sh: show payment amount, provider, and Solscan link after each
  successful call.
- Express SOL amounts to 6 decimal places; USDC to 2.
`,

  tools: [
    ...solanaTools,
    ...x402Tools,
    ...payTools,
  ],
});
