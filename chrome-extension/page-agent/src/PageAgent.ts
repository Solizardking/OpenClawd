/**
 * Copyright (C) 2025 Alibaba Group Holding Limited
 * All rights reserved.
 */
import { type AgentConfig, PageAgentCore } from '@openclawdsolana/pagent-core'
import { type PageAgentTool } from '@openclawdsolana/pagent-core'
import { type Tool } from '@openclawdsolana/pagent-llms'
import { PageController, type PageControllerConfig } from '@openclawdsolana/pagent-page-controller'
import { Panel, type PanelConfig } from '@openclawdsolana/pagent-ui'
import { z } from 'zod'

export * from '@openclawdsolana/pagent-core'

export type PageAgentConfig = AgentConfig & PageControllerConfig & Omit<PanelConfig, 'language'> & {
	/**
	 * Pre-built Solana tool map (e.g. from
	 * `solanaWalletTools({wallet, gateway})` in `@openclawdsolana/pagent-llms`).
	 * Each entry is auto-merged into `customTools` and exposed to the Re-Act
	 * loop. Pass an empty record or omit to skip.
	 */
	solanaTools?: Record<string, Tool>
}

export class PageAgent extends PageAgentCore {
	panel: Panel

	constructor(config: PageAgentConfig) {
		const pageController = new PageController({
			...config,
			enableMask: config.enableMask ?? true,
		})

		// Auto-merge Solana tools into customTools.
		const merged: Record<string, PageAgentTool | null> = { ...(config.customTools ?? {}) }
		if (config.solanaTools) {
			for (const [name, t] of Object.entries(config.solanaTools)) {
				merged[name] = adaptLLMTool(t)
			}
		}

		super({ ...config, customTools: merged, pageController })

		this.panel = new Panel(this, {
			language: config.language,
			promptForNextTask: config.promptForNextTask,
		})
	}
}

/**
 * Adapt an LLM Tool into a PageAgentTool (zod schema, returns string).
 *
 * `solanaWalletTools` already produces zod schemas, so we pass them through
 * verbatim — the macro-tool schema gets precise validation. If a tool happens
 * to ship a raw JSON schema (no `safeParse`), we fall back to `z.any()` so
 * the union build in #packMacroTool doesn't blow up.
 */
function adaptLLMTool(tool: Tool): PageAgentTool {
	const isZod = !!tool.inputSchema
		&& typeof (tool.inputSchema as { safeParse?: unknown }).safeParse === 'function'
	const inputSchema = (isZod ? tool.inputSchema : z.any()) as z.ZodType

	return {
		description: tool.description ?? '',
		inputSchema,
		execute: async function (this: PageAgentCore, args: unknown): Promise<string> {
			const result = await tool.execute(args)
			return typeof result === 'string' ? result : JSON.stringify(result)
		},
	}
}
