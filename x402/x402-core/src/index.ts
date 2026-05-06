/**
 * @autonomy/x402-core
 *
 * Core types, CAIP-2 chain identifiers, payment schemes, and crypto utilities
 * for the X402 multi-chain payment protocol with bot-aware pricing.
 *
 * @package @autonomy/x402-core
 * @version 0.1.0
 * @license MIT
 */

// Export all types
export * from './types';

// Export all utilities
export * from './utils';

// Re-export commonly used items
export {
  CHAINS,
  CHAIN_METADATA,
  type ChainId,
  type ChainMetadata
} from './types/chains';

export {
  PaymentScheme,
  X402ErrorCode,
  X402Error,
  type PaymentRequired,
  type PaymentSignature,
  type PaymentSignaturePayload,
  type PaymentVerificationRequest,
  type PaymentVerificationResponse,
  type PaymentSettlementRequest,
  type PaymentSettlementResponse
} from './types/payment';

export {
  BotCategory,
  STANDARD_BOT_PRICING,
  STANDARD_BOT_RATE_LIMITS,
  type BotInfo,
  type BotPricingResult,
  type BotAccessRule
} from './types/bot-pricing';

export {
  parseChainId,
  formatChainId,
  isSolanaChain,
  isEvmChain,
  isBitcoinChain,
  matchesChainPattern
} from './utils/caip';

export {
  createPaymentPayload,
  serializePaymentPayload,
  verifyPaymentSignature,
  getSignatureTypeForChain,
  generateNonce
} from './utils/crypto';
