export const OPENCLAWD_SITE_NAME = 'OpenClawd';
export const OPENCLAWD_SITE_URL = normalizeBaseUrl(
  process.env.OPENCLAWD_SITE_URL ?? 'https://solanaclawd.com'
);
export const OPENCLAWD_BACKEND_URL = normalizeBaseUrl(
  process.env.OPENCLAWD_BACKEND_URL ?? OPENCLAWD_SITE_URL
);
export const OPENCLAWD_AGENT_API_URL = normalizeBaseUrl(
  process.env.OPENCLAWD_AGENT_API_URL ?? 'https://agents.openclawd.biz'
);

export const OPENCLAWD_ROUTES = {
  home: '/',
  vault: '/vault',
  chat: '/chat',
  trading: '/trading',
  agents: '/agents',
  staking: '/staking',
  mining: '/mining',
  docs: '/docs',
} as const;

export type OpenClawdRoute = keyof typeof OPENCLAWD_ROUTES;

export function getOpenClawdRouteUrl(route: OpenClawdRoute): string {
  return `${OPENCLAWD_SITE_URL}${OPENCLAWD_ROUTES[route]}`;
}

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}
