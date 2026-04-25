# ClawdBot Integration

ClawdBot lives at `X/` and is integrated as the primary Twitter/Telegram trading agent.

## Integration Points

The `X/` folder contains:
- `src/services/sentient-engine.ts` — Autonomous intelligence loop
- `src/services/command-handler.ts` — 46+ command system
- `src/services/jupiter-service.ts` — Jupiter DEX integration
- `src/services/pump-fun-service.ts` — Pump.fun token launch
- `src/services/xai-service.ts` — xAI/Grok AI

## Runtime

Run ClawdBot:
```bash
cd X
npm install
npx tsx src/scripts/start-bot.ts
```

## Commands

| Command | Description |
|---------|-------------|
| `!token <ca>` | Full token analysis |
| `!swap <from> <to> <amt>` | Jupiter swap |
| `!jupbuy <mint> <sol>` | Buy via Jupiter |
| `!launch <name> <sym>` | Launch on pump.fun |

## Environment

Copy `.env.example` to `.env` and configure:
- `TWITTER_*` — OAuth 1.0a credentials
- `XAI_API_KEY` — Grok API
- `HELIUS_API_KEY` — Solana RPC
- `SOLANA_PRIVATE_KEY` — Trading wallet

## $CLAWD Token

- **CA:** `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump`
- **X:** [@clawddevs](https://x.com/clawddevs)
- **Website:** [solanaclawd.com](https://solanaclawd.com)
