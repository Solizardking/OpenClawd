/**
 * OpenClawd — Financial AI Agent Platform
 * 
 * Entry point for the clawd CLI and agent runtime.
 */

import { AnalystAgent } from './agents/analyst.js';
import { cloneAgent, cloneAll, type AgentType } from './agents/clone.js';
import { MonitorAgent } from './agents/monitor.js';
import {
    createRuntime,
    describeRuntime,
    getRuntime,
    type AgentRuntime,
} from './agents/runtime.js';
import { ScannerAgent } from './agents/scanner.js';
import { SkillRegistry } from './agents/skill-registry.js';
import { TraderAgent } from './agents/trader.js';
import { ClawdCLI } from './cli/clawd.js';
import { getPluginRegistry, PluginRegistry } from './plugins/index.js';
import { OpenRouterService } from './services/openrouter.js';

export {
    AnalystAgent,
    cloneAgent,
    cloneAll,
    createRuntime,
    describeRuntime,
    getPluginRegistry,
    getRuntime,
    MonitorAgent,
    OpenRouterService,
    PluginRegistry,
    ScannerAgent,
    SkillRegistry,
    TraderAgent,
};
export type { AgentRuntime, AgentType };
export * from './plugins/index.js';

const KNOWN_AGENTS: AgentType[] = ['trader', 'scanner', 'analyst', 'monitor'];

const args = process.argv.slice(2);

if (args[0] === 'agent') {
    const agentType = (args[1] || 'trader') as AgentType;
    void runAgent(agentType);
} else if (args[0] === 'extensions') {
    void listExtensions();
} else {
    const cli = new ClawdCLI();
    cli.run(args);
}

async function listExtensions() {
    const runtime = getRuntime();
    const report = await getPluginRegistry().loadAll({ runtime });
    console.log(`🦞 OpenClawd extensions: ${report.loaded.length} loaded, ${report.skipped.length} skipped, ${report.failed.length} failed`);
    for (const p of report.loaded) {
        console.log(
            `  ✓ ${p.id.padEnd(28)} tools=${p.tools.length} channels=${p.channels.length} providers=${p.providers.length}`,
        );
    }
    for (const s of report.skipped) {
        console.log(`  · ${s.id.padEnd(28)} skipped — ${s.reason}`);
    }
    for (const f of report.failed) {
        console.log(`  ✗ ${f.id.padEnd(28)} ${f.error.split('\n')[0]}`);
    }
}

async function runAgent(type: string) {
    if (!KNOWN_AGENTS.includes(type as AgentType)) {
        console.error(`Unknown agent type: ${type}`);
        process.exit(1);
    }
    const runtime = getRuntime();
    const summary = describeRuntime(runtime);
    const enabled = summary.skills.filter((s) => s.enabled).length;
    console.log(
        `🦞 Birthing ${type} clone — OpenRouter ${summary.hasOpenRouterKey ? 'ready' : 'no-key'}, ${enabled} skills injected.`,
    );
    const agent = cloneAgent(type as AgentType, { runtime });
    await agent.run();
}