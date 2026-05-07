/**
 * Analyst Agent — Wallet analysis, PnL tracking, market research
 */

import { HeliusService } from '../services/helius.js';
import { BirdeyeService } from '../services/birdeye.js';
import type { MemoryService } from '../services/memory.js';
import type { OpenRouterService } from '../services/openrouter.js';
import type { AgentRuntime } from './runtime.js';
import { getRuntime } from './runtime.js';
import type { SkillRegistry } from './skill-registry.js';

export interface WalletProfile {
    address: string;
    solBalance: number;
    tokens: Array<{
        mint: string;
        symbol: string;
        amount: number;
        valueUSD: number;
    }>;
    realizedPnL: number;
    unrealizedPnL: number;
    topTraders: string[];
}

export class AnalystAgent {
    private helius: HeliusService;
    private birdeye: BirdeyeService;
    private memory: MemoryService;
    private openrouter: OpenRouterService;
    private skills: SkillRegistry;

    constructor(runtime: AgentRuntime = getRuntime()) {
        this.helius = new HeliusService();
        this.birdeye = new BirdeyeService();
        this.memory = runtime.memory;
        this.openrouter = runtime.openrouter;
        this.skills = runtime.skills;
    }

    async run() {
        console.log('📊 Analyst Agent started');
    }

    async writeReport(profile: WalletProfile): Promise<string> {
        return this.openrouter.generateText(
            `Write a wallet research report:\n${JSON.stringify(profile, null, 2)}`,
            {
                instructions:
                    'You are a Solana on-chain analyst. Output sections: Overview, Holdings, P&L, Smart Money, Risks.',
                tools: this.skills.tools(['memory.tiers']),
            },
        );
    }
    
    async analyzeWallet(address: string): Promise<WalletProfile> {
        const [balance, tokens, transactions] = await Promise.all([
            this.helius.getBalance(address),
            this.helius.getTokens(address),
            this.helius.getTransactions(address),
        ]);
        
        const pnl = this.calculatePnL(transactions);
        const topTraders = this.identifySmartMoney(tokens);
        
        const profile: WalletProfile = {
            address,
            solBalance: balance,
            tokens,
            realizedPnL: pnl.realized,
            unrealizedPnL: pnl.unrealized,
            topTraders,
        };
        
        // Log to LEARNED (persistent)
        await this.memory.write('LEARNED', {
            walletProfile: profile,
            timestamp: Date.now(),
        });
        
        return profile;
    }
    
    calculatePnL(transactions: any[]) {
        // Parse SWAP transactions to calculate P&L
        let realized = 0;
        let unrealized = 0;
        
        for (const tx of transactions) {
            if (tx.type === 'SWAP') {
                realized += tx.profit || 0;
            }
        }
        
        return { realized, unrealized };
    }
    
    identifySmartMoney(tokens: any[]) {
        // Find tokens held by top traders (wallets with high realized P&L)
        return tokens
            .filter(t => t.concentration > 0.1)
            .map(t => t.mint);
    }
    
    async researchToken(mint: string) {
        const [tokenInfo, price, chart, topTraders] = await Promise.all([
            this.birdeye.getTokenInfo(mint),
            this.birdeye.getPrice(mint),
            this.birdeye.getOHLCV(mint),
            this.helius.getTopTraders(mint),
        ]);
        
        return { tokenInfo, price, chart, topTraders };
    }
}