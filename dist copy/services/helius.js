/**
 * Helius Service — Wallet intelligence, RPC, DAS API
 */
export class HeliusService {
    apiKey = process.env.HELIUS_API_KEY || '';
    rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    async getBalance(address) {
        return 0;
    }
    async getTokens(address) {
        return [];
    }
    async getTransactions(address) {
        return [];
    }
    async getRecentTransactions() {
        return [];
    }
    async getTopTraders(mint) {
        return [];
    }
}
//# sourceMappingURL=helius.js.map