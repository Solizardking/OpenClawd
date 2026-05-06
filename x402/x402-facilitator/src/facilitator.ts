/**
 * X402 Multi-Chain Facilitator
 * Cloudflare Worker for payment verification and settlement
 */

import {
  type PaymentVerificationRequest,
  type PaymentVerificationResponse,
  type PaymentSettlementRequest,
  type PaymentSettlementResponse,
  type BotInfo,
  BotCategory,
  STANDARD_BOT_PRICING,
  verifyPaymentSignature,
  parseChainId,
  isSolanaChain,
  isEvmChain,
  isBitcoinChain,
  X402ErrorCode,
  X402Error
} from '@autonomy/x402-core';

import { SolanaSettlement } from './chains/solana';
import { EvmSettlement } from './chains/evm';
import { BitcoinSettlement } from './chains/bitcoin';

export interface FacilitatorEnv {
  // KV for storing payment receipts
  RECEIPTS: KVNamespace;

  // RPC URLs
  SOLANA_RPC_URL: string;
  BASE_RPC_URL?: string;
  ETHEREUM_RPC_URL?: string;
  BITCOIN_RPC_URL?: string;

  // Treasury wallets
  SOLANA_TREASURY: string;
  EVM_TREASURY?: string;
  BITCOIN_TREASURY?: string;

  // Environment
  ENVIRONMENT: 'development' | 'production';
}

export class X402Facilitator {
  private solanaSettlement: SolanaSettlement;
  private evmSettlement: EvmSettlement;
  private bitcoinSettlement: BitcoinSettlement;

  constructor(private env: FacilitatorEnv) {
    this.solanaSettlement = new SolanaSettlement(
      env.SOLANA_RPC_URL,
      env.SOLANA_TREASURY
    );

    this.evmSettlement = new EvmSettlement(
      env.BASE_RPC_URL || '',
      env.EVM_TREASURY || ''
    );

    this.bitcoinSettlement = new BitcoinSettlement(
      env.BITCOIN_RPC_URL || '',
      env.BITCOIN_TREASURY || ''
    );
  }

  /**
   * Extract bot information from Cloudflare headers
   */
  extractBotInfo(request: Request): BotInfo {
    const headers = request.headers;

    const botScore = headers.get('cf-bot-score');
    const verifiedBot = headers.get('cf-verified-bot');
    const botManaged = headers.get('cf-bot-managed');
    const botTags = headers.get('cf-bot-tags');

    const score = botScore ? parseInt(botScore, 10) : null;
    const verified = verifiedBot === 'true';
    const managed = botManaged === 'true';
    const tags = botTags ? botTags.split(',').map(t => t.trim()).filter(Boolean) : [];

    // Determine category
    let category: BotCategory;
    if (verified && score === 1) {
      category = BotCategory.VERIFIED_BOT;
    } else if (score === null || score === 0) {
      category = BotCategory.UNKNOWN;
    } else if (score >= 30) {
      category = BotCategory.HUMAN;
    } else if (score >= 2) {
      category = BotCategory.LIKELY_AUTOMATED;
    } else {
      category = BotCategory.AUTOMATED;
    }

    return {
      score,
      category,
      verified,
      managed,
      tags,
      isHuman: score !== null && score >= 30,
      isLikelyBot: score !== null && score < 30,
      isVerifiedBot: verified && score === 1
    };
  }

  /**
   * Calculate bot-aware pricing
   */
  calculateBotAwarePrice(
    basePrice: number,
    botInfo: BotInfo
  ): {
    finalPrice: number;
    multiplier: number;
    allowed: boolean;
    reason?: string;
  } {
    const tier = STANDARD_BOT_PRICING[botInfo.category];

    // Block unverified bots
    if (
      (botInfo.category === BotCategory.LIKELY_AUTOMATED ||
        botInfo.category === BotCategory.AUTOMATED) &&
      !botInfo.verified
    ) {
      return {
        finalPrice: 0,
        multiplier: 0,
        allowed: false,
        reason: 'Automated traffic without verification is not allowed. Register your bot with Web Bot Auth.'
      };
    }

    const finalPrice = basePrice * tier.baseMultiplier;

    return {
      finalPrice,
      multiplier: tier.baseMultiplier,
      allowed: true
    };
  }

  /**
   * Verify payment signature
   */
  async verify(
    request: PaymentVerificationRequest
  ): Promise<PaymentVerificationResponse> {
    const { signature, botInfo } = request;

    try {
      // Calculate bot-aware pricing
      const basePrice = signature.payload.amount;
      const pricing = this.calculateBotAwarePrice(basePrice, botInfo || {
        score: null,
        category: BotCategory.UNKNOWN,
        verified: false,
        managed: false,
        tags: [],
        isHuman: false,
        isLikelyBot: false,
        isVerifiedBot: false
      });

      if (!pricing.allowed) {
        throw new X402Error(
          X402ErrorCode.BOT_ACCESS_DENIED,
          pricing.reason || 'Bot access denied'
        );
      }

      // Verify signature
      const isValid = await verifyPaymentSignature(
        signature.payload,
        signature.signature,
        signature.publicKey,
        signature.signatureType
      );

      if (!isValid) {
        throw new X402Error(
          X402ErrorCode.INVALID_SIGNATURE,
          'Payment signature verification failed'
        );
      }

      // Validate payment amount covers the bot-adjusted price.
      // The payer signs the amount they're willing to pay (which should already
      // include any bot multiplier). We verify it meets the minimum required.
      if (signature.payload.amount < pricing.finalPrice) {
        throw new X402Error(
          X402ErrorCode.INSUFFICIENT_AMOUNT,
          `Insufficient payment: minimum required ${pricing.finalPrice}, got ${signature.payload.amount}`
        );
      }

      // Generate receipt
      const receipt = `x402_${Date.now()}_${Math.random().toString(36).substring(2)}`;

      // Store receipt in KV
      await this.env.RECEIPTS.put(
        receipt,
        JSON.stringify({
          signature,
          botInfo,
          pricing,
          timestamp: Date.now(),
          verified: true,
          settled: false
        }),
        { expirationTtl: 3600 } // 1 hour expiration
      );

      return {
        valid: true,
        receipt,
        finalAmount: pricing.finalPrice,
        category: botInfo?.category
      };
    } catch (error) {
      if (error instanceof X402Error) {
        return {
          valid: false,
          error: error.message
        };
      }

      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Verification failed'
      };
    }
  }

  /**
   * Settle payment on-chain
   */
  async settle(
    request: PaymentSettlementRequest
  ): Promise<PaymentSettlementResponse> {
    const { signature, receipt } = request;

    try {
      // Verify receipt exists
      const receiptData = await this.env.RECEIPTS.get(receipt);
      if (!receiptData) {
        throw new X402Error(
          X402ErrorCode.EXPIRED_PAYMENT,
          'Payment receipt not found or expired'
        );
      }

      const receiptObj = JSON.parse(receiptData);

      // Check if already settled
      if (receiptObj.settled) {
        return {
          success: true,
          txHash: receiptObj.txHash,
          status: 'confirmed',
          explorerUrl: receiptObj.explorerUrl
        };
      }

      // Parse chain ID
      const { namespace } = parseChainId(signature.payload.chainId);

      // Route to appropriate chain settlement
      let txHash: string;
      let explorerUrl: string;

      if (isSolanaChain(signature.payload.chainId)) {
        const result = await this.solanaSettlement.settle(signature);
        txHash = result.txHash;
        explorerUrl = result.explorerUrl;
      } else if (isEvmChain(signature.payload.chainId)) {
        const result = await this.evmSettlement.settle(signature);
        txHash = result.txHash;
        explorerUrl = result.explorerUrl;
      } else if (isBitcoinChain(signature.payload.chainId)) {
        const result = await this.bitcoinSettlement.settle(signature);
        txHash = result.txHash;
        explorerUrl = result.explorerUrl;
      } else {
        throw new X402Error(
          X402ErrorCode.UNSUPPORTED_CHAIN,
          `Unsupported chain namespace: ${namespace}`
        );
      }

      // Update receipt as settled
      await this.env.RECEIPTS.put(
        receipt,
        JSON.stringify({
          ...receiptObj,
          settled: true,
          txHash,
          explorerUrl,
          settledAt: Date.now()
        }),
        { expirationTtl: 86400 } // Keep for 24 hours
      );

      return {
        success: true,
        txHash,
        explorerUrl,
        status: 'confirmed'
      };
    } catch (error) {
      if (error instanceof X402Error) {
        return {
          success: false,
          status: 'failed',
          error: error.message
        };
      }

      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Settlement failed'
      };
    }
  }
}
