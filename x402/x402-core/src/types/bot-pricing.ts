/**
 * Bot-Aware Pricing Types
 * Integrates Cloudflare bot detection with X402 payment protocol
 */

/**
 * Bot category classification
 */
export enum BotCategory {
  HUMAN = 'human',                      // Score 30-99
  VERIFIED_BOT = 'verified_bot',        // Score 1 + Web Bot Auth verified
  LIKELY_AUTOMATED = 'likely_automated', // Score 2-29
  AUTOMATED = 'automated',              // Score 1, not verified
  UNKNOWN = 'unknown'                   // Score null/0
}

/**
 * Bot pricing tier
 */
export interface BotPricingTier {
  category: BotCategory;
  baseMultiplier: number;               // Multiply base price (1.0 = 100%)
  requiresVerification: boolean;        // Requires Web Bot Auth
  allowedScoreRange: {
    min: number;
    max: number;
  };
  description: string;
}

/**
 * Standard bot pricing tiers
 */
export const STANDARD_BOT_PRICING: Record<BotCategory, BotPricingTier> = {
  [BotCategory.HUMAN]: {
    category: BotCategory.HUMAN,
    baseMultiplier: 1.0,
    requiresVerification: false,
    allowedScoreRange: { min: 30, max: 99 },
    description: 'Human traffic (normal pricing)'
  },
  [BotCategory.VERIFIED_BOT]: {
    category: BotCategory.VERIFIED_BOT,
    baseMultiplier: 1.5,
    requiresVerification: true,
    allowedScoreRange: { min: 1, max: 1 },
    description: 'Verified bot (50% premium)'
  },
  [BotCategory.LIKELY_AUTOMATED]: {
    category: BotCategory.LIKELY_AUTOMATED,
    baseMultiplier: 0,  // Blocked by default
    requiresVerification: false,
    allowedScoreRange: { min: 2, max: 29 },
    description: 'Likely automated (blocked)'
  },
  [BotCategory.AUTOMATED]: {
    category: BotCategory.AUTOMATED,
    baseMultiplier: 0,  // Blocked by default
    requiresVerification: false,
    allowedScoreRange: { min: 1, max: 1 },
    description: 'Automated bot (blocked)'
  },
  [BotCategory.UNKNOWN]: {
    category: BotCategory.UNKNOWN,
    baseMultiplier: 1.0,
    requiresVerification: false,
    allowedScoreRange: { min: 0, max: 0 },
    description: 'Unknown traffic (normal pricing)'
  }
};

/**
 * Bot information from Cloudflare headers
 */
export interface BotInfo {
  score: number | null;                 // 1-99 (null if not computed)
  category: BotCategory;
  verified: boolean;                    // Web Bot Auth verified
  managed: boolean;                     // Processed by Bot Management
  tags: string[];                       // Bot classification tags
  isHuman: boolean;                     // score >= 30
  isLikelyBot: boolean;                 // score < 30
  isVerifiedBot: boolean;               // verified && score === 1
}

/**
 * Bot pricing calculation result
 */
export interface BotPricingResult {
  basePrice: number;
  finalPrice: number;
  multiplier: number;
  category: BotCategory;
  allowed: boolean;
  reason?: string;
  suggestedAction?: string;
}

/**
 * Bot access rule
 */
export interface BotAccessRule {
  endpointPattern: string;              // Regex or glob pattern
  minBotScore?: number;                 // Minimum score required
  maxBotScore?: number;                 // Maximum score allowed
  requireVerification: boolean;         // Require Web Bot Auth
  customMultiplier?: number;            // Override tier multiplier
  allowedCategories: BotCategory[];     // Allowed categories
}

/**
 * Bot rate limit
 */
export interface BotRateLimit {
  category: BotCategory;
  requestsPerMinute: number;
  requestsPerDay: number;
  burstLimit: number;
}

/**
 * Standard bot rate limits
 */
export const STANDARD_BOT_RATE_LIMITS: Record<BotCategory, BotRateLimit> = {
  [BotCategory.HUMAN]: {
    category: BotCategory.HUMAN,
    requestsPerMinute: 1000,
    requestsPerDay: 100000,
    burstLimit: 2000
  },
  [BotCategory.VERIFIED_BOT]: {
    category: BotCategory.VERIFIED_BOT,
    requestsPerMinute: 500,
    requestsPerDay: 50000,
    burstLimit: 1000
  },
  [BotCategory.LIKELY_AUTOMATED]: {
    category: BotCategory.LIKELY_AUTOMATED,
    requestsPerMinute: 0,
    requestsPerDay: 0,
    burstLimit: 0
  },
  [BotCategory.AUTOMATED]: {
    category: BotCategory.AUTOMATED,
    requestsPerMinute: 0,
    requestsPerDay: 0,
    burstLimit: 0
  },
  [BotCategory.UNKNOWN]: {
    category: BotCategory.UNKNOWN,
    requestsPerMinute: 100,
    requestsPerDay: 10000,
    burstLimit: 200
  }
};

/**
 * Bot analytics summary
 */
export interface BotAnalytics {
  totalRequests: number;
  humanRequests: number;
  botRequests: number;
  verifiedBotRequests: number;
  categoryBreakdown: Record<BotCategory, number>;
  avgBotScore: number | null;
  topEndpoints: Array<{
    endpoint: string;
    requests: number;
    category: BotCategory;
  }>;
  timeRange: {
    start: Date;
    end: Date;
  };
}
