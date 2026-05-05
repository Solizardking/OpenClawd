/**
 * Wallet-aware pAGENT demo.
 *
 * Drop this on any page to get an autonomous Re-Act loop with Solana tools
 * (`solana_health`, `solana_portfolio`, `solana_token_overview`,
 * `solana_swap`, etc.) wired alongside the standard browser tools.
 *
 *   <script type="module" src="demo-solana.js?baseURL=https://api.openrouter.ai/v1
 *                                            &model=anthropic/claude-sonnet-4-6
 *                                            &apiKey=sk-or-..."></script>
 *
 * Optional URL params:
 *   gateway=http://127.0.0.1:8788    OpenClawd Gateway base URL
 *   vault=http://127.0.0.1:8421      Local agentwallet-vault base URL
 *   prefer=vault,in-extension,seeker comma list, first available wins
 */

import { solanaWalletTools } from '@openclawdsolana/pagent-llms'
import {
  detectWallet,
  HttpGatewayClient,
  type DetectOptions,
  type WalletBackend,
} from '@openclawdsolana/pagent-wallet'

import { PageAgent, type PageAgentConfig } from './PageAgent'

const DEFAULT_GATEWAY = 'http://127.0.0.1:8788'
const DEFAULT_VAULT = 'http://127.0.0.1:8421'

interface DemoConfig extends PageAgentConfig {
  gatewayBaseUrl?: string
  vaultBaseUrl?: string
  prefer?: WalletBackend[]
}

export async function startSolanaPAGENT(config: DemoConfig): Promise<PageAgent> {
  const gateway = new HttpGatewayClient({
    baseUrl: config.gatewayBaseUrl ?? DEFAULT_GATEWAY,
  })

  const detectOpts: DetectOptions = {
    gatewayUrl: config.gatewayBaseUrl ?? DEFAULT_GATEWAY,
    vaultUrl: config.vaultBaseUrl ?? DEFAULT_VAULT,
    prefer: config.prefer,
  }
  const wallet = await detectWallet(detectOpts)

  const solanaTools = wallet
    ? solanaWalletTools({ wallet, gateway })
    : solanaWalletTools({ gateway }) // gateway-only, read tools still work

  console.log('[pagent-solana]', wallet ? `wallet=${wallet.backend}` : 'no wallet detected (read-only)')

  const agent = new PageAgent({ ...config, solanaTools })
  return agent
}

// Auto-start when loaded as a content script with config in the script URL.
function readScriptConfig(): DemoConfig | null {
  const cs = document.currentScript as HTMLScriptElement | null
  if (!cs?.src) return null
  const u = new URL(cs.src)
  const get = (k: string) => u.searchParams.get(k) ?? undefined
  const baseURL = get('baseURL')
  const model = get('model')
  const apiKey = get('apiKey')
  if (!baseURL || !model || !apiKey) return null

  const preferRaw = get('prefer')
  const prefer = preferRaw
    ? (preferRaw.split(',').map((s) => s.trim()).filter(Boolean) as WalletBackend[])
    : undefined

  return {
    baseURL,
    model,
    apiKey,
    gatewayBaseUrl: get('gateway'),
    vaultBaseUrl: get('vault'),
    prefer,
  }
}

const cfg = readScriptConfig()
if (cfg) {
  startSolanaPAGENT(cfg)
    .then((agent) => {
      ;(window as unknown as { pageAgent?: PageAgent }).pageAgent = agent
      agent.panel.show()
      console.log('🦞 pagent-solana ready — try: window.pageAgent.execute("Show my SOL balance")')
    })
    .catch((err) => console.error('🦞 pagent-solana failed to start:', err))
}
