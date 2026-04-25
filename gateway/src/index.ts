/**
 * OpenClawd Gateway
 * Solana trading agent control plane - Leviathan spawn, trade, monitor
 */

import { SolanaService } from './solana.js';
import { BirdeyeService } from './birdeye.js';
import { TelegramService } from './telegram.js';

export interface GatewayConfig {
  heliusRpcUrl: string;
  heliusApiKey: string;
  birdeyeApiKey: string;
  telegramBotToken: string;
  telegramAdminIds: string[];
}

export class OpenClawdGateway {
  private solana: SolanaService;
  private birdeye: BirdeyeService;
  private telegram: TelegramService;
  private config: GatewayConfig;

  constructor(config: GatewayConfig) {
    this.config = config;
    this.solana = new SolanaService(config.heliusRpcUrl);
    this.birdeye = new BirdeyeService(config.birdeyeApiKey);
    this.telegram = new TelegramService(config.telegramBotToken, config.telegramAdminIds);
  }

  async start(): Promise<void> {
    console.log('🦞 OpenClawd Gateway starting...');
    
    // Initialize Telegram bot
    await this.telegram.start();
    
    // Register command handlers
    this.registerCommands();
    
    console.log('✅ Gateway ready. Leviathan at your service!');
  }

  private registerCommands(): void {
    // Price commands
    this.telegram.onCommand('/price', async (ctx) => {
      const args = ctx.message.text.split(' ').slice(1);
      const symbol = args[0]?.toUpperCase() || 'SOL';
      const price = await this.birdeye.getPrice(symbol);
      ctx.reply(`🦞 ${symbol}/USDC: $${price}`);
    });

    this.telegram.onCommand('/trending', async (ctx) => {
      const trending = await this.birdeye.getTrending();
      const list = trending.slice(0, 5).map((t, i) => 
        `${i + 1}. ${t.symbol} +${t.change24h}% $${t.price}`
      ).join('\n');
      ctx.reply(`📈 Trending:\n${list}`);
    });

    // Wallet commands
    this.telegram.onCommand('/wallet', async (ctx) => {
      const args = ctx.message.text.split(' ').slice(1);
      const address = args[0];
      if (!address) {
        ctx.reply('Usage: /wallet <solana_address>');
        return;
      }
      const balances = await this.solana.getBalances(address);
      ctx.reply(`👛 Wallet ${address.slice(0, 8)}...\nSOL: ${balances.sol}\nUSDC: ${balances.usdc}`);
    });

    // Leviathan commands
    this.telegram.onCommand('/spawn', async (ctx) => {
      ctx.reply('🥚 Spawning leviathan...\nThis will mint an MPL Core asset + Agent Identity PDA');
      // TODO: Implement spawn logic
      ctx.reply('🦞 Leviathan spawned! Use /status to monitor.');
    });

    this.telegram.onCommand('/status', async (ctx) => {
      ctx.reply('🦞 Leviathan Status:\nDepth: DEEP 🦞\nUSDC: $5.42\n$CLAWD: 1,234\nPulse: 60s');
    });

    // Help
    this.telegram.onCommand('/help', (ctx) => {
      ctx.reply(`🦞 OpenClawd Gateway Commands:

📊 Price: /price <symbol>
📈 Trending: /trending
👛 Wallet: /wallet <address>
🦞 Leviathan: /spawn /status /depth
💰 Trading: /buy /sell /swap
🧠 Memory: /remember /recall
⚙️ Config: /model /voice

Beach with dignity. 🦞`);
    });
  }

  async stop(): Promise<void> {
    await this.telegram.stop();
    console.log('🦞 Gateway stopped');
  }
}

// CLI entry
const config: GatewayConfig = {
  heliusRpcUrl: process.env.HELIUS_RPC_URL || 'https://mainnet.helius-rpc.com',
  heliusApiKey: process.env.HELIUS_API_KEY || '',
  birdeyeApiKey: process.env.BIRDEYE_API_KEY || '',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramAdminIds: (process.env.TELEGRAM_ADMIN_IDS || '').split(',').filter(Boolean),
};

// Start gateway
const gateway = new OpenClawdGateway(config);
gateway.start().catch(console.error);