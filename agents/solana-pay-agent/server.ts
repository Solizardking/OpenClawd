/**
 * Optional HTTP server mode — run the agent as an x402-gated API endpoint.
 *
 * Any route under /api/* will:
 *   1. Check for a valid X-Payment header
 *   2. Verify on-chain payment via the configured FACILITATOR_URL
 *   3. Forward the request to the ADK agent runner and stream the response
 *
 * This lets external callers pay-per-query against the Solana Pay Agent.
 *
 * Start:  node --experimental-strip-types server.ts
 */

import 'dotenv/config';
import http from 'node:http';
import { rootAgent } from './agent.js';
import { Runner, InMemorySessionService } from '@google/adk';

const PORT = Number(process.env.PORT ?? 8080);
const FACILITATOR_URL = process.env.FACILITATOR_URL ?? '';
const PAYMENT_AMOUNT_LAMPORTS = Number(process.env.X402_PRICE_LAMPORTS ?? 5_000); // ~0.000005 SOL
const TREASURY_ADDRESS = process.env.SOLANA_PUBLIC_KEY ?? '';

// ── ADK runner (one session service for all requests) ─────────────────────
const sessions = new InMemorySessionService();
const runner = new Runner({ agent: rootAgent, sessionService: sessions });

// ── Helpers ────────────────────────────────────────────────────────────────
function send402(res: http.ServerResponse) {
  const paymentRequired = {
    schemes: ['exact'],
    networks: ['solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'],
    amount: PAYMENT_AMOUNT_LAMPORTS,
    token: {
      symbol: 'SOL',
      decimals: 9,
      chainId: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
    },
    payTo: TREASURY_ADDRESS,
    facilitatorUrl: FACILITATOR_URL,
    expiresAt: Math.floor(Date.now() / 1000) + 300, // 5 min window
  };

  const headerValue = Buffer.from(JSON.stringify(paymentRequired)).toString('base64');
  res.writeHead(402, {
    'Content-Type': 'application/json',
    'X-Payment-Required': headerValue,
  });
  res.end(JSON.stringify({ error: 'Payment required', payment: paymentRequired }));
}

async function verifyPayment(xPayment: string): Promise<boolean> {
  if (!FACILITATOR_URL) {
    // Dev mode: skip verification if no facilitator configured
    console.warn('[server] No FACILITATOR_URL set — skipping payment verification (dev mode)');
    return true;
  }
  try {
    const res = await fetch(`${FACILITATOR_URL}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ xPayment }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ── Request handler ────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  // Health check
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', agent: 'solana-pay-agent' }));
    return;
  }

  // Only gate /api/* routes behind x402
  if (req.url?.startsWith('/api/')) {
    const xPayment = req.headers['x-payment'] as string | undefined;

    if (!xPayment) {
      send402(res);
      return;
    }

    const valid = await verifyPayment(xPayment);
    if (!valid) {
      res.writeHead(402, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid or expired payment proof.' }));
      return;
    }
  }

  // Read request body
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk as Buffer);
  }
  const rawBody = Buffer.concat(chunks).toString('utf8');

  let userMessage = '';
  try {
    const parsed = JSON.parse(rawBody);
    userMessage = parsed.message ?? parsed.prompt ?? String(parsed);
  } catch {
    userMessage = rawBody;
  }

  if (!userMessage) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Missing "message" field in request body.' }));
    return;
  }

  // ── Run agent ────────────────────────────────────────────────────────────
  try {
    const sessionId = `http-${Date.now()}`;
    await sessions.createSession({
      appName: 'solana-pay-agent',
      userId: 'http-user',
      sessionId,
    });

    const events = runner.run({
      userId: 'http-user',
      sessionId,
      newMessage: { parts: [{ text: userMessage }], role: 'user' },
    });

    let finalResponse = '';
    for await (const event of events) {
      if (event.isFinalResponse?.()) {
        finalResponse = event.content?.parts?.map((p: any) => p.text).join('') ?? '';
      }
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ response: finalResponse }));
  } catch (err: any) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
});

server.listen(PORT, () => {
  console.log(`[solana-pay-agent] HTTP server listening on port ${PORT}`);
  console.log(`  • x402 price: ${PAYMENT_AMOUNT_LAMPORTS} lamports per /api/* call`);
  console.log(`  • Treasury:   ${TREASURY_ADDRESS || '(not set)'}`);
  console.log(`  • Facilitator: ${FACILITATOR_URL || '(dev mode — verification skipped)'}`);
});
