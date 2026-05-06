/**
 * X402 Multi-Chain Facilitator - Cloudflare Worker
 * Bot-aware payment verification and settlement
 */

import { X402Facilitator, type FacilitatorEnv } from './facilitator';
import type {
  PaymentVerificationRequest,
  PaymentSettlementRequest
} from '@autonomy/x402-core';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Agent-API-Key, X-Payment-Signature, X-Payment-Receipt, Authorization',
  'Access-Control-Expose-Headers': 'X-Payment-Required, X-Payment-Receipt',
  'Access-Control-Max-Age': '86400'
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}

export default {
  async fetch(
    request: Request,
    env: FacilitatorEnv,
    ctx: ExecutionContext
  ): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Initialize facilitator
    const facilitator = new X402Facilitator(env);

    try {
      // Health check
      if (path === '/health' || path === '/') {
        return jsonResponse({
          success: true,
          service: 'X402 Multi-Chain Facilitator',
          version: '0.1.0',
          environment: env.ENVIRONMENT,
          timestamp: new Date().toISOString(),
          features: {
            chains: ['solana', 'evm', 'bitcoin'],
            botVerification: true,
            botAwarePricing: true,
            multiChainSettlement: true
          },
          endpoints: {
            verify: 'POST /verify',
            settle: 'POST /settle'
          }
        });
      }

      // Verify payment signature
      if (path === '/verify' && request.method === 'POST') {
        // Extract bot info from Cloudflare headers
        const botInfo = facilitator.extractBotInfo(request);

        // Parse request body
        const body = await request.json() as PaymentVerificationRequest;

        // Add bot info to request
        body.botInfo = botInfo;

        // Verify payment
        const result = await facilitator.verify(body);

        return jsonResponse(result, result.valid ? 200 : 400);
      }

      // Settle payment on-chain
      if (path === '/settle' && request.method === 'POST') {
        const body = await request.json() as PaymentSettlementRequest;

        // Settle payment
        const result = await facilitator.settle(body);

        return jsonResponse(result, result.success ? 200 : 400);
      }

      // Get bot info (debugging endpoint)
      if (path === '/bot-info' && request.method === 'GET') {
        const botInfo = facilitator.extractBotInfo(request);
        return jsonResponse({
          success: true,
          botInfo
        });
      }

      return jsonResponse(
        {
          success: false,
          error: 'Not Found'
        },
        404
      );
    } catch (error) {
      console.error('Facilitator error:', error);

      return jsonResponse(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Internal Server Error'
        },
        500
      );
    }
  }
};
