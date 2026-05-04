const FALLBACK_CONVEX_SITE_URL = 'http://127.0.0.1:3210'

export default {
  providers: [
    {
      domain:
        process.env.CONVEX_SITE_URL?.trim() ||
        process.env.CUSTOM_AUTH_SITE_URL?.trim() ||
        process.env.CONVEX_ACTIONS?.trim() ||
        process.env.VITE_CONVEX_SITE_URL?.trim() ||
        FALLBACK_CONVEX_SITE_URL,
      applicationID: 'convex',
    },
  ],
}
