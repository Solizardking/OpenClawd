# Security

This hackathon package is public-facing. Treat every file under `hackathon/` as safe to publish.

## Do Not Commit

- `SOLANA_PRIVATE_KEY`
- funded wallet keypairs
- `.env` or `.env.local` with real values
- Helius, Birdeye, Jupiter, OpenRouter, Privy, Honcho, or webhook secrets
- raw private sensor logs from real robots

## Demo Safety

The included demo is deterministic and offline. It does not:

- sign transactions
- move funds
- call RPC endpoints
- call paid plugins
- control real hardware

## Reporting

Open an issue or contact the maintainers if you find:

- exposed credentials
- unsafe command execution paths
- missing permission gates for robot movement
- receipts that leak sensitive private telemetry

