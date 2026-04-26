#!/bin/bash
# Solana Address Tracker - Full Stack Setup Script
# Run: chmod +x setup.sh && ./setup.sh

BASE="/Users/8bit/Downloads/untitled folder"
mkdir -p "$BASE"
cd "$BASE"

# Create directory structure
mkdir -p server/routes
mkdir -p server/services
mkdir -p client/src/components
mkdir -p client/src/pages
mkdir -p client/src/services
mkdir -p client/public

echo "Creating project files..."

###############################################
# ROOT FILES
###############################################

cat > package.json << 'ROOTPKG'
{
  "name": "solana-address-tracker",
  "version": "1.0.0",
  "description": "Transparent Solana address tracking using Helius Wallet API and DAS API",
  "scripts": {
    "server": "cd server && node index.js",
    "client": "cd client && npm start",
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "install-all": "npm install && cd server && npm install && cd ../client && npm install",
    "setup": "npm run install-all"
  },
  "dependencies": {
    "concurrently": "^8.2.2"
  }
}
ROOTPKG

cat > .env.example << 'ENVEX'
# Helius API Configuration
HELIUS_API_KEY=your_helius_api_key_here
HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=your_helius_api_key_here

# Server
PORT=3001
ENVEX

cat > README.md << 'README'
# Solana Address Tracker

A full-stack application for transparently tracking Solana wallet addresses using the Helius Wallet API and DAS API.

## Features

- **Wallet Identity** - Look up known wallet identities (exchanges, protocols, institutions)
- **Wallet Balances** - View all token and NFT holdings with USD values
- **Transaction History** - Complete transaction history with balance changes
- **Token Transfers** - Track all incoming/outgoing token transfers
- **Funding Source** - Discover who originally funded a wallet
- **Asset Search** - Search assets by owner using DAS API
- **Token Accounts** - View all SPL token accounts

## Setup

1. Copy .env.example to server/.env:
   cp .env.example server/.env

2. Add your Helius API key to server/.env

3. Install all dependencies:
   npm run install-all

4. Start both server and client:
   npm run dev

5. Open http://localhost:3000

## Tech Stack

- **Backend**: Node.js, Express
- **Frontend**: React
- **API**: Helius Wallet API (Beta), DAS API, Helius RPC
README

###############################################
# SERVER FILES
###############################################

cat > server/package.json << 'SERVPKG'
{
  "name": "solana-tracker-server",
  "version": "1.0.0",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.18.2",
    "node-fetch": "^2.7.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.3"
  }
}
SERVPKG

cat > server/.env << 'SERVENV'
HELIUS_API_KEY=your_helius_api_key_here
HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=your_helius_api_key_here
PORT=3001
SERVENV

cat > server/index.js << 'SERVIDX'
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const walletRoutes = require('./routes/wallet');
const dasRoutes = require('./routes/das');
const trackingRoutes = require('./routes/tracking');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/wallet', walletRoutes);
app.use('/api/das', dasRoutes);
app.use('/api/tracking', trackingRoutes);

app.listen(PORT, () => {
  console.log(\`Solana Tracker API running on port \${PORT}\`);
});
SERVIDX

echo "Server index created..."
