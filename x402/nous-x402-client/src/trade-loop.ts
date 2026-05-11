#!/usr/bin/env node

/**
 * Autonomous Trading Loop
 *
 * Trades Solana DeFi to earn USDC for x402 inference payments.
 * Implements the OODA loop: Observe → Orient → Decide → Act
 *
 * Uses OpenClawd's MCP server tools for:
 * - Solana price data (Jupiter, CoinGecko)
 * - Token scanning (Pump.fun, SolanaTracker)
 * - Wallet analytics (Helius DAS)
 *
 * Runs entirely privately — just needs a Solana wallet with some SOL for gas.
 *
 * @package @openclawdsolana/nous-x402
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TradeConfig {
  /** Trading wallet private key (SOLANA_PRIVATE_KEY) */
  privateKey?: string;
  /** Public key of trading wallet */
  publicKey: string;
  /** Minimum SOL balance to maintain for gas */
  minGasBalance: number;
  /** Target USDC profit per trade cycle */
  targetProfitUsdc: number;
  /** Maximum SOL per trade */
  maxTradeSizeSol: number;
  /** Trading mode: paper (simulated) or live */
  mode: 'paper' | 'live';
  /** Interval between trade cycles in ms */
  cycleIntervalMs: number;
  /** RPC URL */
  rpcUrl: string;
}

export interface TradeSignal {
  type: 'buy' | 'sell';
  token: string;
  amount: number;
  reason: string;
  confidence: number;
}

export interface TradeResult {
  success: boolean;
  token: string;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  txHash?: string;
  profitUsdc?: number;
  error?: string;
  timestamp: number;
}

export interface TradingStats {
  totalTrades: number;
  successfulTrades: number;
  failedTrades: number;
  totalProfitUsdc: number;
  totalFeesPaidSol: number;
  startBalance: number;
  currentBalance: number;
  cycleCount: number;
  lastTradeTime: number | null;
}

// ─── Default Config ──────────────────────────────────────────────────────────

const DEFAULT_CONFIG: TradeConfig = {
  minGasBalance: 0.01,
  targetProfitUsdc: 0.01,
  maxTradeSizeSol: 0.1,
  mode: 'paper',
  cycleIntervalMs: 60_000,
  rpcUrl: 'https://api.mainnet-beta.solana.com',
  publicKey: '',
};

// ─── Price Cache ─────────────────────────────────────────────────────────────

interface CachedPrice {
  price: number;
  change24h: number;
  timestamp: number;
}

const priceCache = new Map<string, CachedPrice>();

// ─── Autonomous Trading Loop ─────────────────────────────────────────────────

export class TradeLoop {
  public config: TradeConfig;
  public stats: TradingStats;
  private running = false;
  private cycleTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(config: Partial<TradeConfig> = {}) {
    this.config = {
      ...DEFAULT_CONFIG,
      publicKey: process.env.SOLANA_PUBLIC_KEY ?? '',
      privateKey: process.env.SOLANA_PRIVATE_KEY,
      rpcUrl: process.env.SOLANA_RPC_URL ?? DEFAULT_CONFIG.rpcUrl,
      mode: (process.env.TRADE_MODE as 'paper' | 'live') ?? 'paper',
      ...config,
    };

    this.stats = {
      totalTrades: 0,
      successfulTrades: 0,
      failedTrades: 0,
      totalProfitUsdc: 0,
      totalFeesPaidSol: 0,
      startBalance: 0,
      currentBalance: 0,
      cycleCount: 0,
      lastTradeTime: null,
    };
  }

  async start(): Promise<void> {
    console.error('🦞 [TradeLoop] Starting autonomous trading...');
    console.error(`   Mode: ${this.config.mode}`);
    console.error(`   Cycle interval: ${this.config.cycleIntervalMs}ms`);

    this.running = true;

    const balance = await this.getBalance();
    this.stats.startBalance = balance.sol;

    await this.runCycle();
    this.scheduleNext();
  }

  stop(): void {
    console.error('🦞 [TradeLoop] Stopping...');
    this.running = false;
    if (this.cycleTimer) {
      clearTimeout(this.cycleTimer);
      this.cycleTimer = null;
    }
  }

  private scheduleNext(): void {
    if (!this.running) return;
    this.cycleTimer = setTimeout(
      () => this.runCycle().then(() => this.scheduleNext()),
      this.config.cycleIntervalMs
    );
  }

  async runCycle(): Promise<void> {
    if (!this.running) return;

    this.stats.cycleCount++;
    const cycleNum = this.stats.cycleCount;

    try {
      console.error(`\n🦞 [TradeLoop] Cycle ${cycleNum}`);

      const signals = await this.observe();

      if (signals.length === 0) {
        console.error('   No trade signals this cycle');
        return;
      }

      const bestSignal = this.orient(signals);
      if (!bestSignal) {
        console.error('   No actionable signal');
        return;
      }

      console.error(`   Signal: ${bestSignal.type.toUpperCase()} ${bestSignal.token}`);
      console.error(`   Confidence: ${(bestSignal.confidence * 100).toFixed(0)}%`);

      const balance = await this.getBalance();
      this.stats.currentBalance = balance.sol;

      if (balance.sol < this.config.minGasBalance) {
        console.error(`   Low SOL: ${balance.sol.toFixed(4)} (need ${this.config.minGasBalance})`);
        return;
      }

      const result = await this.execute(bestSignal);

      if (result.success) {
        this.stats.successfulTrades++;
        this.stats.totalProfitUsdc += result.profitUsdc ?? 0;
        this.stats.totalFeesPaidSol += 0.000005;
        this.stats.lastTradeTime = Date.now();
        console.error(`   Trade OK | Profit: $${(result.profitUsdc ?? 0).toFixed(4)}`);
      } else {
        this.stats.failedTrades++;
        console.error(`   Trade failed: ${result.error}`);
      }
    } catch (err) {
      console.error(`   Cycle ${cycleNum} error:`, err instanceof Error ? err.message : String(err));
    }

    if (cycleNum % 10 === 0) this.logStats();
  }

  private async observe(): Promise<TradeSignal[]> {
    const signals: TradeSignal[] = [];

    try {
      const solPrice = await this.getSolPrice();
      if (solPrice.change24h > 5) {
        signals.push({
          type: 'sell', token: 'SOL',
          amount: this.config.maxTradeSizeSol * 0.5,
          reason: `SOL up ${solPrice.change24h.toFixed(1)}%`,
          confidence: 0.6,
        });
      } else if (solPrice.change24h < -5) {
        signals.push({
          type: 'buy', token: 'SOL',
          amount: this.config.maxTradeSizeSol * 0.3,
          reason: `SOL dip ${Math.abs(solPrice.change24h).toFixed(1)}%`,
          confidence: 0.5,
        });
      }

      const trending = await this.getTrendingTokens();
      for (const token of trending.slice(0, 3)) {
        if (token.volume24h > 10000 && token.priceChange24h > 10) {
          signals.push({
            type: 'buy', token: token.address,
            amount: this.config.maxTradeSizeSol * 0.2,
            reason: `Trending: ${token.symbol} (+${token.priceChange24h.toFixed(1)}%)`,
            confidence: Math.min(0.7, token.priceChange24h / 100),
          });
        }
      }
    } catch (err) {
      console.error('   [Observe] Error:', err instanceof Error ? err.message : String(err));
    }

    return signals;
  }

  private orient(signals: TradeSignal[]): TradeSignal | null {
    const actionable = signals.filter(s => s.confidence >= 0.4);
    if (actionable.length === 0) return null;
    actionable.sort((a, b) => b.confidence - a.confidence);
    return actionable[0];
  }

  private async execute(signal: TradeSignal): Promise<TradeResult> {
    const result: TradeResult = {
      success: false, token: signal.token,
      side: signal.type, amount: signal.amount,
      price: 0, timestamp: Date.now(),
    };

    try {
      if (this.config.mode === 'paper') {
        const price = await this.getTokenPrice(signal.token);
        result.price = price;
        result.profitUsdc = signal.type === 'sell'
          ? signal.amount * price * 0.01
          : 0;
        result.success = true;
        console.error(`   [PAPER] ${signal.type.toUpperCase()} ${signal.amount} @ $${price.toFixed(6)}`);
      } else {
        const price = await this.getTokenPrice(signal.token);
        result.price = price;
        result.error = 'Live trading requires Jupiter swap integration';
        console.error(`   [LIVE] Would trade: ${signal.type.toUpperCase()} ${signal.amount} ${signal.token}`);
      }
    } catch (err) {
      result.error = err instanceof Error ? err.message : String(err);
    }

    this.stats.totalTrades++;
    return result;
  }

  private async getSolPrice(): Promise<{ price: number; change24h: number }> {
    const cached = priceCache.get('SOL');
    if (cached && Date.now() - cached.timestamp < 10_000) {
      return { price: cached.price, change24h: cached.change24h };
    }

    try {
      const res = await fetch(
        'https://api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112',
        { headers: { Accept: 'application/json' } }
      );
      if (res.ok) {
        const data = (await res.json()) as any;
        const p = data.data?.So11111111111111111111111111111111111111112;
        if (p) {
          const price = parseFloat(p.price);
          const change24h = parseFloat(p.price24hChange ?? '0');
          priceCache.set('SOL', { price, change24h, timestamp: Date.now() });
          return { price, change24h };
        }
      }
    } catch { /* fallback */ }

    try {
      const res = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_24hr_change=true'
      );
      const data = (await res.json()) as any;
      const price = data?.solana?.usd ?? 150;
      const change24h = data?.solana?.usd_24h_change ?? 0;
      priceCache.set('SOL', { price, change24h, timestamp: Date.now() });
      return { price, change24h };
    } catch {
      return { price: 150, change24h: 0 };
    }
  }

  private async getTokenPrice(mint: string): Promise<number> {
    if (mint === 'SOL') return (await this.getSolPrice()).price;
    const cached = priceCache.get(mint);
    if (cached && Date.now() - cached.timestamp < 30_000) return cached.price;

    try {
      const res = await fetch(`https://api.jup.ag/price/v2?ids=${mint}`, {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = (await res.json()) as any;
        const price = parseFloat(data.data?.[mint]?.price ?? '0');
        if (price > 0) priceCache.set(mint, { price, change24h: 0, timestamp: Date.now() });
        return price;
      }
    } catch { /* ignore */ }
    return 0;
  }

  private async getTrendingTokens(): Promise<Array<{
    address: string; symbol: string;
    priceChange24h: number; volume24h: number; liquidity: number;
  }>> {
    const tokens: Array<{
      address: string; symbol: string;
      priceChange24h: number; volume24h: number; liquidity: number;
    }> = [];

    try {
      const res = await fetch('https://data.solanatracker.io/tokens/trending?limit=10', {
        headers: { Accept: 'application/json', 'x-api-key': process.env.SOLANA_TRACKER_API_KEY ?? '' },
      });
      if (res.ok) {
        const data = (await res.json()) as any;
        const list = data.tokens ?? data ?? [];
        for (const t of Array.isArray(list) ? list : []) {
          tokens.push({
            address: t.mint ?? t.address ?? '',
            symbol: t.symbol ?? '???',
            priceChange24h: t.priceChange24h ?? t.priceChange ?? 0,
            volume24h: t.volume24h ?? t.volume ?? 0,
            liquidity: t.liquidity ?? 0,
          });
        }
      }
    } catch {
      try {
        const res = await fetch('https://token.jup.ag/strict', {
          headers: { Accept: 'application/json' },
        });
        if (res.ok) {
          const data = (await res.json()) as any[];
          for (const t of (data ?? []).slice(0, 10)) {
            tokens.push({
              address: t.address ?? '', symbol: t.symbol ?? '???',
              priceChange24h: 0, volume24h: t.volume ?? t.daily_volume ?? 0,
              liquidity: 0,
            });
          }
        }
      } catch { /* ignore */ }
    }
    return tokens;
  }

  private async getBalance(): Promise<{ sol: number }> {
    try {
      const pubkey = this.config.publicKey;
      if (!pubkey) return { sol: 0 };
      const heliusKey = process.env.HELIUS_API_KEY ?? '';
      const rpcUrl = heliusKey
        ? `https://mainnet.helius-rpc.com/?api-key=${heliusKey}`
        : 'https://api.mainnet-beta.solana.com';
      const res = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getBalance', params: [pubkey] }),
      });
      const data = (await res.json()) as any;
      return { sol: (data?.result?.value ?? 0) / 1e9 };
    } catch { return { sol: 0 }; }
  }

  private logStats(): void {
    console.error(`\n Stats:`);
    console.error(`   Cycles: ${this.stats.cycleCount}`);
    console.error(`   Trades: ${this.stats.totalTrades} (${this.stats.successfulTrades} OK / ${this.stats.failedTrades} fail)`);
    console.error(`   Profit: $${this.stats.totalProfitUsdc.toFixed(4)} USDC`);
    console.error(`   Balance: ${this.stats.currentBalance.toFixed(4)} SOL`);
  }

  getSummary(): string {
    return [
      `Trades: ${this.stats.totalTrades} (${this.stats.successfulTrades} OK / ${this.stats.failedTrades} fail)`,
      `Profit: $${this.stats.totalProfitUsdc.toFixed(4)} USDC`,
      `Cycles: ${this.stats.cycleCount}`,
      `Mode: ${this.config.mode}`,
    ].join(' | ');
  }
}

// ─── CLI Entrypoint ──────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const mode = args.includes('--live') ? 'live' as const : 'paper' as const;

  const trader = new TradeLoop({
    mode,
    cycleIntervalMs: args.includes('--fast') ? 15_000 : 60_000,
  });

  process.on('SIGINT', () => {
    console.error('\n Shutting down...');
    trader.stop();
    console.error(trader.getSummary());
    process.exit(0);
  });
  process.on('SIGTERM', () => { trader.stop(); process.exit(0); });

  await trader.start();
}

if (process.argv[1]?.endsWith('trade-loop.js') || process.argv[1]?.endsWith('trade-loop.ts')) {
  main().catch(err => { console.error('Fatal:', err); process.exit(1); });
}
