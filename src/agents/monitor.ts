/**
 * Monitor Agent — Real-time price alerts, whale tracking
 */

import { BirdeyeService } from '../services/birdeye.js';
import { HeliusService } from '../services/helius.js';
import type { MemoryService } from '../services/memory.js';
import type { OpenRouterService } from '../services/openrouter.js';
import type { AgentRuntime } from './runtime.js';
import { getRuntime } from './runtime.js';
import type { SkillRegistry } from './skill-registry.js';

interface Alert {
    type: 'price' | 'whale' | 'volume';
    token: string;
    message: string;
    severity: 'low' | 'medium' | 'high';
}

export class MonitorAgent {
    private birdeye: BirdeyeService;
    private helius: HeliusService;
    private memory: MemoryService;
    private openrouter: OpenRouterService;
    private skills: SkillRegistry;
    private watchlist: string[] = [];
    private alerts: Alert[] = [];

    constructor(runtime: AgentRuntime = getRuntime()) {
        this.birdeye = new BirdeyeService();
        this.helius = new HeliusService();
        this.memory = runtime.memory;
        this.openrouter = runtime.openrouter;
        this.skills = runtime.skills;
    }

    async summarizeAlerts(): Promise<string> {
        if (this.alerts.length === 0) return 'No active alerts.';
        return this.openrouter.generateText(
            `Summarize these alerts in priority order:\n${JSON.stringify(this.alerts, null, 2)}`,
            {
                instructions: 'You are a market monitor. Lead with high-severity alerts.',
                tools: this.skills.tools(['memory.tiers']),
            },
        );
    }

    async run() {
        console.log('👁️ Monitor Agent started');
        
        await this.checkPrices();
        await this.trackWhales();
        await this.checkVolume();
    }
    
    async addToWatchlist(mint: string) {
        if (!this.watchlist.includes(mint)) {
            this.watchlist.push(mint);
            console.log(`👁️ Added ${mint} to watchlist`);
        }
    }
    
    async checkPrices() {
        for (const mint of this.watchlist) {
            const price = await this.birdeye.getPrice(mint);
            const prev = await this.memory.recall('KNOWN', `price:${mint}`);
            
            if (prev && price) {
                const change24h = ((price - prev) / prev) * 100;
                
                if (Math.abs(change24h) > 10) {
                    const alert: Alert = {
                        type: 'price',
                        token: mint,
                        message: `Price ${change24h > 0 ? '📈' : '📉'} ${change24h.toFixed(1)}% in 24h`,
                        severity: Math.abs(change24h) > 20 ? 'high' : 'medium',
                    };
                    this.alerts.push(alert);
                    console.log(`🚨 ${alert.message}`);
                }
            }
            
            // Update KNOWN with current price
            await this.memory.write('KNOWN', { [`price:${mint}`]: price });
        }
    }
    
    async trackWhales() {
        // Monitor large transactions
        const recentTxs = await this.helius.getRecentTransactions();
        
        for (const tx of recentTxs) {
            const valueUSD = this.estimateTxValue(tx);
            
            if (valueUSD > 10000) {
                const alert: Alert = {
                    type: 'whale',
                    token: tx.mint || 'SOL',
                    message: `🐋 Whale: $${(valueUSD / 1000).toFixed(0)}K ${tx.type} by ${tx.from.slice(0, 8)}...`,
                    severity: valueUSD > 100000 ? 'high' : 'medium',
                };
                this.alerts.push(alert);
                console.log(alert.message);
            }
        }
    }
    
    estimateTxValue(tx: any): number {
        // Estimate USD value of transaction
        return tx.valueSOL * (tx.solPrice || 150);
    }
    
    async checkVolume() {
        // Check for unusual volume spikes
        for (const mint of this.watchlist) {
            const volume = await this.birdeye.getVolume(mint);
            const prevVolume = await this.memory.recall('KNOWN', `volume:${mint}`);
            
            if (prevVolume && volume > prevVolume * 3) {
                const alert: Alert = {
                    type: 'volume',
                    token: mint,
                    message: `📊 Volume spike: ${(volume / prevVolume).toFixed(1)}x normal`,
                    severity: 'medium',
                };
                this.alerts.push(alert);
                console.log(`🚨 ${alert.message}`);
            }
            
            await this.memory.write('KNOWN', { [`volume:${mint}`]: volume });
        }
    }
    
    getAlerts(): Alert[] {
        return this.alerts;
    }
}