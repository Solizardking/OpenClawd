# @autonomy/x402-core

Core types, CAIP-2 chain identifiers, payment schemes, and crypto utilities for the X402 multi-chain payment protocol with bot-aware pricing.

## Features

- ✅ **CAIP-2 Chain Identifiers** - Solana, EVM (Base, Ethereum, Arbitrum), Bitcoin
- ✅ **X402 Payment Types** - PaymentRequired, PaymentSignature, verification/settlement
- ✅ **Bot-Aware Pricing** - Cloudflare bot detection integration
- ✅ **Crypto Utilities** - Ed25519, secp256k1 signature verification
- ✅ **Multi-Chain Support** - Unified types for cross-chain payments

## Installation

```bash
npm install @autonomy/x402-core
# or
pnpm add @autonomy/x402-core
# or
yarn add @autonomy/x402-core
```

## Usage

### Chain Identifiers (CAIP-2)

```typescript
import { CHAINS, parseChainId, isSolanaChain } from '@autonomy/x402-core';

// Use predefined chains
const chain = CHAINS.SOLANA_MAINNET;
// => 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp'

// Parse chain ID
const parsed = parseChainId(chain);
// => { namespace: 'solana', reference: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp' }

// Check chain type
if (isSolanaChain(chain)) {
  console.log('This is a Solana chain');
}
```

### Payment Protocol

```typescript
import {
  PaymentScheme,
  createPaymentPayload,
  serializePaymentPayload
} from '@autonomy/x402-core';

// Create payment payload
const payload = createPaymentPayload(
  0.001,                               // amount in token units
  'recipientWalletAddress',
  CHAINS.SOLANA_MAINNET,
  '/api/data',                         // endpoint
  'USDC',                              // token symbol
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' // token mint
);

// Serialize for signing
const message = serializePaymentPayload(payload);

// Sign with wallet (implementation varies by chain)
const signature = await wallet.signMessage(message);
```

### Bot-Aware Pricing

```typescript
import {
  BotCategory,
  STANDARD_BOT_PRICING,
  type BotPricingResult
} from '@autonomy/x402-core';

// Get pricing tier for bot category
const tier = STANDARD_BOT_PRICING[BotCategory.VERIFIED_BOT];

// Calculate final price
const basePrice = 0.001;
const finalPrice = basePrice * tier.baseMultiplier;
// => 0.0015 (50% premium for verified bots)
```

### Signature Verification

```typescript
import { verifyPaymentSignature, getSignatureTypeForChain } from '@autonomy/x402-core';

// Get signature type for chain
const signatureType = getSignatureTypeForChain(CHAINS.SOLANA_MAINNET);
// => 'ed25519'

// Verify signature
const isValid = await verifyPaymentSignature(
  payload,
  signature,
  publicKey,
  signatureType
);
```

## API Reference

### Types

#### Chains
- `ChainId` - CAIP-2 chain identifier type
- `ChainNamespace` - `'solana' | 'eip155' | 'bip122'`
- `ChainMetadata` - Chain information (name, RPC URLs, explorer, etc.)
- `ParsedChainId` - Parsed namespace and reference

#### Payment
- `PaymentScheme` - `'exact' | 'range' | 'subscription' | 'tiered'`
- `PaymentToken` - Token information (symbol, mint/contract, decimals)
- `PaymentRequired` - 402 response header format
- `PaymentSignature` - Signed payment with payload
- `PaymentSignaturePayload` - Data to be signed
- `PaymentVerificationRequest/Response` - Facilitator verification
- `PaymentSettlementRequest/Response` - On-chain settlement
- `PaymentReceipt` - Audit trail record
- `X402Error` - Error with code and details

#### Bot Pricing
- `BotCategory` - `'human' | 'verified_bot' | 'likely_automated' | 'automated' | 'unknown'`
- `BotInfo` - Bot detection info from Cloudflare
- `BotPricingTier` - Category pricing configuration
- `BotPricingResult` - Calculated pricing result
- `BotAccessRule` - Endpoint-specific bot rules
- `BotRateLimit` - Rate limits per category
- `BotAnalytics` - Analytics summary

### Constants

```typescript
// Predefined chains
CHAINS.SOLANA_MAINNET
CHAINS.SOLANA_DEVNET
CHAINS.BASE_MAINNET
CHAINS.ETHEREUM_MAINNET
CHAINS.BITCOIN_MAINNET
// ... and more

// Chain metadata
CHAIN_METADATA[CHAINS.SOLANA_MAINNET]
// => { name, nativeCurrency, rpcUrls, blockExplorerUrls, testnet }

// Standard bot pricing
STANDARD_BOT_PRICING[BotCategory.HUMAN]
// => { baseMultiplier: 1.0, requiresVerification: false, ... }

// Standard rate limits
STANDARD_BOT_RATE_LIMITS[BotCategory.VERIFIED_BOT]
// => { requestsPerMinute: 500, requestsPerDay: 50000, ... }
```

### Utilities

#### CAIP Utilities
```typescript
parseChainId(chainId: ChainId): ParsedChainId
formatChainId(namespace: ChainNamespace, reference: string): ChainId
parseAccountId(accountId: string): ParsedAccountId
formatAccountId(chainId: ChainId, address: string): string
matchesChainPattern(chainId: ChainId, pattern: string): boolean
isSolanaChain(chainId: ChainId): boolean
isEvmChain(chainId: ChainId): boolean
isBitcoinChain(chainId: ChainId): boolean
normalizeAddress(address: string, chainId: ChainId): string
```

#### Crypto Utilities
```typescript
createPaymentPayload(...): PaymentSignaturePayload
serializePaymentPayload(payload): string
verifyPaymentSignature(...): Promise<boolean>
verifyEd25519Signature(...): Promise<boolean>
verifySecp256k1Signature(...): Promise<boolean>
getSignatureTypeForChain(chainId: ChainId): SignatureType
generateNonce(): string
hashMessage(message: string): Promise<Uint8Array>
getTokenDecimals(symbol: string, chainId: ChainId): number
formatTokenAmount(amount: number, decimals: number): string
parseTokenAmount(amount: string | number, decimals: number): number
```

## Examples

### Complete Payment Flow

```typescript
import {
  CHAINS,
  createPaymentPayload,
  serializePaymentPayload,
  verifyPaymentSignature,
  getSignatureTypeForChain
} from '@autonomy/x402-core';

// 1. Client creates payment payload
const payload = createPaymentPayload(
  0.001,
  'recipientAddress',
  CHAINS.SOLANA_MAINNET,
  '/api/data',
  'USDC'
);

// 2. Client signs payload
const message = serializePaymentPayload(payload);
const signature = await wallet.signMessage(message);
const publicKey = wallet.publicKey.toBase58();

// 3. Server verifies signature
const signatureType = getSignatureTypeForChain(payload.chainId);
const isValid = await verifyPaymentSignature(
  payload,
  signature,
  publicKey,
  signatureType
);

if (isValid) {
  // Proceed with request
}
```

### Bot-Aware Pricing

```typescript
import {
  BotCategory,
  STANDARD_BOT_PRICING,
  type BotInfo
} from '@autonomy/x402-core';

// Extract bot info from Cloudflare headers (in your API)
const botInfo: BotInfo = {
  score: 1,
  category: BotCategory.VERIFIED_BOT,
  verified: true,
  managed: true,
  tags: ['monitoring'],
  isHuman: false,
  isLikelyBot: true,
  isVerifiedBot: true
};

// Calculate pricing
const basePrice = 0.001;
const tier = STANDARD_BOT_PRICING[botInfo.category];
const finalPrice = basePrice * tier.baseMultiplier;

console.log(`Base: $${basePrice}, Final: $${finalPrice}`);
// => Base: $0.001, Final: $0.0015 (50% premium)
```

## Related Packages

- `@autonomy/x402-facilitator` - Multi-chain payment facilitator (Cloudflare Workers)
- `@autonomy/x402-client` - HTTP client with auto-402 handling
- `@autonomy/x402-agents` - A2A/AP2/UCP agent runtime
- `@autonomy/x402-cli` - CLI for deployment and management

## License

MIT
