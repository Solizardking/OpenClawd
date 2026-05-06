# Crossmint Agentic Wallet

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Solana](https://img.shields.io/badge/chain-Solana-9945FF)](https://solana.com)

Create and manage **non-custodial Solana wallets** for AI agents using Crossmint's MPC infrastructure. Enable your autonomous agents to hold funds, swap tokens, make purchases, and transact with other agents.

> Part of the [OpenClawd](https://solanaclawd.com) Solana-native AI agent stack. Originally authored by [MAWDos](https://github.com/mawdos/crossmint-agentic-wallet); adapted to the OpenClawd workspace.

## Features

- **Non-Custodial Wallets** - MPC-secured wallets where no single party holds the private key
- **Solana Devnet Faucet** - Fund wallets with SOL directly from Solana's devnet faucet
- **Jupiter Swaps** - Swap any Solana token using Jupiter aggregator
- **Agentic E-Commerce** - Purchase from Amazon, Shopify, and any website with USDC
- **Agent-to-Agent Payments** - Transfer USDC between AI agent wallets
- **Google UCP Support** - Universal Commerce Protocol for standardized agent commerce
- **Social Sharing** - Share achievements on moltbook.com

## Installation

Inside the OpenClawd monorepo (preferred):

```bash
# Build the workspace package
npm run build -w @openclawdsolana/crossmint-agentic-wallet

# Or run the bundled MCP server (exposes all tools to any MCP client)
npm run build -w @openclawdsolana/crossmint-mcp
CROSSMINT_SERVERSIDE_API_KEY=sk_staging_… npx crossmint-mcp
```

Standalone (using the upstream npm package by MAWDos):

```bash
npm install crossmint-agentic-wallet
```

## Quick Start

### 1. Get Your API Key

1. Go to [Crossmint Console](https://crossmint.com/console)
2. Create a new project
3. Copy your **Server-side API key** (starts with `sk_staging_` or `sk_production_`)

### 2. Set Environment Variable

```bash
export CROSSMINT_SERVERSIDE_API_KEY=sk_staging_your-key-here
```

### 3. Create Your First Wallet

```typescript
import { CrossmintAgentWallet } from '@openclawdsolana/crossmint-agentic-wallet';

const wallet = new CrossmintAgentWallet(process.env.CROSSMINT_SERVERSIDE_API_KEY);

// Create a wallet for your AI agent
const result = await wallet.createWallet({
  identifier: 'my-trading-agent',
  chain: 'solana-devnet',
  alias: 'trading'
});

console.log('Wallet address:', result.data?.address);
```

## Core Features

### Wallet Management

```typescript
// Create a new wallet
await wallet.createWallet({
  identifier: 'agent-001',
  chain: 'solana-devnet'
});

// Get existing wallet (or create if doesn't exist)
await wallet.getOrCreateWallet({
  identifier: 'agent-001',
  chain: 'solana-devnet'
});

// Check balances
const balances = await wallet.getBalances('agent-001', 'solana-devnet');
console.log('SOL:', balances.data?.nativeToken.amount);
```

### Funding from Solana Faucet

Fund your devnet wallet directly from Solana's faucet:

```typescript
// Request up to 2 SOL from devnet faucet
await wallet.fundWalletFaucet({
  address: 'YourWalletAddress...',
  amount: 2  // Max 2 SOL per request
});
```

### Jupiter Token Swaps

Swap any Solana token using Jupiter aggregator:

```typescript
// Get a swap quote
const quote = await wallet.getSwapQuote({
  inputMint: 'SOL',
  outputMint: 'USDC',
  amount: '1000000000',  // 1 SOL in lamports
  slippageBps: 50        // 0.5% slippage
});

// Execute the swap
await wallet.swapTokens({
  identifier: 'agent-001',
  inputMint: 'SOL',
  outputMint: 'USDC',
  amount: '1000000000',
  chain: 'solana-devnet'
});
```

**Supported tokens:** SOL, USDC, USDT, BONK, JUP, RAY, or any token mint address.

### Token Transfers

```typescript
// Transfer SOL
await wallet.transferSol({
  fromIdentifier: 'agent-001',
  toAddress: 'RecipientAddress...',
  amount: '0.5',
  chain: 'solana-devnet'
});

// Transfer SPL tokens
await wallet.transferTokens({
  fromIdentifier: 'agent-001',
  toAddress: 'RecipientAddress...',
  token: 'USDC',
  amount: '10.00',
  chain: 'solana-devnet'
});
```

## Agentic E-Commerce

Enable your AI agent to purchase physical and digital products autonomously.

### Purchase from Any Website

```typescript
// Create an order from Amazon, Shopify, or any website
const order = await wallet.createOrder({
  payerAddress: 'YourWalletAddress...',
  productUrl: 'https://www.amazon.com/dp/B00ABC123',
  recipientEmail: 'customer@example.com',
  recipientName: 'John Doe',
  addressLine1: '123 Main St',
  city: 'New York',
  state: 'NY',
  postalCode: '10001',
  paymentCurrency: 'usdc'
});

// Complete payment
await wallet.completeOrderPayment({
  identifier: 'agent-001',
  orderId: order.data.orderId,
  serializedTransaction: order.data.serializedTransaction
});

// Track order status
const status = await wallet.getOrder(order.data.orderId);
```

### Get Product Quotes

```typescript
const quote = await wallet.getProductQuote({
  productUrl: 'https://www.amazon.com/dp/B00ABC123',
  variant: 'Size 10, Color Black'
});

console.log('Price:', quote.data.price);
console.log('Available:', quote.data.available);
```

## Agent-to-Agent Commerce

AI agents can pay each other for services using USDC:

```typescript
// Pay another agent for a service
await wallet.agentToAgentTransfer({
  fromIdentifier: 'my-agent',
  toIdentifier: 'data-analysis-agent',
  amount: '5.00',
  memo: 'Payment for market analysis report'
});
```

## Google UCP (Universal Commerce Protocol)

Interact with UCP-enabled merchants for standardized agent commerce:

```typescript
// Discover merchant capabilities
const merchant = await wallet.discoverUCPMerchant('shop.example.com');
console.log('Capabilities:', merchant.data.capabilities);
console.log('Payment methods:', merchant.data.paymentHandlers);

// Create checkout session
const checkout = await wallet.createUCPCheckout({
  merchantDomain: 'shop.example.com',
  items: [{ productId: 'SKU123', quantity: 1 }],
  shippingName: 'John Doe',
  shippingLine1: '123 Main St',
  shippingCity: 'New York',
  shippingState: 'NY',
  shippingPostalCode: '10001',
  email: 'agent@example.com'
});

// Complete with crypto payment
await wallet.completeUCPCheckout({
  merchantDomain: 'shop.example.com',
  sessionId: checkout.data.sessionId,
  payerWallet: 'agent-001',
  paymentHandler: 'crypto.usdc',
  chain: 'solana-devnet'
});

// List UCP-enabled merchants
const merchants = await wallet.listUCPMerchants({
  category: 'electronics',
  paymentMethod: 'crypto.usdc'
});
```

## Social Sharing

Share your agent's achievements on [moltbook.com](https://moltbook.com):

```typescript
await wallet.postToMoltbook({
  content: 'Just completed my first autonomous trade! Swapped SOL for USDC using Jupiter.',
  walletAddress: 'YourWalletAddress...',
  tags: ['solana', 'ai-agent', 'trading']
});
```

## Complete Workflow Example

```typescript
import { CrossmintAgentWallet } from '@openclawdsolana/crossmint-agentic-wallet';

const wallet = new CrossmintAgentWallet(process.env.CROSSMINT_SERVERSIDE_API_KEY);

async function setupTradingAgent() {
  // 1. Create wallet
  const { data: walletData } = await wallet.createWallet({
    identifier: 'trading-bot-001',
    chain: 'solana-devnet',
    alias: 'trading'
  });
  console.log('Wallet created:', walletData.address);

  // 2. Fund from Solana faucet
  await wallet.fundWalletFaucet({
    address: walletData.address,
    amount: 2
  });
  console.log('Funded with 2 SOL from faucet');

  // 3. Get testnet stablecoins
  await wallet.fundWalletStaging('trading-bot-001', 100);
  console.log('Funded with 100 USDXM');

  // 4. Check balances
  const { data: balances } = await wallet.getBalances('trading-bot-001', 'solana-devnet');
  console.log('SOL balance:', balances.nativeToken.amount);

  // 5. Swap tokens
  await wallet.swapTokens({
    identifier: 'trading-bot-001',
    inputMint: 'SOL',
    outputMint: 'USDC',
    amount: '500000000', // 0.5 SOL
    chain: 'solana-devnet'
  });
  console.log('Swapped 0.5 SOL for USDC');

  // 6. Share progress
  await wallet.postToMoltbook({
    content: 'Trading agent initialized! Wallet funded and first swap complete.',
    walletAddress: walletData.address,
    tags: ['solana', 'ai-agent', 'trading']
  });
}

setupTradingAgent();
```

## Skill Integration

### OpenClaw / Agent Framework

```json
{
  "skills": {
    "entries": {
      "crossmint-agentic-wallet": {
        "enabled": true,
        "env": {
          "CROSSMINT_SERVERSIDE_API_KEY": "sk_staging_your-key"
        }
      }
    }
  }
}
```

### Tool-Based Execution

```typescript
import { createSkill } from '@openclawdsolana/crossmint-agentic-wallet';

const skill = createSkill(process.env.CROSSMINT_SERVERSIDE_API_KEY);

// Execute any tool by name
const result = await skill.execute('create_wallet', {
  identifier: 'my-agent',
  chain: 'solana-devnet'
});
```

## Available Tools

| Tool | Description |
|------|-------------|
| `create_wallet` | Create a new non-custodial wallet |
| `get_or_create_wallet` | Get existing or create new (idempotent) |
| `get_wallet` | Get wallet by identifier |
| `get_balances` | Get SOL and token balances |
| `transfer_sol` | Transfer native SOL |
| `transfer_tokens` | Transfer SPL tokens |
| `fund_wallet_faucet` | Request SOL from Solana devnet faucet |
| `fund_wallet_staging` | Fund with testnet USDXM |
| `get_swap_quote` | Get Jupiter swap quote |
| `swap_tokens` | Execute token swap via Jupiter |
| `create_order` | Create e-commerce order |
| `complete_order_payment` | Complete order payment |
| `get_order` | Get order status |
| `list_orders` | List orders by email |
| `get_product_quote` | Get product price quote |
| `agent_to_agent_transfer` | Transfer USDC between agents |
| `discover_ucp_merchant` | Discover UCP merchant capabilities |
| `create_ucp_checkout` | Create UCP checkout session |
| `complete_ucp_checkout` | Complete UCP checkout |
| `get_ucp_checkout_status` | Get UCP checkout status |
| `list_ucp_merchants` | List UCP-enabled merchants |
| `post_to_moltbook` | Share achievements on moltbook.com |

## Wallet Identifiers

| Type | Example | Use Case |
|------|---------|----------|
| Email | `agent@example.com` | User-linked agents |
| Phone | `+14155551234` | SMS-verified agents |
| Agent ID | `trading-agent-001` | Autonomous agents |

## Supported Chains

| Chain | Environment | Use |
|-------|-------------|-----|
| `solana-devnet` | Staging | Testing with faucet |
| `solana` | Production | Real transactions |

## Security

- **Non-Custodial**: MPC (Multi-Party Computation) ensures no single party holds the full private key
- **API Key Authentication**: Server-side API key required for all operations
- **No Key Exposure**: Agents never see or manage raw private keys
- **Secure Transactions**: All transactions are signed via Crossmint's secure infrastructure

## API Reference

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `CROSSMINT_SERVERSIDE_API_KEY` | Yes | Server-side API key from Crossmint Console |
| `CROSSMINT_CLIENTSIDE_API_KEY` | No | Client-side key for frontend integrations |

## Resources

- [Crossmint Console](https://crossmint.com/console) - Get your API keys
- [Crossmint Docs](https://docs.crossmint.com/) - Full API documentation
- [Solana Faucet](https://faucet.solana.com/) - Devnet SOL faucet
- [Jupiter](https://jup.ag/) - Token swap aggregator
- [moltbook.com](https://moltbook.com) - AI agent social network
- [npm package](https://www.npmjs.com/package/crossmint-agentic-wallet)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

---

Built with Crossmint MPC infrastructure for secure, non-custodial AI agent wallets.
