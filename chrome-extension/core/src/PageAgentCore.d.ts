import type { PageController } from '@openclawdsolana/pagent-page-controller';
import { tools } from './tools';
import type { AgentConfig, AgentStatus, ExecutionResult, HistoricalEvent } from './types';
export { tool, type PageAgentTool } from './tools';
export type * from './types';
export type PageAgentCoreConfig = AgentConfig & {
    pageController: PageController;
};
/**
 * AI agent for browser automation.
 *
 * @remarks
 * ## Re-act Agent Loop
 * - step
 *    - observe (gather information about current environment and context)
 *    - think (LLM calling)
 *      - reflection (evaluate history, generate memory, short-term planning)
 *      - action (give the action to approach the next goal)
 *    - act (execute the action)
 * - loop
 *
 * ## Event System
 * - `statuschange` - Agent status transitions (idle → running → completed/error)
 * - `historychange` - History events updated (persistent, part of agent memory)
 * - `activity` - Real-time activity feedback (transient, for UI only)
 * - `dispose` - Agent cleanup triggered
 *
 * ## Information Streams
 * 1. **History Events** (`history` array)
 *    - Persistent event stream that forms agent's memory
 *    - Included in LLM context across steps
 *    - Types: steps, observations, user takeovers, llm errors
 *
 * 2. **Activity Events** (via `activity` event)
 *    - Transient UI feedback during task execution
 *    - NOT included in LLM context
 *    - Types: thinking, executing, executed, retrying, error
 */
export declare class PageAgentCore extends EventTarget {
    #private;
    readonly id: string;
    readonly config: PageAgentCoreConfig & {
        maxSteps: number;
    };
    readonly tools: typeof tools;
    /** PageController for DOM operations */
    readonly pageController: PageController;
    task: string;
    taskId: string;
    /** History events */
    history: HistoricalEvent[];
    /** Whether this agent has been disposed */
    disposed: boolean;
    /**
     * Callback for when agent needs user input (ask_user tool)
     * If not set, ask_user tool will be disabled
     * @example onAskUser: (q) => window.prompt(q) || ''
     */
    onAskUser?: (question: string) => Promise<string>;
    constructor(config: PageAgentCoreConfig);
    /** Get current agent status */
    get status(): AgentStatus;
    /**
     * Push an observation message to the history event stream.
     * This will be visible in <agent_history> and remain persistent in memory across steps.
     * @experimental @internal
     * @note history change will be emitted before next step starts
     */
    pushObservation(content: string): void;
    /** Stop the current task. Agent remains reusable. */
    stop(): void;
    execute(task: string): Promise<ExecutionResult>;
    dispose(): void;
}
//# sourceMappingURL=PageAgentCore.d.ts.map