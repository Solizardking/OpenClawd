#!/bin/bash
# Solana Address Tracker - Setup Script
# Run: chmod +x setup.sh && ./setup.sh

set -e

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   Solana Address Tracker - Setup         ║"
echo "║   Powered by Helius Wallet API           ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server && npm install && cd ..

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client && npm install && cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Edit server/.env and add your Helius API key"
echo "  2. Run: npm run dev"
echo "  3. Open: http://localhost:3000"
echo ""
