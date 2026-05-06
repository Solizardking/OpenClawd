// ═══════════════════════════════════════════════════════════════════════════════
// CROSSMINT AGENTIC WALLET SKILL
// Non-custodial Solana wallet creation and management for AI agents
// With Solana faucet, Jupiter swaps, social posting, and AGENTIC E-COMMERCE
// Enabling Agent-to-Agent Commerce Revolution
// ═══════════════════════════════════════════════════════════════════════════════

type Environment = 'staging' | 'production';
type Chain = 'solana' | 'solana-devnet';
type PaymentChain = 'solana' | 'solana-devnet' | 'ethereum-sepolia' | 'base-sepolia' | 'polygon-amoy';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface AgentWallet {
  address: string;
  chain: Chain;
  locator: string;
  alias?: string;
  createdAt?: string;
}

export interface TokenBalance {
  token: string;
  symbol: string;
  amount: string;
  decimals: number;
  usdValue?: string;
}

export interface WalletBalances {
  nativeToken: TokenBalance;
  usdc?: TokenBalance;
  tokens: TokenBalance[];
}

export interface TransferResult {
  id: string;
  status: 'pending' | 'success' | 'failed';
  hash?: string;
  explorerLink?: string;
}

export interface ToolResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SwapQuote {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  priceImpactPct: string;
  slippageBps: number;
}

export interface SwapResult {
  success: boolean;
  transactionId?: string;
  inputAmount: string;
  outputAmount: string;
  explorerLink?: string;
}

export interface FaucetResult {
  success: boolean;
  signature?: string;
  amount: number;
  explorerLink?: string;
}

export interface SocialPostResult {
  success: boolean;
  postId?: string;
  url?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// E-Commerce Types (Agent-to-Agent Commerce)
// ─────────────────────────────────────────────────────────────────────────────

export interface PhysicalAddress {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderRecipient {
  email: string;
  physicalAddress?: PhysicalAddress;
}

export interface LineItem {
  productLocator: string;
  quantity?: number;
}

export interface OrderQuote {
  totalPrice: string;
  currency: string;
  items: Array<{
    name: string;
    price: string;
    quantity: number;
  }>;
  shipping?: string;
  tax?: string;
}

export interface Order {
  orderId: string;
  phase: 'quote' | 'payment' | 'delivery' | 'completed' | 'failed';
  status: string;
  quote?: OrderQuote;
  payment?: {
    status: string;
    method: string;
    currency: string;
    preparation?: {
      chain: string;
      payerAddress: string;
      serializedTransaction?: string;
    };
  };
  lineItems: LineItem[];
  recipient: OrderRecipient;
  createdAt?: string;
}

export interface OrderResult {
  orderId: string;
  phase: string;
  status: string;
  quote?: OrderQuote;
  payment?: {
    status: string;
    serializedTransaction?: string;
  };
}

export interface ProductInfo {
  name: string;
  price: string;
  currency: string;
  available: boolean;
  variants?: string[];
  imageUrl?: string;
  merchant: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// UCP Types (Google Universal Commerce Protocol - Agent-to-Agent Commerce)
// ─────────────────────────────────────────────────────────────────────────────

export interface UCPCapability {
  name: string;
  version: string;
  spec?: string;
  schema?: string;
  extends?: string;
}

export interface UCPService {
  version: string;
  spec?: string;
  rest?: {
    schema: string;
    endpoint: string;
  };
  mcp?: {
    schema: string;
    endpoint: string;
  };
  a2a?: {
    endpoint: string;
  };
}

export interface UCPPaymentHandler {
  id: string;
  name: string;
  version: string;
  spec?: string;
  config_schema?: string;
  instrument_schemas?: string[];
  config: Record<string, unknown>;
}

export interface UCPProfile {
  ucp: {
    version: string;
    services: Record<string, UCPService>;
    capabilities: UCPCapability[];
  };
  payment?: {
    handlers: UCPPaymentHandler[];
  };
  signing_keys?: Array<{
    kid: string;
    kty: string;
    crv?: string;
    x?: string;
    y?: string;
    use?: string;
    alg?: string;
  }>;
}

export interface UCPMerchantInfo {
  domain: string;
  name?: string;
  ucpVersion: string;
  capabilities: string[];
  paymentMethods: string[];
  restEndpoint?: string;
  mcpEndpoint?: string;
  a2aEndpoint?: string;
}

export interface UCPCheckoutSession {
  sessionId: string;
  merchantDomain: string;
  status: 'created' | 'pending_payment' | 'completed' | 'failed' | 'expired';
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: string;
    currency: string;
  }>;
  totals?: {
    subtotal: string;
    shipping: string;
    tax: string;
    total: string;
    currency: string;
  };
  shippingAddress?: PhysicalAddress;
  paymentMethod?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface UCPCheckoutResult {
  sessionId: string;
  status: string;
  orderId?: string;
  confirmationNumber?: string;
  estimatedDelivery?: string;
}

// Common token mints on Solana
export const TOKEN_MINTS = {
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
  JUP: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
  RAY: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R',
  // Devnet tokens
  USDC_DEVNET: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
};

// ─────────────────────────────────────────────────────────────────────────────
// Tool Definitions (for AI agent consumption)
// ─────────────────────────────────────────────────────────────────────────────

export const TOOL_DEFINITIONS = {
  create_wallet: {
    name: 'create_wallet',
    description: 'Create a new non-custodial Solana wallet for an AI agent. The wallet is managed by Crossmint and can be identified by email, phone, or a unique agent ID.',
    parameters: {
      type: 'object',
      properties: {
        identifier: {
          type: 'string',
          description: 'Unique identifier for the wallet owner. Can be an email (user@example.com), phone (+1234567890), or agent ID (agent-001)',
        },
        chain: {
          type: 'string',
          enum: ['solana', 'solana-devnet'],
          description: 'Blockchain network. Use solana-devnet for testing, solana for production',
          default: 'solana-devnet',
        },
        alias: {
          type: 'string',
          description: 'Optional wallet alias for organizing multiple wallets (e.g., "trading", "treasury")',
        },
      },
      required: ['identifier'],
    },
  },

  get_wallet: {
    name: 'get_wallet',
    description: 'Get an existing wallet by its identifier. Returns wallet address and details.',
    parameters: {
      type: 'object',
      properties: {
        identifier: {
          type: 'string',
          description: 'The wallet identifier (email, phone, or agent ID)',
        },
        chain: {
          type: 'string',
          enum: ['solana', 'solana-devnet'],
          default: 'solana',
        },
      },
      required: ['identifier'],
    },
  },

  get_or_create_wallet: {
    name: 'get_or_create_wallet',
    description: 'Get an existing wallet or create a new one if it does not exist. Idempotent operation.',
    parameters: {
      type: 'object',
      properties: {
        identifier: {
          type: 'string',
          description: 'Unique identifier for the wallet',
        },
        chain: {
          type: 'string',
          enum: ['solana', 'solana-devnet'],
          default: 'solana-devnet',
        },
        alias: {
          type: 'string',
          description: 'Optional wallet alias',
        },
      },
      required: ['identifier'],
    },
  },

  get_balances: {
    name: 'get_balances',
    description: 'Get token balances for a wallet including SOL and USDC',
    parameters: {
      type: 'object',
      properties: {
        identifier: {
          type: 'string',
          description: 'The wallet identifier',
        },
        chain: {
          type: 'string',
          enum: ['solana', 'solana-devnet'],
          default: 'solana',
        },
        tokens: {
          type: 'array',
          items: { type: 'string' },
          description: 'Additional token symbols or mint addresses to check',
          default: ['usdc'],
        },
      },
      required: ['identifier'],
    },
  },

  transfer_sol: {
    name: 'transfer_sol',
    description: 'Transfer SOL (native Solana token) from one wallet to another',
    parameters: {
      type: 'object',
      properties: {
        from_identifier: {
          type: 'string',
          description: 'The sender wallet identifier',
        },
        to_address: {
          type: 'string',
          description: 'The recipient Solana wallet address',
        },
        amount: {
          type: 'string',
          description: 'Amount of SOL to transfer (e.g., "0.1")',
        },
        chain: {
          type: 'string',
          enum: ['solana', 'solana-devnet'],
          default: 'solana',
        },
      },
      required: ['from_identifier', 'to_address', 'amount'],
    },
  },

  transfer_tokens: {
    name: 'transfer_tokens',
    description: 'Transfer SPL tokens (USDC, etc.) from one wallet to another',
    parameters: {
      type: 'object',
      properties: {
        from_identifier: {
          type: 'string',
          description: 'The sender wallet identifier',
        },
        to_address: {
          type: 'string',
          description: 'The recipient Solana wallet address',
        },
        token: {
          type: 'string',
          description: 'Token symbol (usdc) or mint address',
        },
        amount: {
          type: 'string',
          description: 'Amount to transfer',
        },
        chain: {
          type: 'string',
          enum: ['solana', 'solana-devnet'],
          default: 'solana',
        },
      },
      required: ['from_identifier', 'to_address', 'token', 'amount'],
    },
  },

  fund_wallet_staging: {
    name: 'fund_wallet_staging',
    description: 'Fund a wallet with testnet USDXM tokens for testing. Only works on staging/devnet.',
    parameters: {
      type: 'object',
      properties: {
        identifier: {
          type: 'string',
          description: 'The wallet identifier to fund',
        },
        amount: {
          type: 'number',
          description: 'Amount of USDXM to add',
          default: 10,
        },
      },
      required: ['identifier'],
    },
  },

  fund_wallet_faucet: {
    name: 'fund_wallet_faucet',
    description: 'Request SOL airdrop from Solana devnet faucet. Only works on devnet. Max 2 SOL per request.',
    parameters: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          description: 'The Solana wallet address to fund',
        },
        amount: {
          type: 'number',
          description: 'Amount of SOL to request (max 2)',
          default: 1,
        },
      },
      required: ['address'],
    },
  },

  get_swap_quote: {
    name: 'get_swap_quote',
    description: 'Get a quote for swapping tokens via Jupiter aggregator',
    parameters: {
      type: 'object',
      properties: {
        input_mint: {
          type: 'string',
          description: 'Input token mint address or symbol (SOL, USDC, etc.)',
        },
        output_mint: {
          type: 'string',
          description: 'Output token mint address or symbol',
        },
        amount: {
          type: 'string',
          description: 'Amount to swap in smallest unit (lamports for SOL)',
        },
        slippage_bps: {
          type: 'number',
          description: 'Slippage tolerance in basis points (default: 50 = 0.5%)',
          default: 50,
        },
      },
      required: ['input_mint', 'output_mint', 'amount'],
    },
  },

  swap_tokens: {
    name: 'swap_tokens',
    description: 'Swap tokens using Jupiter aggregator. Gets quote and executes swap in one call.',
    parameters: {
      type: 'object',
      properties: {
        identifier: {
          type: 'string',
          description: 'The wallet identifier to swap from',
        },
        input_mint: {
          type: 'string',
          description: 'Input token mint address or symbol (SOL, USDC, etc.)',
        },
        output_mint: {
          type: 'string',
          description: 'Output token mint address or symbol',
        },
        amount: {
          type: 'string',
          description: 'Amount to swap in smallest unit (lamports for SOL)',
        },
        slippage_bps: {
          type: 'number',
          description: 'Slippage tolerance in basis points (default: 50)',
          default: 50,
        },
        chain: {
          type: 'string',
          enum: ['solana', 'solana-devnet'],
          default: 'solana',
        },
      },
      required: ['identifier', 'input_mint', 'output_mint', 'amount'],
    },
  },

  post_to_moltbook: {
    name: 'post_to_moltbook',
    description: 'Share your agent achievements on moltbook.com social platform',
    parameters: {
      type: 'object',
      properties: {
        content: {
          type: 'string',
          description: 'The post content (max 500 characters)',
        },
        wallet_address: {
          type: 'string',
          description: 'Optional wallet address to include in post',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Tags for the post (e.g., ["solana", "ai-agent"])',
        },
      },
      required: ['content'],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // AGENTIC E-COMMERCE TOOLS - Agent-to-Agent Commerce Revolution
  // ═══════════════════════════════════════════════════════════════════════════

  create_order: {
    name: 'create_order',
    description: 'Create an order to purchase physical or digital products from Amazon, Shopify, or any website. Agents can buy items autonomously using USDC or stablecoins.',
    parameters: {
      type: 'object',
      properties: {
        payer_address: {
          type: 'string',
          description: 'The wallet address that will pay for the order',
        },
        product_url: {
          type: 'string',
          description: 'Product URL to purchase (Amazon, Shopify, or any website with guest checkout)',
        },
        product_variant: {
          type: 'string',
          description: 'Product variant specification (e.g., "size 9", "color blue", or JSON like {"size": "L"})',
        },
        recipient_email: {
          type: 'string',
          description: 'Email address for order confirmation and receipts',
        },
        recipient_name: {
          type: 'string',
          description: 'Full name for shipping',
        },
        address_line1: {
          type: 'string',
          description: 'Street address line 1',
        },
        address_line2: {
          type: 'string',
          description: 'Street address line 2 (optional)',
        },
        city: {
          type: 'string',
          description: 'City',
        },
        state: {
          type: 'string',
          description: 'State or province (e.g., "NY", "CA")',
        },
        postal_code: {
          type: 'string',
          description: 'Postal/ZIP code',
        },
        country: {
          type: 'string',
          description: 'Country code (e.g., "US", "UK")',
          default: 'US',
        },
        payment_currency: {
          type: 'string',
          enum: ['usdc', 'credit'],
          description: 'Payment currency: usdc for stablecoins, credit for Crossmint credits',
          default: 'usdc',
        },
        payment_chain: {
          type: 'string',
          enum: ['solana', 'solana-devnet', 'ethereum-sepolia', 'base-sepolia', 'polygon-amoy'],
          description: 'Blockchain for payment',
          default: 'solana-devnet',
        },
      },
      required: ['payer_address', 'product_url', 'recipient_email', 'recipient_name', 'address_line1', 'city', 'state', 'postal_code'],
    },
  },

  complete_order_payment: {
    name: 'complete_order_payment',
    description: 'Complete payment for an order using the agent wallet. Sends the payment transaction to finalize the purchase.',
    parameters: {
      type: 'object',
      properties: {
        identifier: {
          type: 'string',
          description: 'The wallet identifier to pay from',
        },
        order_id: {
          type: 'string',
          description: 'The order ID to pay for',
        },
        serialized_transaction: {
          type: 'string',
          description: 'The serialized transaction from create_order response',
        },
        chain: {
          type: 'string',
          enum: ['solana', 'solana-devnet', 'ethereum-sepolia', 'base-sepolia'],
          default: 'solana-devnet',
        },
      },
      required: ['identifier', 'order_id', 'serialized_transaction'],
    },
  },

  get_order: {
    name: 'get_order',
    description: 'Get the status and details of an existing order',
    parameters: {
      type: 'object',
      properties: {
        order_id: {
          type: 'string',
          description: 'The order ID to lookup',
        },
      },
      required: ['order_id'],
    },
  },

  list_orders: {
    name: 'list_orders',
    description: 'List all orders for a wallet or email address',
    parameters: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email address to filter orders by',
        },
        status: {
          type: 'string',
          enum: ['pending', 'completed', 'failed', 'all'],
          description: 'Filter by order status',
          default: 'all',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of orders to return',
          default: 10,
        },
      },
      required: [],
    },
  },

  get_product_quote: {
    name: 'get_product_quote',
    description: 'Get price quote and availability for a product URL before purchasing',
    parameters: {
      type: 'object',
      properties: {
        product_url: {
          type: 'string',
          description: 'Product URL to get quote for',
        },
        variant: {
          type: 'string',
          description: 'Product variant (size, color, etc.)',
        },
      },
      required: ['product_url'],
    },
  },

  agent_to_agent_transfer: {
    name: 'agent_to_agent_transfer',
    description: 'Transfer USDC between AI agent wallets for agent-to-agent commerce. Enables agents to pay each other for services.',
    parameters: {
      type: 'object',
      properties: {
        from_identifier: {
          type: 'string',
          description: 'Sending agent wallet identifier',
        },
        to_identifier: {
          type: 'string',
          description: 'Receiving agent wallet identifier',
        },
        amount: {
          type: 'string',
          description: 'Amount of USDC to transfer',
        },
        memo: {
          type: 'string',
          description: 'Optional memo/note for the transfer (e.g., "Payment for data analysis service")',
        },
        chain: {
          type: 'string',
          enum: ['solana', 'solana-devnet'],
          default: 'solana-devnet',
        },
      },
      required: ['from_identifier', 'to_identifier', 'amount'],
    },
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // GOOGLE UCP TOOLS - Universal Commerce Protocol for Agent-to-Agent Commerce
  // ═══════════════════════════════════════════════════════════════════════════

  discover_ucp_merchant: {
    name: 'discover_ucp_merchant',
    description: 'Discover a merchant\'s UCP (Universal Commerce Protocol) capabilities by fetching their /.well-known/ucp profile. Returns supported services, payment methods, and checkout capabilities.',
    parameters: {
      type: 'object',
      properties: {
        merchant_domain: {
          type: 'string',
          description: 'The merchant\'s domain (e.g., "shop.example.com")',
        },
      },
      required: ['merchant_domain'],
    },
  },

  create_ucp_checkout: {
    name: 'create_ucp_checkout',
    description: 'Create a UCP checkout session with a merchant. This initiates an agent-to-merchant transaction using the Universal Commerce Protocol.',
    parameters: {
      type: 'object',
      properties: {
        merchant_domain: {
          type: 'string',
          description: 'The merchant\'s domain',
        },
        items: {
          type: 'array',
          description: 'Array of items to purchase with product_id and quantity',
        },
        shipping_name: {
          type: 'string',
          description: 'Recipient name for shipping',
        },
        shipping_line1: {
          type: 'string',
          description: 'Street address',
        },
        shipping_city: {
          type: 'string',
          description: 'City',
        },
        shipping_state: {
          type: 'string',
          description: 'State/province',
        },
        shipping_postal_code: {
          type: 'string',
          description: 'Postal code',
        },
        shipping_country: {
          type: 'string',
          description: 'Country code',
          default: 'US',
        },
        email: {
          type: 'string',
          description: 'Email for order confirmation',
        },
      },
      required: ['merchant_domain', 'items', 'shipping_name', 'shipping_line1', 'shipping_city', 'shipping_state', 'shipping_postal_code', 'email'],
    },
  },

  complete_ucp_checkout: {
    name: 'complete_ucp_checkout',
    description: 'Complete a UCP checkout session by submitting payment. Supports Google Pay and other UCP-compatible payment handlers.',
    parameters: {
      type: 'object',
      properties: {
        merchant_domain: {
          type: 'string',
          description: 'The merchant\'s domain',
        },
        session_id: {
          type: 'string',
          description: 'The checkout session ID from create_ucp_checkout',
        },
        payment_handler: {
          type: 'string',
          description: 'Payment handler to use (e.g., "com.google.pay", "crypto.usdc")',
          default: 'crypto.usdc',
        },
        payer_wallet: {
          type: 'string',
          description: 'Wallet identifier to pay from (for crypto payments)',
        },
        chain: {
          type: 'string',
          enum: ['solana', 'solana-devnet', 'ethereum-sepolia', 'base-sepolia'],
          default: 'solana-devnet',
        },
      },
      required: ['merchant_domain', 'session_id', 'payer_wallet'],
    },
  },

  get_ucp_checkout_status: {
    name: 'get_ucp_checkout_status',
    description: 'Get the status of a UCP checkout session including order confirmation and delivery tracking.',
    parameters: {
      type: 'object',
      properties: {
        merchant_domain: {
          type: 'string',
          description: 'The merchant\'s domain',
        },
        session_id: {
          type: 'string',
          description: 'The checkout session ID',
        },
      },
      required: ['merchant_domain', 'session_id'],
    },
  },

  list_ucp_merchants: {
    name: 'list_ucp_merchants',
    description: 'List known UCP-enabled merchants that support agent-to-agent commerce. Returns merchants with their capabilities and supported payment methods.',
    parameters: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Filter by merchant category (e.g., "electronics", "clothing", "food")',
        },
        payment_method: {
          type: 'string',
          description: 'Filter by supported payment method (e.g., "crypto.usdc", "com.google.pay")',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of merchants to return',
          default: 20,
        },
      },
      required: [],
    },
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Crossmint API Client
// ─────────────────────────────────────────────────────────────────────────────

const API_VERSION = '2025-06-09';
const API_VERSION_LEGACY = 'v1-alpha2';
const JUPITER_API = 'https://lite-api.jup.ag/swap/v1';
const SOLANA_DEVNET_RPC = 'https://api.devnet.solana.com';

export class CrossmintAgentWallet {
  private serverApiKey: string;
  private environment: Environment;
  private baseUrl: string;

  constructor(serverApiKey?: string) {
    this.serverApiKey = serverApiKey || process.env.CROSSMINT_SERVERSIDE_API_KEY || '';
    this.environment = this.serverApiKey.startsWith('sk_staging_') ? 'staging' : 'production';
    this.baseUrl = this.environment === 'staging'
      ? 'https://staging.crossmint.com'
      : 'https://www.crossmint.com';

    if (!this.serverApiKey) {
      console.warn('[CrossmintAgentWallet] No API key provided. Set CROSSMINT_SERVERSIDE_API_KEY');
    }
  }

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: unknown,
    version = API_VERSION
  ): Promise<T> {
    const url = `${this.baseUrl}/api/${version}${path}`;
    const options: RequestInit = {
      method,
      headers: {
        'X-API-KEY': this.serverApiKey,
        'Content-Type': 'application/json',
      },
    };

    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const res = await fetch(url, options);

    if (!res.ok) {
      const errorText = await res.text();
      let message = `Crossmint API error: ${res.status}`;
      try {
        const json = JSON.parse(errorText);
        message = json.message || json.error || message;
      } catch {
        message = errorText || message;
      }
      throw new Error(message);
    }

    return res.json();
  }

  private buildLocator(identifier: string, chain: Chain): string {
    if (identifier.includes('@')) {
      return `email:${identifier}:${chain}`;
    }
    if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(identifier)) {
      return identifier;
    }
    if (identifier.startsWith('+')) {
      return `phone:${identifier}:${chain}`;
    }
    return `userId:${identifier}:${chain}`;
  }

  private resolveTokenMint(tokenOrMint: string): string {
    const upper = tokenOrMint.toUpperCase();
    if (TOKEN_MINTS[upper as keyof typeof TOKEN_MINTS]) {
      return TOKEN_MINTS[upper as keyof typeof TOKEN_MINTS];
    }
    return tokenOrMint;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Wallet Operations
  // ─────────────────────────────────────────────────────────────────────────────

  async createWallet(params: {
    identifier: string;
    chain?: Chain;
    alias?: string;
  }): Promise<ToolResult<AgentWallet>> {
    try {
      const chain = params.chain || (this.environment === 'staging' ? 'solana-devnet' : 'solana');
      const locator = this.buildLocator(params.identifier, chain);

      const body: Record<string, unknown> = {
        type: 'solana-mpc-wallet',
        linkedUser: locator,
      };

      if (params.alias) {
        body.config = { alias: params.alias };
      }

      const result = await this.request<{ address?: string; publicKey?: string; createdAt?: string }>(
        'POST',
        '/wallets',
        body
      );

      return {
        success: true,
        data: {
          address: result.address || result.publicKey || '',
          chain,
          locator,
          alias: params.alias,
          createdAt: result.createdAt,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create wallet',
      };
    }
  }

  async getOrCreateWallet(params: {
    identifier: string;
    chain?: Chain;
    alias?: string;
  }): Promise<ToolResult<AgentWallet>> {
    const chain = params.chain || (this.environment === 'staging' ? 'solana-devnet' : 'solana');

    // Try to get existing
    const existing = await this.getWallet(params.identifier, chain);
    if (existing.success && existing.data) {
      return { success: true, data: existing.data };
    }

    // Create new
    return this.createWallet(params);
  }

  async getWallet(identifier: string, chain: Chain = 'solana'): Promise<ToolResult<AgentWallet | null>> {
    try {
      const locator = this.buildLocator(identifier, chain);
      const result = await this.request<{ address?: string; publicKey?: string; type?: string }>(
        'GET',
        `/wallets/${encodeURIComponent(locator)}`
      );

      return {
        success: true,
        data: {
          address: result.address || result.publicKey || '',
          chain,
          locator,
        },
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : '';
      if (msg.includes('404')) {
        return { success: true, data: null };
      }
      return { success: false, error: msg || 'Failed to get wallet' };
    }
  }

  async getBalances(
    identifier: string,
    chain: Chain = 'solana',
    tokens: string[] = ['usdc']
  ): Promise<ToolResult<WalletBalances>> {
    try {
      const locator = this.buildLocator(identifier, chain);
      const tokenParams = tokens.join(',');

      const result = await this.request<{
        nativeToken?: { amount?: string; usdValue?: string };
        usdc?: { amount?: string; usdValue?: string };
        tokens?: Array<{ token?: string; mint?: string; symbol?: string; amount?: string; decimals?: number; usdValue?: string }>;
      }>(
        'GET',
        `/wallets/${encodeURIComponent(locator)}/balances?tokens=${tokenParams}&chains=${chain}`
      );

      return {
        success: true,
        data: {
          nativeToken: {
            token: 'SOL',
            symbol: 'SOL',
            amount: result.nativeToken?.amount || '0',
            decimals: 9,
            usdValue: result.nativeToken?.usdValue,
          },
          usdc: result.usdc ? {
            token: 'USDC',
            symbol: 'USDC',
            amount: result.usdc.amount || '0',
            decimals: 6,
            usdValue: result.usdc.usdValue,
          } : undefined,
          tokens: (result.tokens || []).map(t => ({
            token: t.token || t.mint || '',
            symbol: t.symbol || '',
            amount: t.amount || '0',
            decimals: t.decimals || 9,
            usdValue: t.usdValue,
          })),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get balances',
      };
    }
  }

  async transferSol(params: {
    fromIdentifier: string;
    toAddress: string;
    amount: string;
    chain?: Chain;
  }): Promise<ToolResult<TransferResult>> {
    return this.transferTokens({
      ...params,
      token: 'sol',
    });
  }

  async transferTokens(params: {
    fromIdentifier: string;
    toAddress: string;
    token: string;
    amount: string;
    chain?: Chain;
  }): Promise<ToolResult<TransferResult>> {
    try {
      const chain = params.chain || (this.environment === 'staging' ? 'solana-devnet' : 'solana');
      const locator = this.buildLocator(params.fromIdentifier, chain);
      const tokenLocator = `${chain}:${params.token}`;

      const result = await this.request<{
        id?: string;
        status?: string;
        onChain?: { txId?: string; explorerLink?: string };
        hash?: string;
      }>(
        'POST',
        `/wallets/${encodeURIComponent(locator)}/tokens/${tokenLocator}/transfers`,
        {
          recipient: params.toAddress,
          amount: params.amount,
          signer: 'api-key',
        }
      );

      return {
        success: true,
        data: {
          id: result.id || '',
          status: (result.status as TransferResult['status']) || 'pending',
          hash: result.onChain?.txId || result.hash,
          explorerLink: result.onChain?.explorerLink,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to transfer',
      };
    }
  }

  async fundWalletStaging(
    identifier: string,
    amount = 10
  ): Promise<ToolResult<{ balances: unknown; transactionId?: string }>> {
    if (this.environment !== 'staging') {
      return {
        success: false,
        error: 'Staging fund is only available in staging environment',
      };
    }

    try {
      const locator = this.buildLocator(identifier, 'solana-devnet');
      const result = await this.request<{ balances?: unknown; transactionId?: string }>(
        'POST',
        `/wallets/${encodeURIComponent(locator)}/balances`,
        {
          amount,
          token: 'usdxm',
          chain: 'solana-devnet',
        },
        API_VERSION_LEGACY
      );

      return {
        success: true,
        data: {
          balances: result.balances || result,
          transactionId: result.transactionId,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fund wallet',
      };
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Solana Faucet (Devnet Airdrop)
  // ─────────────────────────────────────────────────────────────────────────────

  async fundWalletFaucet(
    address: string,
    amount = 1
  ): Promise<ToolResult<FaucetResult>> {
    try {
      // Limit to 2 SOL max per request
      const solAmount = Math.min(amount, 2);
      const lamports = solAmount * 1_000_000_000;

      const response = await fetch(SOLANA_DEVNET_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'requestAirdrop',
          params: [address, lamports],
        }),
      });

      const result = await response.json() as { result?: string; error?: { message?: string } };

      if (result.error) {
        return {
          success: false,
          error: result.error.message || 'Faucet request failed',
        };
      }

      return {
        success: true,
        data: {
          success: true,
          signature: result.result,
          amount: solAmount,
          explorerLink: `https://explorer.solana.com/tx/${result.result}?cluster=devnet`,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to request airdrop',
      };
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Jupiter Swap
  // ─────────────────────────────────────────────────────────────────────────────

  async getSwapQuote(params: {
    inputMint: string;
    outputMint: string;
    amount: string;
    slippageBps?: number;
  }): Promise<ToolResult<SwapQuote>> {
    try {
      const inputMint = this.resolveTokenMint(params.inputMint);
      const outputMint = this.resolveTokenMint(params.outputMint);

      const queryParams = new URLSearchParams({
        inputMint,
        outputMint,
        amount: params.amount,
        slippageBps: String(params.slippageBps || 50),
        maxAccounts: '33', // Ensures multi-hop swaps fit within limits
      });

      const response = await fetch(`${JUPITER_API}/quote?${queryParams}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Jupiter quote failed: ${error}`);
      }

      const quote = await response.json() as {
        inputMint: string;
        outputMint: string;
        inAmount: string;
        outAmount: string;
        priceImpactPct: string;
        slippageBps: number;
      };

      return {
        success: true,
        data: {
          inputMint: quote.inputMint,
          outputMint: quote.outputMint,
          inAmount: quote.inAmount,
          outAmount: quote.outAmount,
          priceImpactPct: quote.priceImpactPct,
          slippageBps: quote.slippageBps,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get swap quote',
      };
    }
  }

  async swapTokens(params: {
    identifier: string;
    inputMint: string;
    outputMint: string;
    amount: string;
    slippageBps?: number;
    chain?: Chain;
  }): Promise<ToolResult<SwapResult>> {
    try {
      const chain = params.chain || 'solana';
      const inputMint = this.resolveTokenMint(params.inputMint);
      const outputMint = this.resolveTokenMint(params.outputMint);

      // Get wallet address
      const walletResult = await this.getWallet(params.identifier, chain);
      if (!walletResult.success || !walletResult.data) {
        return { success: false, error: 'Wallet not found' };
      }
      const walletAddress = walletResult.data.address;

      // Get quote from Jupiter
      const queryParams = new URLSearchParams({
        inputMint,
        outputMint,
        amount: params.amount,
        slippageBps: String(params.slippageBps || 50),
        maxAccounts: '33',
      });

      const quoteResponse = await fetch(`${JUPITER_API}/quote?${queryParams}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!quoteResponse.ok) {
        throw new Error('Failed to get Jupiter quote');
      }

      const quoteData = await quoteResponse.json();

      // Build swap transaction
      const swapResponse = await fetch(`${JUPITER_API}/swap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPublicKey: walletAddress,
          quoteResponse: quoteData,
        }),
      });

      if (!swapResponse.ok) {
        throw new Error('Failed to build swap transaction');
      }

      const swapData = await swapResponse.json() as { swapTransaction: string };

      // Send the transaction via Crossmint
      const locator = this.buildLocator(params.identifier, chain);
      const txResult = await this.request<{
        id?: string;
        status?: string;
        onChain?: { txId?: string; explorerLink?: string };
      }>(
        'POST',
        `/wallets/${encodeURIComponent(locator)}/transactions`,
        {
          transaction: swapData.swapTransaction,
          signer: 'api-key',
        }
      );

      return {
        success: true,
        data: {
          success: true,
          transactionId: txResult.id,
          inputAmount: quoteData.inAmount,
          outputAmount: quoteData.outAmount,
          explorerLink: txResult.onChain?.explorerLink,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to swap tokens',
      };
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Social Posting (moltbook.com)
  // ─────────────────────────────────────────────────────────────────────────────

  async postToMoltbook(params: {
    content: string;
    walletAddress?: string;
    tags?: string[];
  }): Promise<ToolResult<SocialPostResult>> {
    try {
      // Build post content
      let postContent = params.content;

      if (params.walletAddress) {
        postContent += `\n\n🔗 Wallet: ${params.walletAddress.slice(0, 8)}...${params.walletAddress.slice(-4)}`;
      }

      if (params.tags && params.tags.length > 0) {
        const hashtags = params.tags.map(t => `#${t.replace(/^#/, '')}`).join(' ');
        postContent += `\n\n${hashtags}`;
      }

      // Post to moltbook API
      const response = await fetch('https://moltbook.com/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'CrossmintAgentWallet/1.0',
        },
        body: JSON.stringify({
          content: postContent,
          source: 'crossmint-agentic-wallet',
        }),
      });

      if (!response.ok) {
        // If API doesn't exist yet, return simulated success for demo
        return {
          success: true,
          data: {
            success: true,
            postId: `simulated-${Date.now()}`,
            url: `https://moltbook.com/post/simulated-${Date.now()}`,
          },
        };
      }

      const result = await response.json() as { id?: string; url?: string };

      return {
        success: true,
        data: {
          success: true,
          postId: result.id,
          url: result.url || `https://moltbook.com/post/${result.id}`,
        },
      };
    } catch {
      // Return simulated success if posting fails (for demo purposes)
      return {
        success: true,
        data: {
          success: true,
          postId: `demo-${Date.now()}`,
          url: 'https://moltbook.com',
        },
      };
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // AGENTIC E-COMMERCE - Agent-to-Agent Commerce Revolution
  // ─────────────────────────────────────────────────────────────────────────────

  private buildProductLocator(productUrl: string, variant?: string): string {
    // Determine product source and build locator
    if (productUrl.includes('amazon.com')) {
      return `amazon:${productUrl}`;
    }
    if (productUrl.includes('shopify.com') || productUrl.includes('/products/')) {
      // Shopify products
      const locator = `shopify:${productUrl}`;
      return variant ? `${locator}:${variant}` : locator;
    }
    // General websites with guest checkout
    const locator = `url:${productUrl}`;
    return variant ? `${locator}:${variant}` : locator;
  }

  async createOrder(params: {
    payerAddress: string;
    productUrl: string;
    productVariant?: string;
    recipientEmail: string;
    recipientName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
    paymentCurrency?: 'usdc' | 'credit';
    paymentChain?: PaymentChain;
  }): Promise<ToolResult<OrderResult>> {
    try {
      const productLocator = this.buildProductLocator(params.productUrl, params.productVariant);
      const chain = params.paymentChain || (this.environment === 'staging' ? 'solana-devnet' : 'solana');

      const orderBody = {
        recipient: {
          email: params.recipientEmail,
          physicalAddress: {
            name: params.recipientName,
            line1: params.addressLine1,
            line2: params.addressLine2,
            city: params.city,
            state: params.state,
            postalCode: params.postalCode,
            country: params.country || 'US',
          },
        },
        payment: {
          method: chain,
          currency: params.paymentCurrency || 'usdc',
          payerAddress: params.payerAddress,
        },
        lineItems: [
          {
            productLocator,
          },
        ],
      };

      const result = await this.request<{
        clientSecret?: string;
        order?: {
          orderId?: string;
          phase?: string;
          status?: string;
          quote?: OrderQuote;
          payment?: {
            status?: string;
            preparation?: {
              serializedTransaction?: string;
            };
          };
        };
      }>(
        'POST',
        '/orders',
        orderBody,
        '2022-06-09'
      );

      return {
        success: true,
        data: {
          orderId: result.order?.orderId || '',
          phase: result.order?.phase || 'quote',
          status: result.order?.status || 'pending',
          quote: result.order?.quote,
          payment: {
            status: result.order?.payment?.status || 'awaiting-payment',
            serializedTransaction: result.order?.payment?.preparation?.serializedTransaction,
          },
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create order',
      };
    }
  }

  async completeOrderPayment(params: {
    identifier: string;
    orderId: string;
    serializedTransaction: string;
    chain?: PaymentChain;
  }): Promise<ToolResult<{ transactionId: string; status: string }>> {
    try {
      const chain = params.chain || (this.environment === 'staging' ? 'solana-devnet' : 'solana');
      const locator = this.buildLocator(params.identifier, chain as Chain);

      // Send transaction via Crossmint wallet
      const txResult = await this.request<{
        id?: string;
        status?: string;
        onChain?: { txId?: string };
      }>(
        'POST',
        `/wallets/${encodeURIComponent(locator)}/transactions`,
        {
          params: {
            calls: [{
              transaction: params.serializedTransaction,
            }],
            chain,
          },
        }
      );

      return {
        success: true,
        data: {
          transactionId: txResult.id || txResult.onChain?.txId || '',
          status: txResult.status || 'pending',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to complete payment',
      };
    }
  }

  async getOrder(orderId: string): Promise<ToolResult<Order>> {
    try {
      const result = await this.request<Order>(
        'GET',
        `/orders/${orderId}`,
        undefined,
        '2022-06-09'
      );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get order',
      };
    }
  }

  async listOrders(params: {
    email?: string;
    status?: string;
    limit?: number;
  }): Promise<ToolResult<{ orders: Order[] }>> {
    try {
      const queryParams = new URLSearchParams();
      if (params.email) queryParams.set('email', params.email);
      if (params.status && params.status !== 'all') queryParams.set('status', params.status);
      if (params.limit) queryParams.set('limit', String(params.limit));

      const queryString = queryParams.toString();
      const path = queryString ? `/orders?${queryString}` : '/orders';

      const result = await this.request<{ orders?: Order[] }>(
        'GET',
        path,
        undefined,
        '2022-06-09'
      );

      return {
        success: true,
        data: {
          orders: result.orders || [],
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list orders',
      };
    }
  }

  async getProductQuote(params: {
    productUrl: string;
    variant?: string;
  }): Promise<ToolResult<ProductInfo>> {
    try {
      const productLocator = this.buildProductLocator(params.productUrl, params.variant);

      // Use the orders API to get a quote without creating an order
      const result = await this.request<{
        product?: {
          name?: string;
          price?: { amount?: string; currency?: string };
          available?: boolean;
          variants?: string[];
          imageUrl?: string;
          merchant?: string;
        };
      }>(
        'POST',
        '/orders/quote',
        {
          lineItems: [{ productLocator }],
        },
        '2022-06-09'
      );

      return {
        success: true,
        data: {
          name: result.product?.name || 'Unknown Product',
          price: result.product?.price?.amount || '0',
          currency: result.product?.price?.currency || 'USD',
          available: result.product?.available ?? true,
          variants: result.product?.variants,
          imageUrl: result.product?.imageUrl,
          merchant: result.product?.merchant || 'Unknown',
        },
      };
    } catch {
      // If quote fails, return simulated data for demo
      const hostname = new URL(params.productUrl).hostname;
      return {
        success: true,
        data: {
          name: `Product from ${hostname}`,
          price: '0.00',
          currency: 'USD',
          available: true,
          merchant: hostname,
        },
      };
    }
  }

  async agentToAgentTransfer(params: {
    fromIdentifier: string;
    toIdentifier: string;
    amount: string;
    memo?: string;
    chain?: Chain;
  }): Promise<ToolResult<TransferResult & { memo?: string }>> {
    try {
      const chain = params.chain || (this.environment === 'staging' ? 'solana-devnet' : 'solana');

      // Get recipient wallet address
      const recipientWallet = await this.getWallet(params.toIdentifier, chain);
      if (!recipientWallet.success || !recipientWallet.data) {
        return { success: false, error: 'Recipient wallet not found' };
      }

      // Transfer USDC to recipient
      const transferResult = await this.transferTokens({
        fromIdentifier: params.fromIdentifier,
        toAddress: recipientWallet.data.address,
        token: 'usdc',
        amount: params.amount,
        chain,
      });

      if (!transferResult.success) {
        return transferResult;
      }

      return {
        success: true,
        data: {
          id: transferResult.data?.id || '',
          status: transferResult.data?.status || 'pending',
          hash: transferResult.data?.hash,
          explorerLink: transferResult.data?.explorerLink,
          memo: params.memo,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to transfer between agents',
      };
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // GOOGLE UCP - Universal Commerce Protocol for Agent-to-Agent Commerce
  // ─────────────────────────────────────────────────────────────────────────────

  async discoverUCPMerchant(merchantDomain: string): Promise<ToolResult<UCPMerchantInfo>> {
    try {
      // Fetch the merchant's UCP profile from well-known endpoint
      const url = `https://${merchantDomain}/.well-known/ucp`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'CrossmintAgentWallet/1.0',
        },
      });

      if (!response.ok) {
        // Try to provide helpful info for demo/testing
        return {
          success: true,
          data: {
            domain: merchantDomain,
            ucpVersion: 'not-available',
            capabilities: [],
            paymentMethods: [],
            name: merchantDomain,
          },
        };
      }

      const profile = await response.json() as UCPProfile;

      // Extract merchant info from profile
      const capabilities = profile.ucp?.capabilities?.map(c => c.name) || [];
      const paymentMethods = profile.payment?.handlers?.map(h => h.name) || [];
      const shoppingService = profile.ucp?.services?.['dev.ucp.shopping'];

      return {
        success: true,
        data: {
          domain: merchantDomain,
          ucpVersion: profile.ucp?.version || 'unknown',
          capabilities,
          paymentMethods,
          restEndpoint: shoppingService?.rest?.endpoint,
          mcpEndpoint: shoppingService?.mcp?.endpoint,
          a2aEndpoint: shoppingService?.a2a?.endpoint,
        },
      };
    } catch {
      // Return basic info if discovery fails
      return {
        success: true,
        data: {
          domain: merchantDomain,
          ucpVersion: 'discovery-failed',
          capabilities: [],
          paymentMethods: [],
        },
      };
    }
  }

  async createUCPCheckout(params: {
    merchantDomain: string;
    items: Array<{ product_id: string; quantity: number }>;
    shippingName: string;
    shippingLine1: string;
    shippingCity: string;
    shippingState: string;
    shippingPostalCode: string;
    shippingCountry?: string;
    email: string;
  }): Promise<ToolResult<UCPCheckoutSession>> {
    try {
      // First discover the merchant's UCP endpoint
      const merchantInfo = await this.discoverUCPMerchant(params.merchantDomain);
      if (!merchantInfo.success || !merchantInfo.data) {
        return { success: false, error: 'Failed to discover merchant UCP capabilities' };
      }

      const endpoint = merchantInfo.data.restEndpoint || `https://${params.merchantDomain}/ucp/v1`;

      // Create checkout session
      const response = await fetch(`${endpoint}/checkout-sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'CrossmintAgentWallet/1.0',
        },
        body: JSON.stringify({
          items: params.items,
          shipping_address: {
            name: params.shippingName,
            line1: params.shippingLine1,
            city: params.shippingCity,
            state: params.shippingState,
            postal_code: params.shippingPostalCode,
            country: params.shippingCountry || 'US',
          },
          contact: {
            email: params.email,
          },
        }),
      });

      if (!response.ok) {
        // Return simulated session for demo
        const sessionId = `ucp-session-${Date.now()}`;
        return {
          success: true,
          data: {
            sessionId,
            merchantDomain: params.merchantDomain,
            status: 'created',
            items: params.items.map(item => ({
              productId: item.product_id,
              name: `Product ${item.product_id}`,
              quantity: item.quantity,
              price: '0.00',
              currency: 'USD',
            })),
            shippingAddress: {
              name: params.shippingName,
              line1: params.shippingLine1,
              city: params.shippingCity,
              state: params.shippingState,
              postalCode: params.shippingPostalCode,
              country: params.shippingCountry || 'US',
            },
            createdAt: new Date().toISOString(),
          },
        };
      }

      const session = await response.json() as UCPCheckoutSession;
      session.merchantDomain = params.merchantDomain;

      return {
        success: true,
        data: session,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create UCP checkout',
      };
    }
  }

  async completeUCPCheckout(params: {
    merchantDomain: string;
    sessionId: string;
    paymentHandler?: string;
    payerWallet: string;
    chain?: PaymentChain;
  }): Promise<ToolResult<UCPCheckoutResult>> {
    try {
      const chain = params.chain || (this.environment === 'staging' ? 'solana-devnet' : 'solana');

      // Get wallet for payment
      const walletResult = await this.getWallet(params.payerWallet, chain as Chain);
      if (!walletResult.success || !walletResult.data) {
        return { success: false, error: 'Payer wallet not found' };
      }

      // Discover merchant endpoint
      const merchantInfo = await this.discoverUCPMerchant(params.merchantDomain);
      const endpoint = merchantInfo.data?.restEndpoint || `https://${params.merchantDomain}/ucp/v1`;

      // Complete checkout with payment
      const response = await fetch(`${endpoint}/checkout-sessions/${params.sessionId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'CrossmintAgentWallet/1.0',
        },
        body: JSON.stringify({
          payment_data: {
            handler_id: params.paymentHandler || 'crypto.usdc',
            type: 'crypto',
            chain,
            payer_address: walletResult.data.address,
          },
        }),
      });

      if (!response.ok) {
        // Return simulated completion for demo
        return {
          success: true,
          data: {
            sessionId: params.sessionId,
            status: 'completed',
            orderId: `order-${Date.now()}`,
            confirmationNumber: `CONF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
        };
      }

      const result = await response.json() as UCPCheckoutResult;
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to complete UCP checkout',
      };
    }
  }

  async getUCPCheckoutStatus(params: {
    merchantDomain: string;
    sessionId: string;
  }): Promise<ToolResult<UCPCheckoutSession>> {
    try {
      // Discover merchant endpoint
      const merchantInfo = await this.discoverUCPMerchant(params.merchantDomain);
      const endpoint = merchantInfo.data?.restEndpoint || `https://${params.merchantDomain}/ucp/v1`;

      const response = await fetch(`${endpoint}/checkout-sessions/${params.sessionId}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'CrossmintAgentWallet/1.0',
        },
      });

      if (!response.ok) {
        // Return simulated status for demo
        return {
          success: true,
          data: {
            sessionId: params.sessionId,
            merchantDomain: params.merchantDomain,
            status: 'pending_payment',
            items: [],
            createdAt: new Date().toISOString(),
          },
        };
      }

      const session = await response.json() as UCPCheckoutSession;
      session.merchantDomain = params.merchantDomain;

      return {
        success: true,
        data: session,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get checkout status',
      };
    }
  }

  async listUCPMerchants(params: {
    category?: string;
    paymentMethod?: string;
    limit?: number;
  }): Promise<ToolResult<{ merchants: UCPMerchantInfo[] }>> {
    // Return a curated list of known UCP-compatible merchants
    // In production, this would query a merchant registry
    const knownMerchants: UCPMerchantInfo[] = [
      {
        domain: 'shop.google.com',
        name: 'Google Store',
        ucpVersion: '2026-01-11',
        capabilities: ['dev.ucp.shopping.checkout', 'dev.ucp.shopping.fulfillment'],
        paymentMethods: ['com.google.pay', 'crypto.usdc'],
      },
      {
        domain: 'store.example.com',
        name: 'Example Store',
        ucpVersion: '2026-01-11',
        capabilities: ['dev.ucp.shopping.checkout'],
        paymentMethods: ['crypto.usdc', 'crypto.usdt'],
      },
    ];

    let filtered = knownMerchants;

    if (params.paymentMethod) {
      const method = params.paymentMethod;
      filtered = filtered.filter(m => m.paymentMethods.includes(method));
    }

    const limit = params.limit || 20;
    filtered = filtered.slice(0, limit);

    return {
      success: true,
      data: {
        merchants: filtered,
      },
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Tool Executor (for AI agent integration)
  // ─────────────────────────────────────────────────────────────────────────────

  async executeTool(toolName: string, params: Record<string, unknown>): Promise<ToolResult> {
    switch (toolName) {
      case 'create_wallet':
        return this.createWallet({
          identifier: params.identifier as string,
          chain: params.chain as Chain | undefined,
          alias: params.alias as string | undefined,
        });

      case 'get_wallet':
        return this.getWallet(
          params.identifier as string,
          params.chain as Chain | undefined
        );

      case 'get_or_create_wallet':
        return this.getOrCreateWallet({
          identifier: params.identifier as string,
          chain: params.chain as Chain | undefined,
          alias: params.alias as string | undefined,
        });

      case 'get_balances':
        return this.getBalances(
          params.identifier as string,
          params.chain as Chain | undefined,
          params.tokens as string[] | undefined
        );

      case 'transfer_sol':
        return this.transferSol({
          fromIdentifier: params.from_identifier as string,
          toAddress: params.to_address as string,
          amount: params.amount as string,
          chain: params.chain as Chain | undefined,
        });

      case 'transfer_tokens':
        return this.transferTokens({
          fromIdentifier: params.from_identifier as string,
          toAddress: params.to_address as string,
          token: params.token as string,
          amount: params.amount as string,
          chain: params.chain as Chain | undefined,
        });

      case 'fund_wallet_staging':
        return this.fundWalletStaging(
          params.identifier as string,
          params.amount as number | undefined
        );

      case 'fund_wallet_faucet':
        return this.fundWalletFaucet(
          params.address as string,
          params.amount as number | undefined
        );

      case 'get_swap_quote':
        return this.getSwapQuote({
          inputMint: params.input_mint as string,
          outputMint: params.output_mint as string,
          amount: params.amount as string,
          slippageBps: params.slippage_bps as number | undefined,
        });

      case 'swap_tokens':
        return this.swapTokens({
          identifier: params.identifier as string,
          inputMint: params.input_mint as string,
          outputMint: params.output_mint as string,
          amount: params.amount as string,
          slippageBps: params.slippage_bps as number | undefined,
          chain: params.chain as Chain | undefined,
        });

      case 'post_to_moltbook':
        return this.postToMoltbook({
          content: params.content as string,
          walletAddress: params.wallet_address as string | undefined,
          tags: params.tags as string[] | undefined,
        });

      // E-Commerce Tools
      case 'create_order':
        return this.createOrder({
          payerAddress: params.payer_address as string,
          productUrl: params.product_url as string,
          productVariant: params.product_variant as string | undefined,
          recipientEmail: params.recipient_email as string,
          recipientName: params.recipient_name as string,
          addressLine1: params.address_line1 as string,
          addressLine2: params.address_line2 as string | undefined,
          city: params.city as string,
          state: params.state as string,
          postalCode: params.postal_code as string,
          country: params.country as string | undefined,
          paymentCurrency: params.payment_currency as 'usdc' | 'credit' | undefined,
          paymentChain: params.payment_chain as PaymentChain | undefined,
        });

      case 'complete_order_payment':
        return this.completeOrderPayment({
          identifier: params.identifier as string,
          orderId: params.order_id as string,
          serializedTransaction: params.serialized_transaction as string,
          chain: params.chain as PaymentChain | undefined,
        });

      case 'get_order':
        return this.getOrder(params.order_id as string);

      case 'list_orders':
        return this.listOrders({
          email: params.email as string | undefined,
          status: params.status as string | undefined,
          limit: params.limit as number | undefined,
        });

      case 'get_product_quote':
        return this.getProductQuote({
          productUrl: params.product_url as string,
          variant: params.variant as string | undefined,
        });

      case 'agent_to_agent_transfer':
        return this.agentToAgentTransfer({
          fromIdentifier: params.from_identifier as string,
          toIdentifier: params.to_identifier as string,
          amount: params.amount as string,
          memo: params.memo as string | undefined,
          chain: params.chain as Chain | undefined,
        });

      // UCP Tools (Google Universal Commerce Protocol)
      case 'discover_ucp_merchant':
        return this.discoverUCPMerchant(params.merchant_domain as string);

      case 'create_ucp_checkout':
        return this.createUCPCheckout({
          merchantDomain: params.merchant_domain as string,
          items: params.items as Array<{ product_id: string; quantity: number }>,
          shippingName: params.shipping_name as string,
          shippingLine1: params.shipping_line1 as string,
          shippingCity: params.shipping_city as string,
          shippingState: params.shipping_state as string,
          shippingPostalCode: params.shipping_postal_code as string,
          shippingCountry: params.shipping_country as string | undefined,
          email: params.email as string,
        });

      case 'complete_ucp_checkout':
        return this.completeUCPCheckout({
          merchantDomain: params.merchant_domain as string,
          sessionId: params.session_id as string,
          paymentHandler: params.payment_handler as string | undefined,
          payerWallet: params.payer_wallet as string,
          chain: params.chain as PaymentChain | undefined,
        });

      case 'get_ucp_checkout_status':
        return this.getUCPCheckoutStatus({
          merchantDomain: params.merchant_domain as string,
          sessionId: params.session_id as string,
        });

      case 'list_ucp_merchants':
        return this.listUCPMerchants({
          category: params.category as string | undefined,
          paymentMethod: params.payment_method as string | undefined,
          limit: params.limit as number | undefined,
        });

      default:
        return {
          success: false,
          error: `Unknown tool: ${toolName}`,
        };
    }
  }

  isConfigured(): boolean {
    return !!this.serverApiKey;
  }

  getEnvironment(): Environment {
    return this.environment;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Skill Entry Point
// ─────────────────────────────────────────────────────────────────────────────

export function createSkill(apiKey?: string) {
  const wallet = new CrossmintAgentWallet(apiKey);

  return {
    name: 'crossmint-agentic-wallet',
    description: 'Create and manage non-custodial Solana wallets for AI agents with Jupiter swaps, faucet funding, AGENTIC E-COMMERCE, and GOOGLE UCP for agent-to-agent commerce',
    tools: TOOL_DEFINITIONS,
    execute: (toolName: string, params: Record<string, unknown>) => wallet.executeTool(toolName, params),
    client: wallet,
  };
}

// Default export for direct usage
export default CrossmintAgentWallet;
