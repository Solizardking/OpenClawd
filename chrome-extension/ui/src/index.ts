/**
 * @openclawdsolana/pagent-ui — UI primitives for pAGENT.
 *
 * Exposes:
 *   - Panel       (legacy host stub; full panel ships with the extension)
 *   - WalletPanel (vanilla DOM wallet card; reads CSS vars from pagent-theme)
 */

import type { PageAgentCore } from '@openclawdsolana/pagent-core'

export type { WalletPanelOptions } from './WalletPanel.js'
export { WalletPanel } from './WalletPanel.js'

export interface PanelConfig {
  language?: string
  promptForNextTask?: boolean
}

export class Panel {
  private agent: PageAgentCore
  private config: PanelConfig

  constructor(agent: PageAgentCore, config: PanelConfig) {
    this.agent = agent
    this.config = config
  }

  show(): void {}
  hide(): void {}
  destroy(): void {}
}
