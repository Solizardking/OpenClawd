// OpenClawd brand tokens — single source of truth for every pAGENT surface.
// Solana brand: green #14F195 + purple #9945FF. Dark UI baseline. Lobster accent.

export const color = {
  solanaGreen: '#14F195',
  solanaPurple: '#9945FF',
  solanaPurpleDeep: '#7053F2',
  lobsterRed: '#FF4D2E',
  lobsterCoral: '#FF7A3D',
  bg: '#06141A',
  bgRaised: '#0E1A24',
  bgGlass: 'rgba(20, 28, 38, 0.72)',
  border: 'rgba(153, 69, 255, 0.35)',
  borderStrong: 'rgba(20, 241, 149, 0.55)',
  text: '#E8F0F8',
  textMuted: '#7886A0',
  textDim: '#4B5874',
  danger: '#FF5757',
  warning: '#FFB13D',
  success: '#14F195',
} as const

export const gradient = {
  brand: `linear-gradient(135deg, ${color.solanaPurple} 0%, ${color.solanaPurpleDeep} 50%, ${color.solanaGreen} 100%)`,
  brandSubtle: `linear-gradient(135deg, rgba(153,69,255,0.18) 0%, rgba(20,241,149,0.18) 100%)`,
  glassPanel: `linear-gradient(180deg, rgba(20,28,38,0.78) 0%, rgba(8,16,22,0.86) 100%)`,
} as const

export const radius = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  pill: '9999px',
} as const

export const space = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  xxl: '32px',
} as const

export const font = {
  family: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, sans-serif',
  mono: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
  size: {
    xs: '11px',
    sm: '12px',
    md: '14px',
    lg: '16px',
    xl: '20px',
    xxl: '28px',
  },
  weight: {
    regular: 400,
    medium: 500,
    bold: 700,
  },
} as const

export const shadow = {
  glass: '0 8px 32px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255,255,255,0.04)',
  glow: `0 0 24px rgba(153, 69, 255, 0.35)`,
  glowGreen: `0 0 24px rgba(20, 241, 149, 0.35)`,
} as const

export type ThemeTokens = {
  color: typeof color
  gradient: typeof gradient
  radius: typeof radius
  space: typeof space
  font: typeof font
  shadow: typeof shadow
}

export const tokens: ThemeTokens = { color, gradient, radius, space, font, shadow }

/** Emit the same tokens as a `:root { ... }` CSS string. */
export function tokensToCSS(scope = ':root'): string {
  const lines: string[] = []
  const push = (k: string, v: string) => lines.push(`  --${k}: ${v};`)
  for (const [k, v] of Object.entries(color)) push(`oc-color-${kebab(k)}`, v)
  for (const [k, v] of Object.entries(gradient)) push(`oc-gradient-${kebab(k)}`, v)
  for (const [k, v] of Object.entries(radius)) push(`oc-radius-${k}`, v)
  for (const [k, v] of Object.entries(space)) push(`oc-space-${k}`, v)
  for (const [k, v] of Object.entries(font.size)) push(`oc-font-size-${k}`, v)
  for (const [k, v] of Object.entries(font.weight)) push(`oc-font-weight-${k}`, String(v))
  for (const [k, v] of Object.entries(shadow)) push(`oc-shadow-${kebab(k)}`, v)
  push('oc-font-family', font.family)
  push('oc-font-mono', font.mono)
  return `${scope} {\n${lines.join('\n')}\n}\n`
}

function kebab(s: string): string {
  return s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
}
