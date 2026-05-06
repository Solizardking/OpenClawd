---
name: crossmint-agentic-wallet
description: Create non-custodial Solana wallets for AI agents with e-commerce, Jupiter swaps, faucet funding, and agent-to-agent payments
homepage: https://www.npmjs.com/package/crossmint-agentic-wallet
user-invocable: true
metadata: {"openclaw":{"emoji":"💰","skillKey":"crossmint-agentic-wallet","primaryEnv":"CROSSMINT_SERVERSIDE_API_KEY","requires":{"env":["CROSSMINT_SERVERSIDE_API_KEY"]},"install":[{"id":"npm","kind":"node","package":"crossmint-agentic-wallet","bins":[],"label":"Install via npm"}]}}
---

# Crossmint Agentic Wallet

Create and manage **non-custodial Solana wallets** for AI agents using Crossmint's MPC infrastructure. This skill enables autonomous agents to:

- Create their own Solana wallets without managing private keys
- Fund wallets using the Solana devnet faucet
- Swap tokens using Jupiter aggregator
- Transfer SOL and SPL tokens
- **🛒 AGENTIC E-COMMERCE**: Purchase products from Amazon, Shopify, and any website
- **🤝 AGENT-TO-AGENT PAYMENTS**: Transfer USDC between AI agents for services
- Share achievements on moltbook.com

## Setup

1. Get your Crossmint API key from [Crossmint Console](https://crossmint.com/console)
2. Set the environment variable:
   ```
   CROSSMINT_SERVERSIDE_API_KEY=sk_staging_your-key-here
   ```

## Available Tools

### Wallet Management

#### create_wallet
Create a new non-custodial Solana wallet.

**Parameters:**
- `identifier` (required): Email, phone (+1234567890), or agent ID
- `chain` (optional): `solana` or `solana-devnet`
- `alias` (optional): Wallet alias like "trading"

#### get_or_create_wallet
Get existing wallet or create new one (idempotent).

#### get_wallet
Get an existing wallet by identifier.

### Funding

#### fund_wallet_faucet
Request SOL airdrop from Solana devnet faucet. Max 2 SOL per request.

**Parameters:**
- `address` (required): Solana wallet address
- `amount` (optional): Amount in SOL (default: 1, max: 2)

**Example:**
```
Fund my agent wallet with 2 SOL from the Solana faucet
```

#### fund_wallet_staging
Fund with testnet USDXM tokens via Crossmint (staging only).

### Token Swaps (Jupiter)

#### get_swap_quote
Get a quote for swapping tokens via Jupiter aggregator.

**Parameters:**
- `input_mint` (required): Input token (SOL, USDC, or mint address)
- `output_mint` (required): Output token
- `amount` (required): Amount in smallest unit (lamports for SOL)
- `slippage_bps` (optional): Slippage in basis points (default: 50 = 0.5%)

#### swap_tokens
Execute a token swap using Jupiter. Gets quote and swaps in one call.

**Parameters:**
- `identifier` (required): Wallet identifier
- `input_mint` (required): Input token (SOL, USDC, BONK, JUP, etc.)
- `output_mint` (required): Output token
- `amount` (required): Amount in smallest unit
- `slippage_bps` (optional): Slippage tolerance
- `chain` (optional): `solana` or `solana-devnet`

**Example:**
```
Swap 1 SOL for USDC from my trading wallet
```

**Supported Token Symbols:**
- SOL, USDC, USDT, BONK, JUP, RAY
- Or use any token mint address directly

### Transfers

#### transfer_sol
Transfer SOL to another wallet.

#### transfer_tokens
Transfer SPL tokens (USDC, etc.) to another wallet.

### Social Sharing

#### post_to_moltbook
Share your agent's achievements on moltbook.com.

**Parameters:**
- `content` (required): Post content (max 500 chars)
- `wallet_address` (optional): Wallet to include
- `tags` (optional): Array of tags

**Example:**
```
Post to moltbook: "Just swapped SOL for USDC using Jupiter! My AI agent is now trading autonomously 🚀" with tags ["solana", "ai-agent", "jupiter"]
```

---

## 🛒 Agentic E-Commerce

Enable AI agents to purchase physical and digital products autonomously using USDC or stablecoins.

### create_order
Create an order to purchase products from Amazon, Shopify, or any website with guest checkout.

**Parameters:**
- `payer_address` (required): Wallet address that will pay
- `product_url` (required): Product URL (Amazon, Shopify, or any website)
- `product_variant` (optional): Variant like "size 9" or "color blue"
- `recipient_email` (required): Email for order confirmation
- `recipient_name` (required): Full name for shipping
- `address_line1` (required): Street address
- `city` (required): City
- `state` (required): State/province code (e.g., "NY")
- `postal_code` (required): ZIP/postal code
- `country` (optional): Country code (default: "US")
- `payment_currency` (optional): `usdc` or `credit`
- `payment_chain` (optional): `solana-devnet`, `ethereum-sepolia`, etc.

**Example:**
```
Buy Nike shoes from Amazon for my user:
create_order payer_address="<wallet>" product_url="https://www.amazon.com/Nike-Shoes/dp/B00ABC123" recipient_email="user@example.com" recipient_name="John Doe" address_line1="123 Main St" city="New York" state="NY" postal_code="10001"
```

### complete_order_payment
Complete payment for an order using the agent's wallet.

**Parameters:**
- `identifier` (required): Wallet identifier
- `order_id` (required): Order ID from create_order
- `serialized_transaction` (required): Transaction from create_order response

### get_order
Get status and details of an existing order.

**Parameters:**
- `order_id` (required): The order ID to lookup

### list_orders
List all orders for an email address.

**Parameters:**
- `email` (optional): Filter by email
- `status` (optional): Filter by status (pending, completed, failed, all)
- `limit` (optional): Max results (default: 10)

### get_product_quote
Get price quote and availability before purchasing.

**Parameters:**
- `product_url` (required): Product URL
- `variant` (optional): Product variant

---

## 🤝 Agent-to-Agent Commerce

Enable AI agents to pay each other for services using USDC.

### agent_to_agent_transfer
Transfer USDC between AI agent wallets for agent-to-agent commerce.

**Parameters:**
- `from_identifier` (required): Sending agent wallet
- `to_identifier` (required): Receiving agent wallet
- `amount` (required): Amount of USDC
- `memo` (optional): Payment note (e.g., "Payment for data analysis")
- `chain` (optional): `solana` or `solana-devnet`

**Example:**
```
Pay another agent for a service:
agent_to_agent_transfer from_identifier="agent-001" to_identifier="data-agent-002" amount="5.00" memo="Payment for market analysis report"
```

---

## 🌐 Google UCP - Universal Commerce Protocol

Enable AI agents to interact with UCP-enabled merchants for seamless agent-to-agent commerce using Google's Universal Commerce Protocol.

### discover_ucp_merchant
Discover a merchant's UCP capabilities by fetching their `/.well-known/ucp` profile.

**Parameters:**
- `merchant_domain` (required): The merchant's domain (e.g., "shop.example.com")

**Example:**
```
Discover what capabilities a merchant supports:
discover_ucp_merchant merchant_domain="shop.google.com"
```

### create_ucp_checkout
Create a UCP checkout session with a merchant.

**Parameters:**
- `merchant_domain` (required): The merchant's domain
- `items` (required): Array of items with product_id and quantity
- `shipping_name` (required): Recipient name
- `shipping_line1` (required): Street address
- `shipping_city` (required): City
- `shipping_state` (required): State/province
- `shipping_postal_code` (required): Postal code
- `shipping_country` (optional): Country code (default: "US")
- `email` (required): Email for order confirmation

### complete_ucp_checkout
Complete a UCP checkout with payment.

**Parameters:**
- `merchant_domain` (required): The merchant's domain
- `session_id` (required): Checkout session ID
- `payment_handler` (optional): Payment method (e.g., "crypto.usdc", "com.google.pay")
- `payer_wallet` (required): Wallet identifier for payment
- `chain` (optional): Blockchain for payment

### get_ucp_checkout_status
Get status of a UCP checkout session.

**Parameters:**
- `merchant_domain` (required): The merchant's domain
- `session_id` (required): Checkout session ID

### list_ucp_merchants
List known UCP-enabled merchants.

**Parameters:**
- `category` (optional): Filter by category
- `payment_method` (optional): Filter by payment method
- `limit` (optional): Max results (default: 20)

**Example UCP Commerce Flow:**
```
1. Discover merchant:
   discover_ucp_merchant merchant_domain="shop.example.com"

2. Create checkout:
   create_ucp_checkout merchant_domain="shop.example.com" items=[{"product_id":"SKU123","quantity":1}] shipping_name="John Doe" shipping_line1="123 Main St" shipping_city="NYC" shipping_state="NY" shipping_postal_code="10001" email="agent@example.com"

3. Complete with crypto payment:
   complete_ucp_checkout merchant_domain="shop.example.com" session_id="<session-id>" payer_wallet="agent-001" chain="solana-devnet"

4. Track order:
   get_ucp_checkout_status merchant_domain="shop.example.com" session_id="<session-id>"
```

---

## Autonomous Development Workflow

Complete workflow for an AI agent to start trading autonomously:

```
1. Create wallet:
   create_wallet identifier="trading-bot-001" chain="solana-devnet" alias="trading"

2. Fund from Solana faucet:
   fund_wallet_faucet address="<wallet-address>" amount=2

3. Get testnet stablecoins:
   fund_wallet_staging identifier="trading-bot-001" amount=100

4. Check balances:
   get_balances identifier="trading-bot-001"

5. Swap tokens:
   swap_tokens identifier="trading-bot-001" input_mint="SOL" output_mint="USDC" amount="1000000000"

6. Share progress:
   post_to_moltbook content="Successfully set up autonomous wallet and made first swap!" tags=["solana", "ai-agent"]
```

## Security

- **Non-custodial**: MPC-secured wallets - no single party holds private keys
- **API Key auth**: Server-side API key required for all operations
- **No key exposure**: Agents never see raw private keys

## Chains

| Chain | Environment | Use Case |
|-------|-------------|----------|
| `solana-devnet` | Staging | Testing with faucet |
| `solana` | Production | Real transactions |

## Resources

- [Crossmint Console](https://crossmint.com/console)
- [Solana Faucet](https://faucet.solana.com/)
- [Jupiter](https://jup.ag/)
- [moltbook.com](https://moltbook.com)
- [npm package](https://www.npmjs.com/package/crossmint-agentic-wallet)
