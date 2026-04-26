# Solana Address Tracker

A full-stack application for transparently tracking Solana wallet addresses using the Helius Wallet API and DAS API.

## Features

- **Wallet Profile** — Aggregated view: identity, balances, NFTs, funding source
- **Token Balances** — All SPL tokens & NFTs with USD values, pagination
- **Transaction History** — Complete history with balance changes
- **Token Transfers** — Incoming/outgoing transfers with counterparty info
- **Funding Source** — Original funder detection with risk scoring
- **Batch Identity** — Identify up to 100 wallets at once (exchanges, protocols, etc.)
- **DAS Integration** — Asset search and token accounts via Helius RPC

## Tech Stack

- **Backend**: Node.js + Express
- **Frontend**: React + React Router
- **API**: Helius Wallet API (Beta), DAS API, Helius RPC

## Setup

```bash
# 1. Install dependencies
npm run install-all

# 2. Configure your API key
#    Edit server/.env and set:
#    HELIUS_API_KEY=your_key_here
#    HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=your_key_here

# 3. Start both server and client
npm run dev

# 4. Open http://localhost:3000
```

## API Endpoints

### Wallet API (proxied from Helius)
| Endpoint | Description |
|----------|-------------|
| `GET /api/wallet/:address/identity` | Wallet identity lookup |
| `POST /api/wallet/batch-identity` | Batch identity (up to 100) |
| `GET /api/wallet/:address/balances` | Token + NFT balances |
| `GET /api/wallet/:address/history` | Transaction history |
| `GET /api/wallet/:address/transfers` | Token transfers |
| `GET /api/wallet/:address/funded-by` | Original funding source |

### DAS API
| Endpoint | Description |
|----------|-------------|
| `GET /api/das/assets/:owner` | Assets by owner |
| `GET /api/das/asset/:id` | Single asset details |
| `GET /api/das/token-accounts/:owner` | Token accounts |
| `POST /api/das/search` | Search assets |

### Composite
| Endpoint | Description |
|----------|-------------|
| `GET /api/tracking/:address/profile` | Full wallet profile |
| `GET /api/tracking/:address/activity` | Recent activity |
| `POST /api/tracking/batch-profile` | Multi-wallet profiles |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `HELIUS_API_KEY` | Your Helius API key |
| `HELIUS_RPC_URL` | Helius RPC endpoint with API key |
| `PORT` | Server port (default: 3001) |
