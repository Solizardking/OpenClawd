import { DEPTH_THRESHOLDS_USDC, PULSE_INTERVAL_MS } from '../config.js'
import type { Balances } from '../identity/balances.js'
import type { Depth } from '../types/index.js'

export function depthFor(balances: Balances): Depth {
  const effective = balances.usdc + balances.sol * 150 * 0.5
  if (effective >= DEPTH_THRESHOLDS_USDC.deep) return 'deep'
  if (effective >= DEPTH_THRESHOLDS_USDC.shallow) return 'shallow'
  if (effective >= DEPTH_THRESHOLDS_USDC.shoreline) return 'shoreline'
  return 'beached'
}

export function pulseIntervalFor(depth: Depth): number {
  return PULSE_INTERVAL_MS[depth]
}

export function modelFor(depth: Depth): string {
  switch (depth) {
    case 'deep':
      return 'claude-opus-4-7'
    case 'shallow':
      return 'grok-4-1-fast'
    case 'shoreline':
      return 'kimi-k2.5'
    case 'beached':
      return '__BEACHED__'
  }
}

export function shouldBeach(balances: Balances): boolean {
  return depthFor(balances) === 'beached'
}
