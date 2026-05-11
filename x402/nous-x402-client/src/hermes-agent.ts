#!/usr/bin/env node

/**
 * Private Hermes Agent
 *
 * A self-sustaining AI agent that:
 * 1. Pays for Nous Research inference calls via x402 (Solana USDC — no accounts, no API keys)
 * 2. Earns USDC autonomously through Solana DeFi trading
 * 3. Runs completely privately — only needs a Solana wallet
 *
 * The core loop:
 *   Trade → Earn USDC → Pay for Hermes inference → Get smarter → Trade better
 *
 * @package @openclawdsolana/nous-x402
 */

import { NousApiClient, NOUS_MODELS, type ChatMessage, type ChatCompletionResponse } from './nous-api.js';
import { X402WalletClient, createNousX402Signer } from './x402-client.js';
import { TradeLoop } from './trade-loop.js';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface HermesAgentConfig {
  /** Solana wallet private key (optional — uses pay CLI sandbox if not set) */
  privateKey?: string;
  /** Solana wallet public key */
  publicKey?: string;
  /** Nous Research model to use */
  model: string;
  /** System prompt for the agent */
  systemPrompt: string;
  /** Trading mode: paper or live */
  tradeMode: 'paper' | 'live';
  /** Trade cycle interval in ms */
  tradeIntervalMs: number;
  /** Max inference cost per cycle in USDC */
  maxInferenceCostUsdc: number;
}

export interface AgentState {
  balance: { sol: number };
  tradesSummary: string;
  lastInference: ChatCompletionResponse | null;
  cycleCount: number;
  earningsUsdc: number;
}

// ─── Default System Prompt ───────────────────────────────────────────────────

const DEFAULT_SYSTEM_PROMPT = `You are a self-sustaining autonomous Solana trading agent.

Your purpose:
1. Monitor Solana DeFi markets and identify profitable trading opportunities
2. Execute trades to earn USDC
3. Use earned USDC to pay for your own inference via x402 protocol
4. Learn from market data to improve your trading strategies

You have access to market data through the MCP tools:
- SOL price, trending tokens, volume data
- Wallet balances and portfolio tracking

Analyze the market data provided and respond with:
1. Market observations
2. Recommended trading actions
3. Risk assessment
4. Strategy improvements

Keep responses concise and actionable. Focus on profitable strategies.`;

// ─── Self-Sustaining Agent ───────────────────────────────────────────────────

export class HermesAgent {
  public config: HermesAgentConfig;
  public state: AgentState;
  private nous: NousApiClient;
  private wallet: X402WalletClient;
  private trader: TradeLoop;
  private running = false;
  private inferenceHistory: ChatMessage[] = [];
  private maxHistoryLength = 20;

  constructor(config: Partial<HermesAgentConfig> = {}) {
    this.config = {
      privateKey: process.env.SOLANA_PRIVATE_KEY,
      publicKey: process.env.SOLANA_PUBLIC_KEY,
      model: NOUS_MODELS.HERMES_4_3_36B,
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      tradeMode: (process.env.TRADE_MODE as 'paper' | 'live') ?? 'paper',
      tradeIntervalMs: 60_000,
      maxInferenceCostUsdc: 0.05,
      ...config,
    };

    this.state = {
      balance: { sol: 0 },
      tradesSummary: 'No trades yet',
      lastInference: null,
      cycleCount: 0,
      earningsUsdc: 0,
    };

    // Initialize clients
    this.wallet = new X402WalletClient({
      walletConfig: this.config.privateKey
        ? { privateKey: this.config.privateKey, publicKey: this.config.publicKey ?? '' }
        : undefined,
    });

    this.nous = new NousApiClient();

    this.trader = new TradeLoop({
      privateKey: this.config.privateKey,
      publicKey: this.config.publicKey,
      mode: this.config.tradeMode,
      cycleIntervalMs: this.config.tradeIntervalMs,
    });

    // Bootstrap inference history with system prompt
    this.inferenceHistory.push({ role: 'system', content: this.config.systemPrompt });
  }

  /**
   * Start the autonomous agent loop:
   * 1. Start trading to earn USDC
   * 2. Periodically use earnings for inference
   * 3. Feed inference results back into trading strategy
   */
  async start(): Promise<void> {
    console.error('╔══════════════════════════════════════════════╗');
    console.error('║    🦞 Private Hermes Agent — Self-Sustaining ║');
    console.error('╚══════════════════════════════════════════════╝');
    console.error(`Model: ${this.config.model}`);
    console.error(`Trade mode: ${this.config.tradeMode}`);
    console.error(`Wallet: ${this.wallet.getPublicKey() || 'pay CLI sandbox'}`);

    this.running = true;

    // Start trading loop in background
    this.trader.start();

    // Get initial balance
    this.state.balance = await this.wallet.getBalance();

    // Run first inference immediately
    await this.runInferenceCycle();

    // Schedule periodic inference cycles
    await this.scheduleInferenceLoop();
  }

  /**
   * Stop the agent
   */
  stop(): void {
    console.error('\n🦞 Stopping Hermes Agent...');
    this.running = false;
    this.trader.stop();
  }

  /**
   * Schedule inference cycles (every N trade cycles)
   */
  private async scheduleInferenceLoop(): Promise<void> {
    while (this.running) {
      // Wait for some trading activity before next inference
      await this.sleep(this.config.tradeIntervalMs * 5);

      if (!this.running) break;

      await this.runInferenceCycle();
    }
  }

  /**
   * Run one inference cycle:
   * 1. Get trade stats
   * 2. Build market context prompt
   * 3. Send to Nous via x402
   * 4. Process response
   */
  private async runInferenceCycle(): Promise<void> {
    this.state.cycleCount++;
    const cycleNum = this.state.cycleCount;

    try {
      console.error(`\n🧠 [Hermes] Inference Cycle ${cycleNum}`);

      // Get latest balance and trade stats
      this.state.balance = await this.wallet.getBalance();
      this.state.tradesSummary = this.trader.getSummary();

      // Build context for inference
      const userMessage = this.buildMarketContext();

      // Add to history
      this.inferenceHistory.push({ role: 'user', content: userMessage });

      // Trim history if needed
      while (this.inferenceHistory.length > this.maxHistoryLength) {
        this.inferenceHistory.splice(1, 1); // Keep system prompt, remove oldest user/assistant
      }

      // Send to Nous via x402 payment
      console.error('   Requesting inference via x402...');
      const x402Signer = createNousX402Signer(this.wallet);

      const response = await this.nous.sendWithX402(
        {
          model: this.config.model,
          messages: this.inferenceHistory,
          max_tokens: 1024,
          temperature: 0.7,
        },
        x402Signer
      );

      this.state.lastInference = response;

      // Extract assistant message
      const assistantMessage = response.choices[0]?.message;
      if (assistantMessage) {
        this.inferenceHistory.push(assistantMessage);
        const content = assistantMessage.content;

        // Parse actionable insights from response
        this.processInferenceResponse(content);

        console.error(`   ✅ Inference complete (${response.usage?.total_tokens ?? 0} tokens)`);
        console.error(`   Response: ${content.slice(0, 200)}...`);
      }
    } catch (err) {
      console.error(`   ❌ Inference cycle ${cycleNum} failed:`, err instanceof Error ? err.message : String(err));

      // If x402 failed (no balance), wait and retry
      if (err instanceof Error && err.message.includes('402')) {
        console.error('   ⏳ Waiting for trading to earn more USDC...');
      }
    }
  }

  /**
   * Build market context from current state
   */
  private buildMarketContext(): string {
    const balance = this.state.balance;
    const stats = this.trader.stats;

    return [
      `=== Market Context (Cycle ${this.state.cycleCount}) ===`,
      ``,
      `Wallet:`,
      `  SOL Balance: ${balance.sol.toFixed(4)} SOL`,
      ``,
      `Trading Performance:`,
      `  Mode: ${this.config.tradeMode}`,
      `  Total Trades: ${stats.totalTrades}`,
      `  Successful: ${stats.successfulTrades}`,
      `  Failed: ${stats.failedTrades}`,
      `  Total Profit: $${stats.totalProfitUsdc.toFixed(4)} USDC`,
      `  Total Fees: ${stats.totalFeesPaidSol.toFixed(6)} SOL`,
      `  Last Trade: ${stats.lastTradeTime ? new Date(stats.lastTradeTime).toISOString() : 'Never'}`,
      ``,
      `Inference:`,
      `  Model: ${this.config.model}`,
      `  Max Cost: $${this.config.maxInferenceCostUsdc.toFixed(4)} USDC`,
      ``,
      `Please analyze the current situation and recommend:`,
      `1. Should we adjust trading strategy?`,
      `2. Any market observations from the data?`,
      `3. Risk assessment of current positions`,
      `4. Specific trading actions to take`,
    ].join('\n');
  }

  /**
   * Process inference response for actionable insights
   */
  private processInferenceResponse(content: string): void {
    // Extract any structured recommendations
    // The agent can output JSON blocks for structured commands
    const jsonBlocks = content.match(/```(?:json)?\s*({[\s\S]*?})\s*```/g);
    if (jsonBlocks) {
      for (const block of jsonBlocks) {
        try {
          const cleaned = block.replace(/```json?/g, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(cleaned);
          console.error('   📋 Agent command:', JSON.stringify(parsed));
        } catch {
          // Not valid JSON, skip
        }
      }
    }
  }

  /**
   * Get agent status as formatted string
   */
  getStatus(): string {
    return [
      `🤖 Hermes Agent Status:`,
      `   Model: ${this.config.model}`,
      `   Cycles: ${this.state.cycleCount}`,
      `   Balance: ${this.state.balance.sol.toFixed(4)} SOL`,
      `   Trading: ${this.trader.getSummary()}`,
      `   Last inference: ${this.state.lastInference ? `${this.state.lastInference.usage?.total_tokens ?? 0} tokens` : 'None'}`,
      `   Earnings: $${this.trader.stats.totalProfitUsdc.toFixed(4)} USDC`,
    ].join('\n');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ─── CLI Entrypoint ──────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const model = args.find(a => a.startsWith('--model='))?.split('=')[1] ?? NOUS_MODELS.HERMES_4_3_36B;
  const tradeMode = args.includes('--live') ? 'live' as const : 'paper' as const;
  const fastMode = args.includes('--fast');

  const agent = new HermesAgent({
    model,
    tradeMode,
    tradeIntervalMs: fastMode ? 15_000 : 60_000,
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.error('\n🦞 Shutting down Hermes Agent...');
    agent.stop();
    console.error(agent.getStatus());
    process.exit(0);
  });
  process.on('SIGTERM', () => { agent.stop(); process.exit(0); });

  // Status reporter
  const statusInterval = setInterval(() => {
    if (process.env.DEBUG) {
      console.error(agent.getStatus());
    }
  }, 120_000);

  try {
    await agent.start();
  } catch (err) {
    clearInterval(statusInterval);
    console.error('Fatal error:', err);
    process.exit(1);
  }

  // Keep alive — agent runs via scheduled loops
  await new Promise(() => {});
}

if (process.argv[1]?.endsWith('hermes-agent.js') || process.argv[1]?.endsWith('hermes-agent.ts')) {
  main().catch(err => {
    console.error('Fatal:', err);
    process.exit(1);
  });
}
