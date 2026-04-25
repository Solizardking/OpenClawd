/** Stub for the demo build — full implementation lives in the OpenClawd Gateway repo. */
export const GATEWAY_CLIENT_MODES = {
  WEBCHAT: 'webchat',
  TUI: 'tui',
  MOBILE: 'mobile',
  DESKTOP: 'desktop',
  HEADLESS: 'headless',
} as const;

export const GATEWAY_CLIENT_NAMES = {
  CONTROL_UI: 'control-ui',
  TUI: 'clawd-code-cli',
  OCEAN: 'ocean-demo',
} as const;

export type GatewayClientMode = (typeof GATEWAY_CLIENT_MODES)[keyof typeof GATEWAY_CLIENT_MODES];
export type GatewayClientName = (typeof GATEWAY_CLIENT_NAMES)[keyof typeof GATEWAY_CLIENT_NAMES];
