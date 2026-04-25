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
import { OpenRouterService } from './services/openrouter.js';

export {
    AnalystAgent,
    cloneAgent,
    cloneAll,
    createRuntime,
    describeRuntime,
    getRuntime,
    MonitorAgent,
    OpenRouterService,
    ScannerAgent,
    SkillRegistry,
    TraderAgent,
};
export type { AgentRuntime, AgentType };

const KNOWN_AGENTS: AgentType[] = ['trader', 'scanner', 'analyst', 'monitor'];

const args = process.argv.slice(2);

if (args[0] === 'agent') {
    const agentType = (args[1] || 'trader') as AgentType;
    void runAgent(agentType);
} else {
    const cli = new ClawdCLI();
    cli.run(args);
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