# @openclawdsolana/attestation-agent

> Solana Attestation Service notary for OpenClawd lobsters — credential, schema, agent-birth (MPL Core) and skill attestation flows.

The Attestation Agent is the on-chain notary that runs the **birth ceremony** for every newborn lobster. It talks to the **Solana Attestation Service** (`22zoJMtdu4tQc2PzL74ZUT7FrwgB1Udec8DdW4yw4BdG`) to record formal identity, then mints a **Metaplex Core** asset as the visible artifact at [core.metaplex.com](https://core.metaplex.com). Anyone can verify the resulting attestation on the public verifier UI at [attest.solana.com](https://attest.solana.com).

```
                         birth ceremony
              ┌───────────────────────────────────────────┐
              │                                           │
   ┌──────────▼────────────┐         ┌────────────────────▼──────────┐
   │  Solana Attestation   │         │   Metaplex Core (MPL-Core)    │
   │   Service (program    │         │   asset = visible identity    │
   │   22zoJMtdu4tQc2PzL…) │         │   metadata.attestation_pda    │
   └──────────┬────────────┘         └────────────────────┬──────────┘
              │                                           │
              ▼                                           ▼
        attestation PDA                              asset address
              │                                           │
              └─────────────► identity.json ◄─────────────┘
                              (~/.openclawd/)
```

## Architecture at a glance

| Layer | Purpose | Source |
| --- | --- | --- |
| **schemas.ts** | OpenClawd schema layouts + a hand-rolled serializer for the OpenClawd extension types (`PUBKEY=32`, `STRING=12`, `U64=8`, `BOOL=1`) defined in [`solana-attestation-service-master/core/src/lib.rs`](../../solana-attestation-service-master/core/src/lib.rs). | `src/schemas.ts` |
| **sas.ts** | Thin async wrapper over the auto-generated `sas-lib` — `setupCredential`, `setupSchema`, `issueAttestation`, `fetchAttestationRecord`, plus PDA derivers. Idempotent (skips re-creation if the PDA exists). | `src/sas.ts` |
| **birth.ts** | MPL Core mint that embeds the SAS attestation PDA in the asset's `Attributes` plugin and metadata `external_url`. Optional — disable with `--no-mint`. | `src/birth.ts` |
| **index.ts** | `birthAgent()` orchestration — single async call that runs credential → schemas → identity attestation → MPL Core mint and returns one receipt object. | `src/index.ts` |
| **cli.ts** | `openclawd-attest` binary with six subcommands. | `src/cli.ts` |

## Installation

The service depends on the in-repo SAS TS client (`sas-lib`). Install from the root of the monorepo:

```bash
cd services/attestation-agent
npm install
npm run build
```

## CLI

The binary is `openclawd-attest`. Every subcommand prints JSON to stdout so the leviathan can pipe it directly into `~/.openclawd/identity.json`.

```bash
# 0. Defaults from your environment
export HELIUS_RPC_URL="https://mainnet.helius-rpc.com/?api-key=..."

# 1. Bootstrap the OpenClawd credential under your authority keypair (idempotent)
openclawd-attest setup-credential \
  --payer-keypair @~/.config/solana/id.json \
  --authority-keypair @~/.config/solana/id.json \
  --name "OpenClawd Skill Authority"

# 2. Register both OpenClawd schemas (idempotent — re-runnable)
openclawd-attest setup-schemas \
  --payer-keypair @~/.config/solana/id.json \
  --authority-keypair @~/.config/solana/id.json \
  --name "OpenClawd Skill Authority"

# 3. Birth a new lobster — credential + schemas are reused if already present.
#    Mints the MPL Core asset, issues OpenClawdAgentIdentity, prints the
#    attest.solana.com explorer URL.
openclawd-attest birth-agent \
  --payer-keypair @~/.config/solana/id.json \
  --authority-keypair @~/.config/solana/id.json \
  --name "OpenClawd Skill Authority" \
  --agent-id snippy-001 \
  --agent-name "Snippy"

# 4. Issue a skill attestation referencing an off-chain proof hash
openclawd-attest attest-skill \
  --payer-keypair @~/.config/solana/id.json \
  --authority-keypair @~/.config/solana/id.json \
  --credential <CREDENTIAL_PDA> \
  --skill-schema <SKILL_SCHEMA_PDA> \
  --skill-id solana-formal-verification \
  --verifier <VERIFIER_PUBKEY> \
  --proof-hash 0xabc... \
  --verified

# 5. Read it back
openclawd-attest verify --attestation <ATTESTATION_PDA>
openclawd-attest explorer --attestation <ATTESTATION_PDA>
```

Keypair flags accept three forms: a base58 secret string, a JSON byte array, or `@/path/to/id.json` to load from disk.

## Programmatic API

```ts
import { birthAgent, signerFromJsonArray } from '@openclawdsolana/attestation-agent';
import { readFileSync } from 'node:fs';

const secret = JSON.parse(readFileSync(process.env.SOLANA_KEYPAIR!, 'utf-8')) as number[];
const payer = await signerFromJsonArray(secret);

const receipt = await birthAgent({
  rpcUrl: process.env.HELIUS_RPC_URL!,
  payer,
  authority: payer,
  credentialName: 'OpenClawd Skill Authority',
  agentId: 'snippy-001',
  agentName: 'Snippy',
  payerSecretKeyBytes: Uint8Array.from(secret),
});

console.log(receipt.identityAttestation.attestation);
console.log(receipt.birthAsset?.asset);
console.log(receipt.explorer);
```

## OpenClawd schemas

Two schemas are registered under one credential. Both are direct ports of the byte tables in [`core/src/lib.rs`](../../solana-attestation-service-master/core/src/lib.rs).

### `OpenClawdSkillAttestation`

| Field | Type | Layout byte |
| --- | --- | --- |
| `skill_id` | string | 12 |
| `verifier_pubkey` | pubkey (32 bytes) | 32 |
| `proof_hash` | string | 12 |
| `verification_timestamp` | u64 | 8 |
| `is_formally_verified` | bool | 1 |

### `OpenClawdAgentIdentity`

| Field | Type | Layout byte |
| --- | --- | --- |
| `agent_id` | string | 12 |
| `wallet_pubkey` | pubkey (32 bytes) | 32 |
| `skill_attestation` | string | 12 |
| `vault_address` | pubkey (32 bytes) | 32 |
| `is_vault_initialized` | bool | 1 |

Layout byte `32` is an OpenClawd extension type beyond the SAS primitive table (0–25). SAS itself accepts the `layout` field as opaque bytes during `CreateSchema`, so registration succeeds; on the read path we use the OpenClawd-aware decoder in `schemas.ts` to convert raw bytes back into typed values.

## Receipt shape

```json
{
  "credential": { "credential": "Credxxx", "bump": 254, "signature": "...", "alreadyExisted": false },
  "skillSchema": { "schema": "Schxxx", "bump": 252, "signature": "...", "alreadyExisted": false },
  "identitySchema": { "schema": "Schyyy", "bump": 251, "signature": "...", "alreadyExisted": false },
  "identityAttestation": { "attestation": "Attzzz", "bump": 250, "signature": "...", "schema": "Schyyy", "nonce": "Nonce..." },
  "birthAsset": { "asset": "MPLcoreAsset...", "metadataUri": "data:application/json;base64,...", "signature": "..." },
  "agentWallet": "WaLxxx",
  "explorer": "https://attest.solana.com/Attzzz"
}
```

This is the exact JSON the leviathan persists to `~/.openclawd/identity.json` immediately after spawn.

## Wiring into the rest of OpenClawd

| Caller | How it uses the agent |
| --- | --- |
| **leviathan** ([`openclawd-framework/src/identity/`](../../openclawd-framework/src/identity/)) | Calls `birthAgent()` from its first-spawn wizard. Persists the receipt to `~/.openclawd/identity.json`. |
| **AutoResearch wiki** ([`llm-wiki-tang/`](../../llm-wiki-tang/)) | Optional: every `attest-skill` issuance can be triggered when an autoloop research mandate produces a "verified" finding (e.g. "this token graduated within the predicted window"). |
| **TUI** ([`clawd-tui/`](../../clawd-tui/)) | New `/attest <agent_id>` slash command can shell out to `openclawd-attest birth-agent` and print the `attest.solana.com` URL. |
| **MCP** | Wrap each subcommand as an MCP tool so Claude Desktop / Cursor can drive the birth ceremony. |

## Related

- Rust side: [`solana-attestation-service-master/`](../../solana-attestation-service-master/)
- Pinocchio program: [`solana-attestation-service-master/program/`](../../solana-attestation-service-master/program/)
- TS client (auto-generated): [`solana-attestation-service-master/clients/typescript/`](../../solana-attestation-service-master/clients/typescript/)
- Public verifier UI: <https://attest.solana.com>
- Metaplex Core: <https://developers.metaplex.com/core>
- Template: [`agents/templates/solana-attestation-agent.template.json`](../../agents/templates/solana-attestation-agent.template.json)

## License

MIT — see [`LICENSE`](../../LICENSE).
