export const SOLANA_PURPLE = '#9945FF';
export const SOLANA_GREEN = '#14F195';
export const LOBSTER_RED = '#FF4500';
export const LOBSTER_DARK = '#B22222';
export const SHELL_CREAM = '#F5DEB3';
export const DEEP_SEA = '#0A0E27';
export const SHALLOW_GOLD = '#FFD700';
export const SHORELINE_AMBER = '#FFA500';
export const BEACHED_GREY = '#6B7280';
export const STATUS_DIM = '#9CA3AF';

export type DepthTier = 'deep' | 'shallow' | 'shoreline' | 'beached';

export const DEPTH_COLOR: Record<DepthTier, string> = {
  deep: SOLANA_GREEN,
  shallow: SHALLOW_GOLD,
  shoreline: SHORELINE_AMBER,
  beached: BEACHED_GREY,
};
