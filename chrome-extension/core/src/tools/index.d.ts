/**
 * Internal tools for PageAgent.
 * @note Adapted from browser-use
 */
import * as z from 'zod/v4';
import type { PageAgentCore } from '../PageAgentCore';
/**
 * Internal tool definition that has access to PageAgent `this` context
 */
export interface PageAgentTool<TParams = any> {
    description: string;
    inputSchema: z.ZodType<TParams>;
    execute: (this: PageAgentCore, args: TParams) => Promise<string>;
}
export declare function tool<TParams>(options: PageAgentTool<TParams>): PageAgentTool<TParams>;
/**
 * Internal tools for PageAgent.
 * Note: Using any to allow different parameter types for each tool
 */
export declare const tools: Map<string, PageAgentTool<any>>;
//# sourceMappingURL=index.d.ts.map