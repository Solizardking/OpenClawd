/**
 * Scanner Agent — Pump.fun token discovery, graduation tracking
 */
import { PumpFunService } from '../services/pumpfun.js';
import { getRuntime } from './runtime.js';
export class ScannerAgent {
    pumpfun;
    memory;
    openrouter;
    skills;
    constructor(runtime = getRuntime()) {
        this.pumpfun = new PumpFunService();
        this.memory = runtime.memory;
        this.openrouter = runtime.openrouter;
        this.skills = runtime.skills;
    }
    async describeSignals(signals) {
        return this.openrouter.generateText(`Summarize these Pump.fun signals for a trader:\n${JSON.stringify(signals, null, 2)}`, {
            instructions: 'You are a memecoin scout. Highlight SNIPE/RIDE picks first.',
            tools: this.skills.tools(['memory.tiers']),
        });
    }
    async run() {
        console.log('🔍 Scanner Agent started');
        const tokens = await this.scanPumpFun();
        const signals = this.classifyTokens(tokens);
        // Log signals to memory
        await this.memory.write('KNOWN', {
            pumpScanResults: signals,
            timestamp: Date.now(),
        });
        // Alert on high-priority signals
        const snipes = signals.filter(s => s.tier === 'SNIPE');
        const nearGraduation = signals.filter(s => s.tier === 'RIDE');
        if (snipes.length > 0) {
            console.log(`🐟 Found ${snipes.length} SNIPE opportunities`);
        }
        if (nearGraduation.length > 0) {
            console.log(`🔥 ${nearGraduation.length} tokens near graduation`);
        }
        return signals;
    }
    async scanPumpFun() {
        const trending = await this.pumpfun.getTrending();
        const recent = await this.pumpfun.getRecent();
        return [...trending, ...recent];
    }
    classifyTokens(tokens) {
        return tokens.map(token => ({
            ...token,
            tier: this.classify(token),
        }));
    }
    classify(token) {
        const { ageMinutes, marketCap, bondingPercent = 0 } = token;
        if (ageMinutes <= 5 && marketCap < 5000)
            return 'SNIPE';
        if (ageMinutes <= 15 && bondingPercent >= 50)
            return 'BUY';
        if (bondingPercent >= 75)
            return 'RIDE';
        if (bondingPercent >= 90)
            return 'AVOID';
        if (marketCap > 500000 && ageMinutes < 120)
            return 'SCALP';
        if (marketCap > 1000000)
            return 'SKIP';
        return 'BUY'; // default
    }
}
//# sourceMappingURL=scanner.js.map