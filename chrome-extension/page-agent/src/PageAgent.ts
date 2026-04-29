/**
 * Copyright (C) 2025 Alibaba Group Holding Limited
 * All rights reserved.
 */
import { type AgentConfig, PageAgentCore } from '@openclawdsolana/pagent-core'
import { PageController, type PageControllerConfig } from '@openclawdsolana/pagent-page-controller'
import { Panel, type PanelConfig } from '@openclawdsolana/pagent-ui'

export * from '@openclawdsolana/pagent-core'

export type PageAgentConfig = AgentConfig & PageControllerConfig & Omit<PanelConfig, 'language'>

export class PageAgent extends PageAgentCore {
	panel: Panel

	constructor(config: PageAgentConfig) {
		const pageController = new PageController({
			...config,
			enableMask: config.enableMask ?? true,
		})

		super({ ...config, pageController })

		this.panel = new Panel(this, {
			language: config.language,
			promptForNextTask: config.promptForNextTask,
		})
	}
}
