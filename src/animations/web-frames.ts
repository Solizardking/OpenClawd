/**
 * Web-safe animation frames — same braille frames as clawd-frames.ts but
 * exported as plain data (no process.stdout, no unicode-animations import)
 * so they can be consumed by browser code or any non-Node renderer.
 *
 * Each export is { frames: string[], interval: number }.
 */

export interface WebSpinner {
  readonly frames: readonly string[]
  readonly interval: number
}

export const solanaPulseWeb: WebSpinner = {
  frames: [
    '⠀⠀⠀⣀⠀⠀⠀',
    '⠀⠀⣠⣿⣄⠀⠀',
    '⠀⣴⣿⣿⣿⣦⠀',
    '⣾⣿⣿⣿⣿⣿⣷',
    '⠻⣿⣿⣿⣿⣿⠟',
    '⠀⠙⣿⣿⣿⠋⠀',
    '⠀⠀⠙⣿⠋⠀⠀',
    '⠀⠀⠀⠁⠀⠀⠀',
  ],
  interval: 100,
}

export const clawdSpinWeb: WebSpinner = {
  frames: [
    '⣰⣿⣿⡆',
    '⣿⡏⠀⠀',
    '⣿⡇⠀⠀',
    '⣿⡏⠀⠀',
    '⠹⣿⣿⠃',
    '⠀⠈⠉⠀',
    '⠹⣿⣿⠃',
    '⣿⡏⠀⠀',
    '⣿⡇⠀⠀',
    '⣿⡏⠀⠀',
    '⣰⣿⣿⡆',
    '⠀⠉⠉⠀',
  ],
  interval: 90,
}

export const walletHeartbeatWeb: WebSpinner = {
  frames: [
    '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⠀⠀⠀⠀⠀',
    '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⠞⠁⠀⠀⠀⠀⠀',
    '⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⡴⠞⠁⠀⠀⠀⠀⠀⠀⠀',
    '⠤⠤⠤⠤⠤⠤⣤⠴⠚⠁⠀⠀⠀⠀⠹⠤⠤⠤⠤⠤',
    '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
    '⠤⠤⠤⠤⠤⠤⠤⠤⠤⠤⠤⠤⠤⠤⠤⠤⠤⠤⠤⠤',
    '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⠀⠀⠀⠀⠀',
    '⠤⠤⠤⠤⠤⠤⣤⠴⠚⠁⠀⠀⠀⠀⠹⠤⠤⠤⠤⠤',
  ],
  interval: 120,
}

/**
 * Lobster claw — 4-frame ASCII animation suitable for hero sections.
 * Hand-crafted, smaller than the braille spinners so it works at 24px+.
 */
export const lobsterClawWeb: WebSpinner = {
  frames: [
    '   _\n  ( v ) c\n   ^^^^',
    '   _\n  ( ^ ) C\n   ^^^^',
    '   _\n  ( v ) c\n   ^^^^',
    '   _\n  ( o ) c\n   ^^^^',
  ],
  interval: 220,
}

export const ALL_WEB_SPINNERS = {
  solanaPulse: solanaPulseWeb,
  clawdSpin: clawdSpinWeb,
  walletHeartbeat: walletHeartbeatWeb,
  lobsterClaw: lobsterClawWeb,
} as const

export type WebSpinnerName = keyof typeof ALL_WEB_SPINNERS
