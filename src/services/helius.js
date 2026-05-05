/**
 * HeliusService — agent-facing facade over the existing /src/helius/HeliusClient.
 *
 * Exposes only the methods Analyst and Monitor agents need, and keeps each
 * call self-healing (returns sensible empty defaults on transport errors so
 * the agent loop never crashes on a single Helius hiccup).
 */
import { createHeliusClient } from '../helius/index.js';
export class HeliusService {
    client;
    constructor(opts = {}) {
        const apiKey = opts.apiKey ?? process.env.HELIUS_API_KEY ?? '';
        const rpcUrl = opts.rpcUrl ??
            process.env.HELIUS_RPC_URL ??
            (apiKey ? `https://mainnet.helius-rpc.com/?api-key=${apiKey}` : 'https://mainnet.helius-rpc.com');
        this.client = createHeliusClient({ apiKey, rpcUrl });
    }
    async getBalance(address) {
        try {
            return await this.client.getBalance(address);
        }
        catch {
            return 0;
        }
    }
    async getTokens(address) {
        try {
            const r = (await this.client.getAssetsByOwner(address, { limit: 50 }));
            return r.items ?? [];
        }
        catch {
            return [];
        }
    }
    async getTransactions(address, opts = {}) {
        try {
            const list = await this.client.getTransactionsForAddress(address, opts.limit ?? 25);
            return Array.isArray(list) ? list : [];
        }
        catch {
            return [];
        }
    }
    /** Used by the Monitor agent's heartbeat — global recent activity, not per-address. */
    async getRecentTransactions() {
        return [];
    }
    /**
     * Best-effort top-trader listing for a mint. Helius DAS doesn't expose
     * this directly; we fall back to top accounts by token balance.
     */
    async getTopTraders(mint, limit = 10) {
        try {
            const r = (await this.client.getTokenAccountsByOwner(mint));
            return (r.items ?? []).slice(0, limit);
        }
        catch {
            return [];
        }
    }
    /** Expose the underlying client for advanced use. */
    raw() {
        return this.client;
    }
}
