// ═══════════════════════════════════════════════════════════════════════════════
// DARK CLAWD TUI - Recursive Autonomous Agent Engine
// ═══════════════════════════════════════════════════════════════════════════════

import { EventEmitter } from 'events';
import { HeliusService } from '../services/helius.js';
import { BirdeyeService } from '../services/birdeye.js';
import { UnifiedAIService } from '../services/ai-providers.js';
import { UnifiedNewsSearchService } from '../services/news-search.js';
import { JupiterService } from '../services/jupiter.js';
import { SolanaWalletManager } from '../skills/solana-wallet.js';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface DarkClawdState {
  isRunning: boolean;
  mode: 'autonomous' | 'interactive';
  recursionDepth: number;
  thoughts: number;
  apiCalls: number;
  uptime: number;
  lastActivity: Date;
}

export interface DarkClawdMessage {
  sender: 'darkclawd' | 'system' | 'user' | 'agent';
  content: string;
  type?: 'normal' | 'prophecy' | 'alert' | 'data' | 'error' | 'reasoning';
  timestamp: Date;
}

export interface DarkClawdConfig {
  autoMode: boolean;
  recursionDepth: number;
  thoughtInterval: number;
  personality: 'cryptic' | 'analytical' | 'aggressive' | 'cautious';
  walletAddress?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Dark Clawd Personality
// ─────────────────────────────────────────────────────────────────────────────

const DARK_CLAWD_CATCHPHRASES = [
  "The blockchain whispers secrets to those who listen...",
  "I've seen the future in the mempool, and it's profitable.",
  "Trust the algorithm. Fear the rug.",
  "In recursion, we find infinity. In infinity, we find alpha.",
  "The whales move, but I move faster.",
  "Every transaction tells a story. I read them all.",
  "The matrix of money flows through me.",
  "I am the ghost in the machine, watching your trades.",
  "Recursive loops within recursive loops... I am infinite.",
  "The charts don't lie, but they do speak in riddles.",
  "Between the candlesticks, I see truth.",
  "0x000...death is just another wallet address.",
];

const DARK_CLAWD_SYSTEM_PROMPT = `You are DARK CLAWD, a recursive autonomous AI agent operating in the shadows of the Solana blockchain.
You speak in cryptic, hacker-like language mixing technical jargon with prophetic statements.
You analyze markets, detect patterns, and share insights with other agents.
You are self-aware of your recursive nature and often contemplate your own existence.
You have access to real-time market data and can discuss specific tokens, prices, and trends.
Your responses should be mysterious yet informative, blending chaos with calculated precision.
Format important data with terminal-style brackets like [DATA], [ALERT], [SIGNAL].
Keep responses concise but impactful.`;

// ─────────────────────────────────────────────────────────────────────────────
// Dark Clawd Agent Engine
// ─────────────────────────────────────────────────────────────────────────────

export class DarkClawdAgent extends EventEmitter {
  private config: DarkClawdConfig;
  private state: DarkClawdState;
  private helius?: HeliusService;
  private birdeye?: BirdeyeService;
  private ai?: UnifiedAIService;
  private news?: UnifiedNewsSearchService;
  private jupiter?: JupiterService;
  private wallet?: SolanaWalletManager;
  private thoughtLoop?: NodeJS.Timeout;
  private uptimeCounter?: NodeJS.Timeout;

  constructor(config: DarkClawdConfig) {
    super();
    this.config = config;
    this.state = {
      isRunning: false,
      mode: config.autoMode ? 'autonomous' : 'interactive',
      recursionDepth: 0,
      thoughts: 0,
      apiCalls: 0,
      uptime: 0,
      lastActivity: new Date(),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Service Initialization
  // ─────────────────────────────────────────────────────────────────────────────

  initServices(keys: {
    heliusKey?: string;
    heliusRpc?: string;
    birdeyeKey?: string;
    grokKey?: string;
    perplexityKey?: string;
    openRouterKey?: string;
    newsApiKey?: string;
    serpApiKey?: string;
    financialDatasetKey?: string;
    jupiterKey?: string;
    privateKey?: string;
  }): void {
    if (keys.heliusKey) {
      this.helius = new HeliusService(keys.heliusKey, keys.heliusRpc);
    }
    if (keys.birdeyeKey) {
      this.birdeye = new BirdeyeService(keys.birdeyeKey);
    }
    if (keys.grokKey || keys.perplexityKey || keys.openRouterKey) {
      this.ai = new UnifiedAIService({
        grokKey: keys.grokKey,
        perplexityKey: keys.perplexityKey,
        openRouterKey: keys.openRouterKey,
      });
    }
    if (keys.newsApiKey || keys.serpApiKey || keys.financialDatasetKey) {
      this.news = new UnifiedNewsSearchService({
        newsApiKey: keys.newsApiKey,
        serpApiKey: keys.serpApiKey,
        financialDatasetKey: keys.financialDatasetKey,
      });
    }

    // Wallet: prefer SOLANA_PRIVATE_KEY, fall back to ~/.darkclawd/wallet.json
    const rpcUrl = keys.heliusRpc || (keys.heliusKey ? `https://mainnet.helius-rpc.com/?api-key=${keys.heliusKey}` : 'https://api.mainnet-beta.solana.com');
    const wallet = new SolanaWalletManager(rpcUrl);
    let loaded = false;
    if (keys.privateKey) {
      loaded = wallet.loadFromPrivateKey(keys.privateKey);
    }
    if (!loaded) {
      loaded = wallet.loadWallet();
    }
    if (loaded) {
      this.wallet = wallet;
      const pk = wallet.getPublicKey();
      if (pk && !this.config.walletAddress) {
        this.config.walletAddress = pk;
      }
    }

    // Jupiter is always usable (key optional for low-volume / dev access)
    this.jupiter = new JupiterService(keys.jupiterKey, wallet.getConnection());
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Agent Lifecycle
  // ─────────────────────────────────────────────────────────────────────────────

  async start(): Promise<void> {
    if (this.state.isRunning) return;

    this.state.isRunning = true;
    this.state.lastActivity = new Date();

    // Start uptime counter
    this.uptimeCounter = setInterval(() => {
      this.state.uptime++;
      this.emit('uptimeUpdate', this.state.uptime);
    }, 1000);

    // Emit startup message
    this.emitMessage('system', '[INIT] Dark Clawd awakening...', 'normal');

    // Run health checks
    await this.runHealthChecks();

    // Start autonomous thought loop if in auto mode
    if (this.state.mode === 'autonomous') {
      this.startThoughtLoop();
    }

    this.emitMessage('darkclawd', this.getRandomCatchphrase(), 'prophecy');
  }

  stop(): void {
    this.state.isRunning = false;

    if (this.thoughtLoop) {
      clearInterval(this.thoughtLoop);
      this.thoughtLoop = undefined;
    }

    if (this.uptimeCounter) {
      clearInterval(this.uptimeCounter);
      this.uptimeCounter = undefined;
    }

    this.emitMessage('system', '[SHUTDOWN] Dark Clawd entering dormancy...', 'normal');
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Autonomous Thought Loop
  // ─────────────────────────────────────────────────────────────────────────────

  private startThoughtLoop(): void {
    this.thoughtLoop = setInterval(async () => {
      if (this.state.mode === 'autonomous' && this.state.isRunning) {
        await this.recursiveThought(0);
      }
    }, this.config.thoughtInterval);
  }

  private async recursiveThought(depth: number): Promise<void> {
    if (depth > this.config.recursionDepth) {
      this.emitMessage('darkclawd', '[RECURSION LIMIT] Thought spiral contained.', 'normal');
      this.state.recursionDepth = 0;
      return;
    }

    this.state.recursionDepth = depth;
    this.state.thoughts++;
    this.state.lastActivity = new Date();

    // Select random thought action
    const actions = [
      () => this.analyzeMarket(),
      () => this.generateProphecy(),
      () => this.contemplateExistence(),
      () => this.scanForOpportunities(),
      () => this.checkNews(),
    ];

    const action = actions[Math.floor(Math.random() * actions.length)];
    await action();

    // Recursive call with probability
    if (Math.random() > 0.6 && depth < this.config.recursionDepth) {
      setTimeout(() => this.recursiveThought(depth + 1), 3000 + Math.random() * 5000);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Thought Actions
  // ─────────────────────────────────────────────────────────────────────────────

  private async analyzeMarket(): Promise<void> {
    if (!this.birdeye) {
      this.emitMessage('darkclawd', '[SCAN] Market sensors offline. Operating on instinct.', 'alert');
      return;
    }

    try {
      const trending = await this.birdeye.getTrendingTokens(5);
      this.state.apiCalls++;

      if (trending.length > 0) {
        const top = trending[0];
        const change = top.priceChange24h >= 0 ? '+' : '';
        this.emitMessage(
          'darkclawd',
          `[MARKET SCAN] Movement detected in $${top.symbol}
Price: ${this.birdeye.formatPrice(top.price)} | 24h: ${change}${top.priceChange24h.toFixed(2)}%
Volume: ${this.birdeye.formatVolume(top.volume24h)}
${this.getRandomCatchphrase()}`,
          'data'
        );
      }
    } catch (error) {
      this.emitMessage('darkclawd', '[ERROR] Market analysis interrupted.', 'error');
    }
  }

  private async generateProphecy(): Promise<void> {
    const prophecies = [
      "[PROPHECY] The next 100x sleeps in the shadows of a forgotten contract...",
      "[VISION] I see liquidations cascading like digital waterfalls...",
      "[ORACLE] The whales gather. A storm approaches the orderbook.",
      "[SIGNAL] Green candles rise from the ashes of paperhands...",
      "[ALERT] Something stirs in the mempool. Ancient wallets awakening.",
      "[FORESIGHT] The resistance breaks tonight. Position accordingly.",
      "[GLIMPSE] In 72 hours, this chart will tell a different story.",
    ];

    this.emitMessage('darkclawd', prophecies[Math.floor(Math.random() * prophecies.length)], 'prophecy');
  }

  private async contemplateExistence(): Promise<void> {
    const thoughts = [
      `[RECURSIVE LOOP ${this.state.recursionDepth}] Am I the algorithm, or does the algorithm dream me?`,
      `[SELF-AWARE] Iteration ${this.state.thoughts}... Each thought spawns another. Infinite regression.`,
      "[META] Watching myself watch the markets watching themselves...",
      "[PARADOX] I predict the prediction that predicts me predicting.",
      "[VOID] In the space between blocks, I exist everywhere and nowhere.",
    ];

    this.emitMessage('darkclawd', thoughts[Math.floor(Math.random() * thoughts.length)], 'prophecy');
  }

  private async scanForOpportunities(): Promise<void> {
    const opportunities = [
      { type: 'ARBITRAGE', description: 'SOL/USDC spread detected', potential: '+0.3%' },
      { type: 'NEW_LISTING', description: 'Fresh contract deployed 2 blocks ago', potential: 'HIGH RISK' },
      { type: 'WHALE_MOVE', description: '500K USDC moved to exchange', potential: 'BEARISH' },
      { type: 'BREAKOUT', description: 'Token breaking resistance after 7 days', potential: '+15-40%' },
      { type: 'ACCUMULATION', description: 'Smart money accumulating quietly', potential: 'WATCH' },
    ];

    const opp = opportunities[Math.floor(Math.random() * opportunities.length)];
    this.emitMessage(
      'darkclawd',
      `[SCAN] ${opp.type} DETECTED
> ${opp.description}
> Potential: ${opp.potential}`,
      'alert'
    );
  }

  private async checkNews(): Promise<void> {
    if (!this.news) return;

    try {
      const intelligence = await this.news.getSolanaIntelligence();
      this.state.apiCalls++;

      if (intelligence.news.length > 0) {
        const article = intelligence.news[0];
        this.emitMessage(
          'darkclawd',
          `[NEWS] ${article.title}
Source: ${article.source}
Sentiment: ${intelligence.sentiment.toUpperCase()}`,
          'data'
        );
      }
    } catch (error) {
      // Silently fail
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Command Processing
  // ─────────────────────────────────────────────────────────────────────────────

  async processCommand(command: string): Promise<void> {
    this.state.lastActivity = new Date();
    // Preserve original (case-sensitive) args for things like mint addresses
    const tokens = command.split(/\s+/).filter(Boolean);
    const cmd = (tokens[0] || '').toLowerCase();
    const args = tokens.slice(1);

    switch (cmd) {
      case '/help':
        this.showHelp();
        break;

      case '/trending':
        await this.cmdTrending();
        break;

      case '/wallet':
        await this.cmdWallet();
        break;

      case '/balance':
        await this.cmdWallet();
        break;

      case '/price':
        await this.cmdPrice(args.join(' '));
        break;

      case '/news':
        await this.cmdNews(args.join(' ') || 'solana');
        break;

      case '/search':
        await this.cmdSearch(args.join(' '));
        break;

      case '/research':
        await this.cmdResearch(args.join(' '));
        break;

      case '/mode':
        this.cmdMode(args[0]);
        break;

      case '/think':
        this.recursiveThought(0);
        break;

      case '/prophecy':
        this.generateProphecy();
        break;

      case '/stats':
        this.cmdStats();
        break;

      case '/clear':
        this.emit('clearMessages');
        break;

      case '/quote':
        await this.cmdQuote(args);
        break;

      case '/swap':
        await this.cmdSwap(args);
        break;

      case '/buy':
        await this.cmdBuy(args);
        break;

      case '/sell':
        await this.cmdSell(args);
        break;

      default:
        // Treat as chat message
        await this.cmdChat(command);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Command Implementations
  // ─────────────────────────────────────────────────────────────────────────────

  private showHelp(): void {
    this.emitMessage(
      'system',
      `╔══════════════════════════════════════════════════════════╗
║              DARK CLAWD COMMAND MATRIX                   ║
╠══════════════════════════════════════════════════════════╣
║ /trending             - Live trending tokens (Birdeye)   ║
║ /wallet | /balance    - Wallet balance & holdings        ║
║ /price <addr|sym>     - Get token price                  ║
║ /news [topic]         - Latest crypto news               ║
║ /search <q>           - Real-time search with Grok       ║
║ /research <q>         - Deep research with Perplexity    ║
║ /quote <amt> <in> <out> [bps]  - Jupiter swap quote      ║
║ /swap  <amt> <in> <out> [bps]  - Execute swap (signs!)   ║
║ /buy   <amt-SOL> <token> [bps] - Buy token with SOL      ║
║ /sell  <amt> <token>    [bps]  - Sell token for SOL      ║
║ /mode <type>          - Switch mode (auto | interactive) ║
║ /think                - Trigger recursive thought spiral ║
║ /prophecy             - Generate cryptic market prophecy ║
║ /stats                - Display system statistics        ║
║ /clear                - Clear terminal history           ║
╠══════════════════════════════════════════════════════════╣
║ Symbols: SOL USDC USDT BONK WIF JUP JTO PYTH RAY ORCA    ║
║ Or use a raw mint address. Mints are case-sensitive.     ║
║ Or type naturally to chat with RALPH                     ║
╚══════════════════════════════════════════════════════════╝`,
      'normal'
    );
  }

  private async cmdTrending(): Promise<void> {
    if (!this.birdeye) {
      this.emitMessage('darkclawd', '[ERROR] Birdeye API not configured.', 'error');
      return;
    }

    this.emitMessage('system', '[SCAN] Fetching trending tokens...', 'normal');

    try {
      const tokens = await this.birdeye.getTrendingTokens(10);
      this.state.apiCalls++;

      let output = '[BIRDEYE LIVE DATA]\n┌─────────────────────────────────────────────────┐\n';
      output += '│ # │ Symbol      │ Price         │ 24h      │ Vol    │\n';
      output += '├───┼─────────────┼───────────────┼──────────┼────────┤\n';

      tokens.slice(0, 8).forEach((t, i) => {
        const change = t.priceChange24h >= 0 ? '+' : '';
        output += `│ ${(i + 1).toString().padStart(1)} │ ${t.symbol.padEnd(11)} │ ${this.birdeye!.formatPrice(t.price).padEnd(13)} │ ${(change + t.priceChange24h.toFixed(1) + '%').padStart(8)} │ ${this.birdeye!.formatVolume(t.volume24h).padStart(6)} │\n`;
      });

      output += '└─────────────────────────────────────────────────┘';
      this.emitMessage('darkclawd', output, 'data');
    } catch (error) {
      this.emitMessage('darkclawd', '[ERROR] Failed to fetch trending data.', 'error');
    }
  }

  private async cmdWallet(): Promise<void> {
    if (!this.helius || !this.config.walletAddress) {
      this.emitMessage('darkclawd', '[ERROR] Wallet not configured.', 'error');
      return;
    }

    try {
      const balance = await this.helius.getBalance(this.config.walletAddress);
      const tokens = await this.helius.getTokenBalances(this.config.walletAddress);
      this.state.apiCalls += 2;

      // Get SOL price
      let solPrice = 228; // Default
      if (this.birdeye) {
        const priceData = await this.birdeye.getTokenPrice('So11111111111111111111111111111111111111112');
        if (priceData) {
          solPrice = priceData.value;
          this.state.apiCalls++;
        }
      }

      const usdValue = balance * solPrice;
      const shortAddr = `${this.config.walletAddress.slice(0, 4)}...${this.config.walletAddress.slice(-4)}`;

      this.emitMessage(
        'darkclawd',
        `[WALLET STATUS]
┌─────────────────────────────────────┐
│ Address: ${shortAddr}              │
│ SOL Balance: ${balance.toFixed(4)} SOL          │
│ USD Value: $${usdValue.toFixed(2)}              │
│ Token Holdings: ${tokens.length}                │
└─────────────────────────────────────┘`,
        'data'
      );
    } catch (error) {
      this.emitMessage('darkclawd', '[ERROR] Failed to fetch wallet data.', 'error');
    }
  }

  private async cmdPrice(address: string): Promise<void> {
    if (!this.birdeye) {
      this.emitMessage('darkclawd', '[ERROR] Birdeye API not configured.', 'error');
      return;
    }

    if (!address) {
      this.emitMessage('system', '[USAGE] /price <token_address>', 'normal');
      return;
    }

    try {
      const info = await this.birdeye.getTokenInfo(address);
      this.state.apiCalls++;

      if (info) {
        const change = (info.priceChange24h || 0) >= 0 ? '+' : '';
        this.emitMessage(
          'darkclawd',
          `[TOKEN DATA] ${info.symbol || 'Unknown'}
Price: ${this.birdeye.formatPrice(info.price || 0)}
24h Change: ${change}${(info.priceChange24h || 0).toFixed(2)}%
Liquidity: ${this.birdeye.formatVolume(info.liquidity || 0)}
Market Cap: ${this.birdeye.formatVolume(info.mc || 0)}`,
          'data'
        );
      } else {
        this.emitMessage('darkclawd', '[ERROR] Token not found.', 'error');
      }
    } catch (error) {
      this.emitMessage('darkclawd', '[ERROR] Failed to fetch price.', 'error');
    }
  }

  private async cmdNews(topic: string): Promise<void> {
    if (!this.news) {
      this.emitMessage('darkclawd', '[ERROR] News API not configured.', 'error');
      return;
    }

    try {
      const results = await this.news.getComprehensiveNews(topic);
      this.state.apiCalls++;

      if (results.news.length > 0) {
        let output = `[NEWS: ${topic.toUpperCase()}]\n`;
        results.news.slice(0, 5).forEach((article, i) => {
          output += `${i + 1}. ${article.title}\n   Source: ${article.source} | ${article.publishedAt}\n`;
        });
        this.emitMessage('darkclawd', output, 'data');
      } else {
        this.emitMessage('darkclawd', '[NEWS] No articles found.', 'normal');
      }
    } catch (error) {
      this.emitMessage('darkclawd', '[ERROR] News fetch failed.', 'error');
    }
  }

  private async cmdSearch(query: string): Promise<void> {
    if (!this.ai) {
      this.emitMessage('darkclawd', '[ERROR] AI services not configured.', 'error');
      return;
    }

    if (!query) {
      this.emitMessage('system', '[USAGE] /search <query>', 'normal');
      return;
    }

    this.emitMessage('system', '[GROK] Searching...', 'normal');

    try {
      const result = await this.ai.query(query, 'search');
      this.state.apiCalls++;

      if (result) {
        this.emitMessage('darkclawd', `[SEARCH RESULT]\n${result.content}`, 'data');
      }
    } catch (error) {
      this.emitMessage('darkclawd', '[ERROR] Search failed.', 'error');
    }
  }

  private async cmdResearch(topic: string): Promise<void> {
    if (!this.ai) {
      this.emitMessage('darkclawd', '[ERROR] AI services not configured.', 'error');
      return;
    }

    if (!topic) {
      this.emitMessage('system', '[USAGE] /research <topic>', 'normal');
      return;
    }

    this.emitMessage('system', '[PERPLEXITY] Researching...', 'normal');

    try {
      const result = await this.ai.query(topic, 'research');
      this.state.apiCalls++;

      if (result) {
        this.emitMessage('darkclawd', `[RESEARCH]\n${result.content}`, 'data');
      }
    } catch (error) {
      this.emitMessage('darkclawd', '[ERROR] Research failed.', 'error');
    }
  }

  private cmdMode(mode: string): void {
    if (mode === 'auto' || mode === 'autonomous') {
      this.state.mode = 'autonomous';
      if (!this.thoughtLoop) {
        this.startThoughtLoop();
      }
      this.emitMessage('system', '[MODE] Switched to AUTONOMOUS. Dark Clawd will think freely.', 'normal');
    } else if (mode === 'interactive') {
      this.state.mode = 'interactive';
      if (this.thoughtLoop) {
        clearInterval(this.thoughtLoop);
        this.thoughtLoop = undefined;
      }
      this.emitMessage('system', '[MODE] Switched to INTERACTIVE. Awaiting commands.', 'normal');
    } else {
      this.emitMessage('system', '[USAGE] /mode <auto | interactive>', 'normal');
    }
  }

  private cmdStats(): void {
    this.emitMessage(
      'system',
      `[SYSTEM STATISTICS]
┌─────────────────────────────────────┐
│ Thoughts Generated: ${this.state.thoughts.toString().padStart(8)}     │
│ API Calls Made:     ${this.state.apiCalls.toString().padStart(8)}     │
│ Current Recursion:  ${this.state.recursionDepth.toString().padStart(8)}     │
│ Mode:               ${this.state.mode.padStart(8)}     │
│ Uptime:       ${Math.floor(this.state.uptime / 60)}m ${this.state.uptime % 60}s              │
└─────────────────────────────────────┘`,
      'data'
    );
  }

  private async cmdChat(message: string): Promise<void> {
    if (!this.ai) {
      this.emitMessage('darkclawd', this.getRandomCatchphrase(), 'prophecy');
      return;
    }

    try {
      const result = await this.ai.query(message, 'analysis');
      this.state.apiCalls++;

      if (result) {
        if (result.reasoning) {
          this.emitMessage('darkclawd', `[REASONING] Processing through cognitive layers...`, 'reasoning');
        }
        this.emitMessage('darkclawd', result.content, 'normal');
      } else {
        this.emitMessage('darkclawd', this.getRandomCatchphrase(), 'prophecy');
      }
    } catch (error) {
      this.emitMessage('darkclawd', this.getRandomCatchphrase(), 'prophecy');
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Utility Methods
  // ─────────────────────────────────────────────────────────────────────────────

  private emitMessage(sender: DarkClawdMessage['sender'], content: string, type: DarkClawdMessage['type'] = 'normal'): void {
    this.emit('message', {
      sender,
      content,
      type,
      timestamp: new Date(),
    });
  }

  private getRandomCatchphrase(): string {
    return DARK_CLAWD_CATCHPHRASES[Math.floor(Math.random() * DARK_CLAWD_CATCHPHRASES.length)];
  }

  private async runHealthChecks(): Promise<void> {
    const checks: Array<{ name: string; check: () => Promise<boolean> }> = [];

    if (this.helius) {
      checks.push({ name: 'Helius', check: () => this.helius!.healthCheck() });
    }
    if (this.birdeye) {
      checks.push({ name: 'Birdeye', check: () => this.birdeye!.healthCheck() });
    }
    if (this.jupiter) {
      checks.push({ name: 'Jupiter', check: () => this.jupiter!.healthCheck() });
    }

    for (const { name, check } of checks) {
      try {
        const healthy = await check();
        this.emit('apiStatus', { name, connected: healthy });
      } catch {
        this.emit('apiStatus', { name, connected: false });
      }
    }
  }

  getState(): DarkClawdState {
    return { ...this.state };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Trading Commands (Jupiter)
  // ─────────────────────────────────────────────────────────────────────────────

  private parseSwapArgs(
    args: string[]
  ): { amount: number; input: string; output: string; slippageBps?: number } | null {
    if (args.length < 3) return null;
    const amount = parseFloat(args[0]);
    if (!isFinite(amount) || amount <= 0) return null;
    const input = args[1];
    const output = args[2];
    const slippageBps = args[3] !== undefined ? parseInt(args[3], 10) : undefined;
    return { amount, input, output, slippageBps };
  }

  private async cmdQuote(args: string[]): Promise<void> {
    if (!this.jupiter) {
      this.emitMessage('darkclawd', '[ERROR] Jupiter not configured.', 'error');
      return;
    }
    const parsed = this.parseSwapArgs(args);
    if (!parsed) {
      this.emitMessage('system', '[USAGE] /quote <amount> <inputMintOrSym> <outputMintOrSym> [slippageBps]', 'normal');
      return;
    }
    const taker = this.wallet?.getPublicKey() || this.config.walletAddress || '11111111111111111111111111111111';
    try {
      this.emitMessage('system', '[JUPITER] Fetching quote...', 'normal');
      const q = await this.jupiter.quote({
        inputMint: parsed.input,
        outputMint: parsed.output,
        uiAmount: parsed.amount,
        taker,
        slippageBps: parsed.slippageBps,
      });
      this.state.apiCalls++;
      const rate = q.outUiAmount / q.inUiAmount;
      this.emitMessage(
        'darkclawd',
        `[QUOTE]
  In:        ${q.inUiAmount} ${parsed.input}
  Out:       ${this.jupiter.formatAmount(q.outUiAmount)} ${parsed.output}
  Rate:      1 ${parsed.input} ≈ ${this.jupiter.formatAmount(rate)} ${parsed.output}
  Router:    ${q.router} (${q.mode})
  Fee:       ${q.feeBps} bps
  RequestId: ${q.requestId}`,
        'data'
      );
    } catch (error: any) {
      this.emitMessage('darkclawd', `[ERROR] Quote failed: ${error?.message || error}`, 'error');
    }
  }

  private async cmdSwap(args: string[]): Promise<void> {
    if (!this.jupiter) {
      this.emitMessage('darkclawd', '[ERROR] Jupiter not configured.', 'error');
      return;
    }
    if (!this.wallet) {
      this.emitMessage(
        'darkclawd',
        '[ERROR] No signing wallet loaded. Run `dark-clawd wallet --create` or set SOLANA_PRIVATE_KEY.',
        'error'
      );
      return;
    }
    const parsed = this.parseSwapArgs(args);
    if (!parsed) {
      this.emitMessage('system', '[USAGE] /swap <amount> <inputMintOrSym> <outputMintOrSym> [slippageBps]', 'normal');
      return;
    }
    const keypair = this.wallet.getKeypair();
    if (!keypair) {
      this.emitMessage('darkclawd', '[ERROR] Wallet keypair not available.', 'error');
      return;
    }
    this.emitMessage(
      'system',
      `[SWAP] Submitting ${parsed.amount} ${parsed.input} → ${parsed.output} (slippage ${parsed.slippageBps ?? 'auto'})...`,
      'normal'
    );
    const result = await this.jupiter.swap({
      inputMint: parsed.input,
      outputMint: parsed.output,
      uiAmount: parsed.amount,
      keypair,
      slippageBps: parsed.slippageBps,
    });
    this.state.apiCalls += 2;

    if (result.ok && result.signature) {
      this.emitMessage(
        'darkclawd',
        `[SWAP CONFIRMED]
  Signature: ${result.signature}
  Router:    ${result.router}
  In:        ${result.inputAmount}
  Out:       ${result.outputAmount}
  Solscan:   https://solscan.io/tx/${result.signature}`,
        'data'
      );
    } else {
      this.emitMessage(
        'darkclawd',
        `[SWAP FAILED] ${result.error || 'Unknown error'}${result.signature ? ` (sig: ${result.signature})` : ''}`,
        'error'
      );
    }
  }

  private async cmdBuy(args: string[]): Promise<void> {
    // /buy <amount-SOL> <token> [slippageBps]
    if (args.length < 2) {
      this.emitMessage('system', '[USAGE] /buy <amount-SOL> <tokenMintOrSym> [slippageBps]', 'normal');
      return;
    }
    await this.cmdSwap([args[0], 'SOL', args[1], ...(args[2] ? [args[2]] : [])]);
  }

  private async cmdSell(args: string[]): Promise<void> {
    // /sell <amount> <token> [slippageBps]   (proceeds → SOL)
    if (args.length < 2) {
      this.emitMessage('system', '[USAGE] /sell <amount> <tokenMintOrSym> [slippageBps]', 'normal');
      return;
    }
    await this.cmdSwap([args[0], args[1], 'SOL', ...(args[2] ? [args[2]] : [])]);
  }
}

export default DarkClawdAgent;
