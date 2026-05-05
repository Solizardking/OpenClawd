# @openclawdsolana/service-registry

Single source of truth for OpenClawd local-service URLs.

Every service in the monorepo (gateway, clawdrouter, API registrar, MCP bridges, agent-wallet, attestation-agent, hermes-vault, pump-scanner-cron, clawdhub, mawdaxe) is registered here with a default host/port and an env-var override. Importers call `discover(name)` instead of hard-coding `http://localhost:8788`, so a single env change reaches every consumer.

## Use

```ts
import { discover, health, healthAll, SERVICES } from '@openclawdsolana/service-registry'

const gw = discover('gateway')
await fetch(gw.url + '/api/v1/agents')

const result = await health('clawdrouter')
console.log(result.ok, result.latencyMs)

for (const r of await healthAll()) {
  console.log(r.name.padEnd(18), r.ok ? 'OK' : 'DOWN', r.status ?? r.error ?? '')
}
```

## Env overrides

| Service             | Env var                          | Default                      |
| ------------------- | -------------------------------- | ---------------------------- |
| `gateway`           | `OPENCLAWD_GATEWAY_URL`          | `http://127.0.0.1:8788`      |
| `clawdrouter`       | `CLAWDROUTER_URL`                | `http://127.0.0.1:8402`      |
| `walletApi`         | `OPENCLAWD_WALLET_API_URL`       | `http://127.0.0.1:3000`      |
| `mawdaxe`           | `OPENCLAWD_MAWDAXE_URL`          | `http://127.0.0.1:8420`      |
| `mcpBridge`         | `OPENCLAWD_MCP_URL`              | `http://127.0.0.1:3001`      |
| `browserMcp`        | `OPENCLAWD_BROWSER_MCP_URL`      | `http://127.0.0.1:38401`     |
| `apiRegistrar`      | `OPENCLAWD_REGISTRAR_URL`        | `http://127.0.0.1:3001`      |
| `clawdhub`          | `CLAWDHUB_URL`                   | `http://127.0.0.1:5173`      |
| `attestationAgent`  | `OPENCLAWD_ATTESTATION_URL`      | `http://127.0.0.1:8430`      |
| `hermesVault`       | `OPENCLAWD_HERMES_VAULT_URL`     | `http://127.0.0.1:8431`      |
| `pumpScannerCron`   | `OPENCLAWD_PUMP_SCANNER_URL`     | `http://127.0.0.1:8432`      |

Set any of these to a full URL (`http://host:port`) and `discover()` will return the parsed override; everything else stays at its default.

## Doctor

`node scripts/doctor.mjs --registry` pings `healthPath` on every service and prints a green/red table — fastest way to answer "is the world up?" without a full orchestrator.
