/**
 * Helius Service — Wallet intelligence, RPC, DAS API
 */
export interface WalletToken {
    mint: string;
    symbol: string;
    amount: number;
    valueUSD: number;
    concentration?: number;
}
export interface WalletTransaction {
    type?: string;
    profit?: number;
}
export declare class HeliusService {
    private apiKey;
    private rpcUrl;
    getBalance(address: string): Promise<number>;
    getTokens(address: string): Promise<WalletToken[]>;
    getTransactions(address: string): Promise<WalletTransaction[]>;
    getRecentTransactions(): Promise<Array<{
        mint?: string;
        type?: string;
        from?: string;
        valueSOL?: number;
        solPrice?: number;
    }>>;
    getTopTraders(mint: string): Promise<string[]>;
}
//# sourceMappingURL=helius.d.ts.map