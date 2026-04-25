# Key Rotation Checklist

The pre-release scrub of this repository removed a populated `X/.env` and
related credential files from the working tree, and the entire git history
will be rewritten so the values are no longer reachable from `git log`.

**However, anything that was ever pushed to a remote, copied to a CI runner,
or sent to another developer must be considered compromised.** Rotate every
credential below before publishing the open-source repo. Scope this list to
the providers that were actually configured in your local `X/.env`; ignore
the rest.

## Wallets — drain & re-key first

These are private keys that can sign transactions. Move funds to a fresh
wallet *before* anything else.

- [ ] `PRIVATE_KEY` (Solana, generic)
- [ ] `SOLANA_PRIVATE_KEY`
- [ ] `BAGS_PRIVATE_KEY`
- [ ] `POLYMARKET_PRIVATE_KEY`
- [ ] `ASTER_PRIVATE_KEY`
- [ ] `BUILDER_PRIVATE_KEY` (Polymarket builder)
- [ ] `THIRDWEB_VAULT_KEY` / `THIRDWEB_VAULT_ACCESS_TOKEN`
- [ ] `PRIVY_AUTHORIZATION_PRIVATE_KEY`
- [ ] `CDP_API_KEY_PRIVATE_KEY` (Coinbase Developer Platform)

## LLM / AI providers — revoke + reissue

- [ ] `ANTHROPIC_API_KEY` — https://console.anthropic.com/settings/keys
- [ ] `OPENAI_API_KEY` — https://platform.openai.com/api-keys
- [ ] `XAI_API_KEY` — https://console.x.ai/
- [ ] `GOOGLE_API_KEY` / `GEMINI_API_KEY` / `GOOGLE_VERTEX_API_KEY` —
      https://console.cloud.google.com/apis/credentials
- [ ] `OPENROUTER_API_KEY` — https://openrouter.ai/keys
- [ ] `TOGETHER_API_KEY`, `MOONSHOT_API_KEY`, `MINIMAX_API_KEY`,
      `NVIDIA_API_KEY`, `REDPILL_API_KEY`, `EXA_API_KEY`,
      `FAL_KEY` / `FAL_API_KEY`, `ELEVEN_LABS_API_KEY`,
      `DEEPGRAM_API_KEY`, `CARTESIA_API_KEY`, `HUME_API_KEY` /
      `HUME_API_SECRET_KEY`, `SIMLI_API_KEY`

## Solana / DeFi data

- [ ] `HELIUS_API_KEY` (also rotates `HELIUS_RPC_URL`,
      `HELIUS_WSS_URL`, `HELIUS_PARSE_URL`, `HELIUS_SECURE_RPC_URL`)
- [ ] `BIRDEYE_API_KEY` / `BIRDEYE_WSS_URL`
- [ ] `COINGECKO_API_KEY`
- [ ] `JUPITER_API_KEY` / `JUP_SWAP_V1_API_KEY`
- [ ] `DFLOW_API_KEY`
- [ ] `BAGS_API_KEY`
- [ ] `POLYMARKET_API_KEY` / `POLYMARKET_API_SECRET` /
      `POLYMARKET_PASSPHRASE` / `POLYMARKET_BUILDER_*`
- [ ] `ASTER_API_KEY` / `ASTER_API_SECRET`
- [ ] `FINANCIAL_DATASET_API_KEY` / `FINANCIAL_DATASETS_API_KEY`

## Twitter / X

- [ ] `TWITTER_PASSWORD` — change account password
- [ ] `TWITTER_BEARER_TOKEN`, `TWITTER_CONSUMER_KEY`,
      `TWITTER_CONSUMER_KEY_SECRET`, `TWITTER_ACCESS_TOKEN`,
      `TWITTER_ACCESS_TOKEN_SECRET`, `TWITTER_CLIENT_ID`,
      `TWITTER_CLIENT_SECRET` — regenerate at
      https://developer.twitter.com/en/portal/dashboard

## Auth / wallet infra

- [ ] `PRIVY_APP_SECRET` / `PRIVY_AUTHORIZATION_KEY_ID` / `PRIVY_JWKS`
- [ ] `REOWN_PROJECT_ID` / `WALLET_CONNECT_PROJECT_ID`
- [ ] `PHANTOM_APP_ID` / `VITE_PHANTOM_APP_ID`
- [ ] `THIRDWEB_CLIENT_ID` / `THIRDWEB_CLIENT_SECRET` /
      `THIRDWEB_SECRET_KEY`
- [ ] `CROSSMINT_SERVERSIDE_API_KEY` / `CROSSMINT_CLIENTSIDE_API_KEY`

## Storage / DB / search

- [ ] `SUPABASE_SERVICE_ROLE` / `SUPABASE_SERVICE_ROLE_2` /
      `SUPABASE_SECRET_KEY` / `SUPABASE_SECRET_ACCESS_KEY` /
      `SUPABASE_ACCESS_KEY_ID` / `SUPABASE_JWT` / `SUPABASE_JWT_2`
- [ ] `PINECONE_API_KEY`
- [ ] `UPSTASH_API_KEY`
- [ ] `PINATA_JWT` / `PINATA_API_KEY` / `PINATA_API_SECRET` /
      `PINATA_GATEWAY_KEY`

## Infra / browser / sandbox

- [ ] `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_S3_API`
- [ ] `BROWSERBASE_API_KEY` / `BROWSERUSE_API_KEY` /
      `SCRAPYBARA_API_KEY` / `FIRECRAWL_API_KEY` / `E2B_API_KEY` /
      `STEEL_API_KEY`
- [ ] `VERCEL_AI_GATEWAY_API_KEY` / `VERCEL_AI_GATEWAY_TOKEN`
- [ ] `MOLTBOT_GATEWAY_TOKEN` / `MOLTBOOK_API_KEY`
- [ ] `OPENCLAW_GATEWAY`

## Source control

- [ ] `GITHUB_PAT` — https://github.com/settings/tokens

## Telephony / voice

- [ ] `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET`
- [ ] `TWILIO_RECOVERY_CODE`

## Aggregation token (catch-all)

If anything above is unfamiliar but appeared in the original `X/.env`,
rotate it anyway. The cost of rotating an unused key is zero; the cost of
missing one is total.
