/**
 * Jupiter DEX Service — Swap routing and price discovery
 */
export declare class JupiterService {
    private apiUrl;
    getPrices(): Promise<Record<string, number>>;
    getTrending(): Promise<unknown[]>;
    getBalance(): Promise<number>;
    getQuote(inputMint: string, outputMint: string, amount: number): Promise<unknown>;
    executeSwap(inputMint: string, outputMint: string, amount: number): Promise<{
        success: boolean;
        signature: string;
    }>;
}
//# sourceMappingURL=jupiter.d.ts.map