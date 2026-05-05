# Pay.sh For OpenClawd

On May 5, 2026, Solana Foundation announced Pay.sh in collaboration with Google
Cloud: a gateway for agents to discover, access, and pay per request for APIs
with stablecoins on Solana.

OpenClawd maps that model into `payments/pay-main`:

- **Discovery:** agents can treat Pay.sh-compatible catalogs as searchable API
  marketplaces instead of hard-coded provider credentials.
- **Access:** paid API calls are routed through x402/MPP challenges, where the
  payment proof acts as the credential.
- **Settlement:** stablecoin payment happens on Solana while the provider side
  can remain behind gateway rate limits, quotas, and access controls.
- **Merchant generation:** `npm run payments:merchant` creates local POS and
  merchant-flow projects with an `openclawd.merchant.json` manifest that marks
  the project as `solana-pay`, `x402`, and `mpp` compatible.

## Provider Surface

Pay.sh is positioned for official Google Cloud APIs such as Gemini, BigQuery,
BigTable, Cloud Run, and Vertex AI, plus community facilitators across
ecommerce, data and intelligence, communications, and Solana infrastructure.
OpenClawd should model these as paid capabilities that require explicit user
approval and should not store provider API keys in generated merchant projects.

## Generate A Pay.sh-Compatible Merchant

```bash
npm run payments:merchant -- create google-agent-store \
  --type both \
  --recipient 11111111111111111111111111111111 \
  --label "Google Agent Store" \
  --pay-gateway https://pay.sh \
  --catalog https://pay.sh
```

The generated `openclawd.merchant.json` includes:

- wallet recipient and cluster hints
- supported protocols: `solana-pay`, `x402`, `mpp`
- Pay.sh gateway and catalog hints
- stablecoin settlement and "payment is the credential" metadata
- supported use cases for POS, merchant simulation, Google Cloud API proxy
  access, and community API facilitator access

Source: <https://solana.com/news/solana-foundation-launches-pay-sh-in-collaboration-with-google-cloud>
