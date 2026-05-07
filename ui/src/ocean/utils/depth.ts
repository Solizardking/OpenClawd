import type { DepthTier } from '../theme/tokens';

export function depthFromUsdc(usdc: number): DepthTier {
  if (usdc >= 5) return 'deep';
  if (usdc >= 1) return 'shallow';
  if (usdc >= 0.1) return 'shoreline';
  return 'beached';
}
