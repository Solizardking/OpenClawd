import { readBalances } from '../identity/balances.js'
import { depthFor, pulseIntervalFor, shouldBeach } from '../survival/monitor.js'
import { getLeviathan, recordBeach, recordEvent } from '../state/database.js'
import type { Depth } from '../types/index.js'

export interface PulseHandlers {
  onTick: (ctx: { depth: Depth; balances: Awaited<ReturnType<typeof readBalances>> }) => Promise<void>
  onDepthChange: (prev: Depth, next: Depth) => Promise<void>
  onBeach: () => Promise<void>
}

export function startPulse(rpcUrl: string, handlers: PulseHandlers): { stop: () => void } {
  let stopped = false
  let prevDepth: Depth | null = null

  const loop = async () => {
    while (!stopped) {
      const lev = getLeviathan()
      if (!lev || !lev.asset_signer_pda) {
        await sleep(5000)
        continue
      }

      try {
        const balances = await readBalances(rpcUrl, lev.asset_signer_pda)
        const depth = depthFor(balances)
        if (prevDepth !== null && prevDepth !== depth) {
          await handlers.onDepthChange(prevDepth, depth)
          recordEvent('depth-change', { from: prevDepth, to: depth })
        }
        prevDepth = depth
        await handlers.onTick({ depth, balances })
        if (shouldBeach(balances)) {
          recordBeach()
          await handlers.onBeach()
          stopped = true
          return
        }
        await sleep(pulseIntervalFor(depth))
      } catch (err) {
        recordEvent('pulse-error', { msg: err instanceof Error ? err.message : String(err) })
        await sleep(30_000)
      }
    }
  }

  void loop()
  return { stop: () => { stopped = true } }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
