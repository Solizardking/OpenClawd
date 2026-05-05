/**
 * BirdeyeService — agent-facing Birdeye wrapper.
 *
 * Surfaces the methods Analyst/Monitor agents call. Each call returns
 * undefined/empty on transport error (agents continue rather than crash).
 * Uses the public Birdeye API at public-api.birdeye.so with the
 * x-chain: solana convention and the BIRDEYE_API_KEY header.
 */
const BIRDEYE_BASE = 'https://public-api.birdeye.so';
export class BirdeyeService {
    apiKey;
    constructor(apiKey) {
        this.apiKey = apiKey ?? process.env.BIRDEYE_API_KEY ?? '';
    }
    hasKey() {
        return Boolean(this.apiKey);
    }
    async get(path, params = {}) {
        if (!this.apiKey)
            return null;
        const url = new URL(BIRDEYE_BASE + path);
        for (const [k, v] of Object.entries(params))
            url.searchParams.set(k, String(v));
        try {
            const res = await fetch(url, {
                headers: {
                    accept: 'application/json',
                    'x-chain': 'solana',
                    'X-API-KEY': this.apiKey,
                },
            });
            if (!res.ok)
                return null;
            const json = (await res.json());
            if (json.success === false)
                return null;
            return (json.data ?? json);
        }
        catch {
            return null;
        }
    }
    async getPrice(mint) {
        const data = await this.get('/defi/price', { address: mint });
        return data?.value ?? null;
    }
    async getTokenInfo(mint) {
        return this.get('/defi/token_overview', {
            address: mint,
            ui_amount_mode: 'scaled',
        });
    }
    async getOHLCV(mint, opts = {}) {
        const type = opts.type ?? '1H';
        const limit = opts.limit ?? 100;
        const now = Math.floor(Date.now() / 1000);
        const interval = { '1m': 60, '5m': 300, '15m': 900, '1H': 3600, '4H': 14400, '1D': 86400 }[type];
        const from = now - interval * limit;
        const data = await this.get('/defi/ohlcv', {
            address: mint,
            type,
            time_from: from,
            time_to: now,
        });
        return data?.items ?? [];
    }
    async getVolume(mint) {
        const info = await this.getTokenInfo(mint);
        return info?.v24hUSD ?? null;
    }
    async getTrending(opts = {}) {
        const limit = opts.limit ?? 20;
        const data = await this.get('/defi/token_trending', {
            sort_by: 'rank',
            sort_type: 'asc',
            offset: 0,
            limit,
        });
        return data?.tokens ?? [];
    }
}
