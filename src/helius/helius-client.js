/**
 * HeliusClient — base HTTP client for Helius RPC, DAS, and webhook APIs
 *
 * No private key required for read-only methods.
 * Requires HELIUS_API_KEY for enhanced endpoints.
 *
 * Docs: https://docs.helius.dev
 */
export class HeliusClient {
    rpcUrl;
    wssUrl;
    apiBaseUrl;
    apiKey;
    constructor(config) {
        this.apiKey = config.apiKey;
        const cluster = config.cluster ?? "mainnet";
        this.rpcUrl =
            process.env.HELIUS_RPC_URL ??
                `https://${cluster}.helius-rpc.com/?api-key=${config.apiKey}`;
        this.wssUrl =
            process.env.HELIUS_WSS_URL ??
                `wss://${cluster}.helius-rpc.com/?api-key=${config.apiKey}`;
        this.apiBaseUrl =
            cluster === "mainnet"
                ? `https://api-mainnet.helius-rpc.com`
                : `https://api-devnet.helius-rpc.com`;
    }
    // ── JSON-RPC ─────────────────────────────────────────────────────────────
    async rpc(method, params = []) {
        const res = await fetch(this.rpcUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
        });
        const data = await res.json();
        if (data.error)
            throw new Error(`RPC ${method}: [${data.error.code}] ${data.error.message}`);
        return data.result;
    }
    // ── Account data ─────────────────────────────────────────────────────────
    async getAccountInfo(pubkey, encoding = "jsonParsed") {
        return this.rpc("getAccountInfo", [pubkey, { encoding, commitment: "confirmed" }]);
    }
    async getBalance(pubkey) {
        const result = await this.rpc("getBalance", [pubkey, { commitment: "confirmed" }]);
        return result / 1e9; // lamports → SOL
    }
    async getTokenAccountsByOwner(wallet) {
        return this.rpc("getTokenAccountsByOwner", [
            wallet,
            { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
            { encoding: "jsonParsed", commitment: "confirmed" },
        ]);
    }
    async getLatestBlockhash() {
        const result = await this.rpc("getLatestBlockhash", [{ commitment: "confirmed" }]);
        return result.value;
    }
    async getBlockHeight() {
        return this.rpc("getBlockHeight", [{ commitment: "confirmed" }]);
    }
    async getSignatureStatuses(signatures) {
        return this.rpc("getSignatureStatuses", [signatures, { searchTransactionHistory: true }]);
    }
    // ── Priority fees ─────────────────────────────────────────────────────────
    /**
     * Get priority fee estimate. Pass a base64-encoded serialized transaction for
     * the most accurate estimate — or omit for a leveled quote (no private key needed).
     */
    async getPriorityFeeEstimate(opts = {}) {
        const params = {};
        if (opts.transaction)
            params.transaction = opts.transaction;
        if (opts.accountKeys)
            params.accountKeys = opts.accountKeys;
        params.options = { includeAllPriorityFeeLevels: true, recommended: opts.recommended ?? true };
        const result = await this.rpc("getPriorityFeeEstimate", [params]);
        const levels = result.priorityFeeLevels ?? {};
        return {
            min: levels.min ?? 0,
            low: levels.low ?? 0,
            medium: levels.medium ?? 0,
            high: levels.high ?? 0,
            veryHigh: levels.veryHigh ?? 0,
            unsafeMax: levels.unsafeMax ?? 0,
            recommended: result.priorityFeeEstimate ?? levels.high ?? 0,
        };
    }
    // ── Enhanced Transactions API ─────────────────────────────────────────────
    /**
     * Get parsed, enhanced transactions for an address.
     * Returns human-readable descriptions, token transfers, NFT events, etc.
     * Free on Helius — no private key needed.
     */
    async getTransactionsForAddress(address, opts = {}) {
        const params = new URLSearchParams({
            "api-key": this.apiKey,
            limit: String(opts.limit ?? 10),
            ...(opts.before ? { before: opts.before } : {}),
            ...(opts.until ? { until: opts.until } : {}),
            ...(opts.type ? { type: opts.type } : {}),
        });
        const res = await fetch(`${this.apiBaseUrl}/v0/addresses/${encodeURIComponent(address)}/transactions?${params}`);
        if (!res.ok)
            throw new Error(`getTransactionsForAddress: ${res.status}`);
        return res.json();
    }
    // ── Digital Asset Standard (DAS) ─────────────────────────────────────────
    async getAsset(mint) {
        // DAS takes a plain object — NOT array-wrapped — for getAsset.
        const result = await this.rpc("getAsset", { id: mint });
        return result;
    }
    async getAssetsByOwner(wallet, opts = {}) {
        const result = await this.rpc("getAssetsByOwner", {
            ownerAddress: wallet,
            page: 1,
            limit: opts.limit ?? 50,
        });
        return result;
    }
    async searchAssets(opts) {
        return this.rpc("searchAssets", [{
                ...opts,
                page: 1,
                limit: opts.limit ?? 50,
            }]);
    }
    // ── Webhooks ──────────────────────────────────────────────────────────────
    async createWebhook(config) {
        const res = await fetch(`${this.apiBaseUrl}/v0/webhooks?api-key=${this.apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(config),
        });
        if (!res.ok) {
            const text = await res.text().catch(() => res.statusText);
            throw new Error(`createWebhook: ${res.status} — ${text}`);
        }
        return res.json();
    }
    async listWebhooks() {
        const res = await fetch(`${this.apiBaseUrl}/v0/webhooks?api-key=${this.apiKey}`);
        if (!res.ok)
            throw new Error(`listWebhooks: ${res.status}`);
        return res.json();
    }
    async deleteWebhook(webhookId) {
        const res = await fetch(`${this.apiBaseUrl}/v0/webhooks/${webhookId}?api-key=${this.apiKey}`, {
            method: "DELETE",
        });
        return res.ok;
    }
    // ── Simulation (no private key needed — useful for CU estimation) ─────────
    /**
     * Simulate a base64-encoded serialized transaction.
     * Returns unitsConsumed for compute budget optimization.
     */
    async simulateTransaction(serializedBase64) {
        const result = await this.rpc("simulateTransaction", [serializedBase64, { encoding: "base64", commitment: "confirmed", replaceRecentBlockhash: true }]);
        return result.value;
    }
}
/** Create a HeliusClient from environment variables */
export function createHeliusClient(apiKey) {
    const key = apiKey ?? process.env.HELIUS_API_KEY;
    if (!key)
        return null;
    return new HeliusClient({ apiKey: key });
}
