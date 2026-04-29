import type { PageAgentTool } from '../tools';
/**
 * Normalize LLM response and fix common format issues.
 *
 * Handles:
 * - No tool_calls but JSON in message.content (fallback)
 * - Model returns action name as tool call instead of AgentOutput
 * - Arguments wrapped as double JSON string
 * - Nested function call format
 * - Missing action field (fallback to wait)
 * - Primitive action input for single-field tools (e.g. `{"click_element_by_index": 2}`)
 * - etc.
 */
export declare function normalizeResponse(response: any, tools?: Map<string, PageAgentTool>): any;
//# sourceMappingURL=autoFixer.d.ts.map