/**
 * Trader Agent — Jupiter DEX execution, position management
 */
import { getRuntime } from './runtime.js';
export class TraderAgent {
    jupiter;
    memory;
    openrouter;
    skills;
    constructor(runtime = getRuntime()) {
        this.jupiter = runtime.jupiter;
        this.memory = runtime.memory;
        this.openrouter = runtime.openrouter;
        this.skills = runtime.skills;
    }
    async run() {
        console.log('🦞 Trader Agent started');
        // Main trading loop
        await this.observe();
        await this.orient();
        await this.decide();
        // Act requires human approval
        // Learn logs outcome to memory
    }
    async observe() {
        // Get KNOWN data: prices, trends, balances
        const prices = await this.jupiter.getPrices();
        const trending = await this.jupiter.getTrending();
        const balance = await this.jupiter.getBalance();
        // Write to KNOWN memory
        await this.memory.write('KNOWN', {
            prices,
            trending,
            balance,
            timestamp: Date.now(),
        });
        return { prices, trending, balance };
    }
    async orient() {
        // Score opportunities
        const opportunities = await this.memory.recall('INFERRED');
        return opportunities.map((opp) => {
            const opportunity = this.asOpportunity(opp);
            return {
                ...opportunity,
                confidence: this.scoreOportunity(opportunity),
            };
        });
    }
    scoreOportunity(opp) {
        const trend = opp.trend || 0;
        const momentum = opp.momentum || 0;
        const liquidity = opp.liquidity || 0;
        const executionRisk = 20; // default
        return Math.max(0, Math.min(100, trend + momentum + liquidity - executionRisk));
    }
    asOpportunity(opp) {
        return opp && typeof opp === 'object' ? opp : {};
    }
    async decide() {
        const scored = await this.orient();
        const actionable = scored.filter(s => s.confidence >= 60);
        if (actionable.length > 0) {
            console.log(`📊 Found ${actionable.length} actionable opportunities`);
            // Log to INFERRED for human review
            await this.memory.write('INFERRED', {
                opportunities: actionable,
                timestamp: Date.now(),
            });
        }
        return actionable;
    }
    async narrate(prompt) {
        return this.openrouter.generateText(prompt, {
            instructions: 'You are a Solana trading assistant. Be concise and tactical.',
            tools: this.skills.tools(['jupiter.quote', 'memory.tiers']),
        });
    }
    async executeSwap(inputMint, outputMint, amount) {
        // Permission-gated execution
        console.log('⏳ Awaiting approval for swap execution...');
        // In production: prompt for approval
        const approved = true;
        if (approved) {
            const result = await this.jupiter.executeSwap(inputMint, outputMint, amount);
            await this.memory.write('KNOWN', { swapResult: result });
            return result;
        }
        return null;
    }
}
//# sourceMappingURL=trader.js.map