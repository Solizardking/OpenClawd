/**
 * X402 Payment Protocol Types
 * HTTP 402 Payment Required standard
 */

import type { ChainId } from './chains';
import type { BotInfo } from './bot-pricing';

/**
 * Payment scheme types
 */
export enum PaymentScheme {
  EXACT = 'exact',              // Exact amount required
  RANGE = 'range',              // Amount within range
  SUBSCRIPTION = 'subscription', // Recurring subscription
  TIERED = 'tiered'             // Usage-based tiers
}

/**
 * Payment token standard
 */
export interface PaymentToken {
  symbol: string;               // Token symbol (SOL, USDC, ETH, etc.)
  mint?: string;                // Token mint address (for SPL tokens)
  contract?: string;            // Token contract (for ERC-20)
  decimals: number;             // Token decimals
  chainId: ChainId;             // CAIP-2 chain identifier
}

/**
 * Payment amount specification
 */
export type PaymentAmount =
  | number                      // Exact amount
  | {                           // Range
      min: number;
      max: number;
    }
  | {                           // Subscription
      amount: number;
      interval: 'daily' | 'weekly' | 'monthly' | 'yearly';
    };

/**
 * X402 Payment Required Header
 * Sent in 402 response
 */
export interface PaymentRequired {
  schemes: PaymentScheme[];     // Supported payment schemes
  networks: ChainId[];          // Supported chains (CAIP-2)
  amount: PaymentAmount;        // Required amount
  token: PaymentToken;          // Payment token
  payTo: string;                // Recipient address
  facilitatorUrl: string;       // Facilitator endpoint for verification
  nonce?: string;               // Optional nonce for replay protection
  expiresAt?: number;           // Unix timestamp when payment expires
  metadata?: Record<string, unknown>; // Additional metadata
}

/**
 * Payment signature payload
 * Signed by payer's wallet
 */
export interface PaymentSignaturePayload {
  amount: number;               // Payment amount
  recipient: string;            // Recipient address
  token: PaymentToken;          // Payment token
  chainId: ChainId;             // Chain identifier
  nonce: string;                // Unique nonce
  timestamp: number;            // Unix timestamp
  endpoint: string;             // API endpoint being paid for
}

/**
 * Payment signature
 * Sent in PAYMENT-SIGNATURE header
 */
export interface PaymentSignature {
  payload: PaymentSignaturePayload;
  signature: string;            // Wallet signature (base64)
  publicKey: string;            // Signer public key
  signatureType: 'ed25519' | 'secp256k1' | 'secp256r1';
}

/**
 * Payment verification request
 * Sent to facilitator /verify endpoint
 */
export interface PaymentVerificationRequest {
  signature: PaymentSignature;
  botInfo?: BotInfo;            // Bot verification info from Cloudflare headers
}

/**
 * Payment verification response
 * Returned by facilitator /verify endpoint
 */
export interface PaymentVerificationResponse {
  valid: boolean;
  receipt?: string;             // Unique receipt ID
  error?: string;               // Error message if invalid
  finalAmount?: number;         // Final amount after bot multiplier
  category?: string;            // Bot category
}

/**
 * Payment settlement request
 * Sent to facilitator /settle endpoint
 */
export interface PaymentSettlementRequest {
  signature: PaymentSignature;
  receipt: string;              // Receipt from verification
}

/**
 * Payment settlement response
 * Returned by facilitator /settle endpoint
 */
export interface PaymentSettlementResponse {
  success: boolean;
  txHash?: string;              // On-chain transaction hash
  explorerUrl?: string;         // Block explorer URL
  status: 'pending' | 'confirmed' | 'failed';
  error?: string;
}

/**
 * Payment receipt
 * Stored for audit trail
 */
export interface PaymentReceipt {
  id: string;                   // Unique receipt ID
  payer: string;                // Payer address
  recipient: string;            // Recipient address
  amount: number;               // Payment amount
  token: PaymentToken;          // Payment token
  chainId: ChainId;             // Chain identifier
  txHash?: string;              // On-chain transaction hash
  endpoint: string;             // API endpoint
  timestamp: number;            // Payment timestamp
  botCategory?: string;         // Bot category
  verified: boolean;            // Verification status
  settled: boolean;             // Settlement status
}

/**
 * X402 error codes
 */
export enum X402ErrorCode {
  INVALID_SIGNATURE = 'invalid_signature',
  INSUFFICIENT_AMOUNT = 'insufficient_amount',
  EXPIRED_PAYMENT = 'expired_payment',
  UNSUPPORTED_CHAIN = 'unsupported_chain',
  UNSUPPORTED_TOKEN = 'unsupported_token',
  BOT_ACCESS_DENIED = 'bot_access_denied',
  SETTLEMENT_FAILED = 'settlement_failed',
  NONCE_REUSED = 'nonce_reused'
}

/**
 * X402 error
 */
export class X402Error extends Error {
  constructor(
    public code: X402ErrorCode,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'X402Error';
  }
}
