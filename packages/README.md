# OpenClawd Packages

Shared npm packages for the OpenClawd ecosystem.

## Packages

| Package | Description | npm |
| --- | --- | --- |
| [`clawd-wallet/`](./clawd-wallet/) | Privy-powered embedded Solana wallet — Jupiter swaps, Grok AI screening | `@openclawd/wallet` |
| [`agentwallet-vault/`](./agentwallet/) | Self-managed encrypted keypair vault with E2B + Cloudflare deployment | `agentwallet-vault` |
| [`membrain/`](./membrain/) | Selective, revisable memory daemon (Go + gRPC) for trading agents | `@gustycube/membrane` |
| [`membrain-types/`](./membrain-types/) | TypeScript types and client for Membrain | `@openclaw/membrain-types` |
| [`honcho-bridge/`](./honcho-bridge/) | Honcho reasoning-memory adapter — peer/session persistence + auto-feed into Membrain | `@openclaw/honcho-bridge` |
| [`memory-host-sdk/`](./memory-host-sdk/) | Local memory engines (SQLite/embeddings/Honcho) for the host runtime | `@openclaw/memory-host-sdk` |

## membrain

**Selective, revisable memory substrate for autonomous Solana trading agents.** Go daemon + gRPC API with TypeScript and Python SDKs.

```bash
# Build the daemon (from repo root)
npm run build:membrain

# Run with the default SQLite backend
./packages/membrain/bin/membraned

# Or via the helper script
npm run dev:membrain
```

Memory types: `episodic` (trades), `semantic` (market facts), `competence` (strategies with success rates), `working` (live positions), `plan_graph` (DeFi workflows). Background jobs handle decay, pruning, and consolidation.

Deployment tiers — SQLite (single agent), Postgres (multi-agent), Postgres + pgvector (similarity search), Postgres + pgvector + LLM (auto pattern extraction).

```ts
import { MembraneClient, Sensitivity } from "@gustycube/membrane";

const m = new MembraneClient("localhost:9090", { apiKey: process.env.MEMBRAIN_API_KEY });
await m.ingestEvent("swap_executed", "jupiter#42", {
  summary: "Swapped 2.3 SOL → 1,450 USDC via Jupiter, slippage 0.8%",
  tags: ["jupiter", "swap"],
});
const records = await m.retrieve("evaluate SOL swap opportunity", {
  trust: { max_sensitivity: Sensitivity.MEDIUM, authenticated: true, scopes: [] },
  memoryTypes: ["competence", "semantic"],
});
```

See [`packages/membrain/README.md`](./membrain/README.md) for the full documentation, gRPC method list, configuration, and the trading-agent integration guide. The OpenClawd plugin bridge lives at [`packages/membrain/clients/openclawd/`](./membrain/clients/openclawd/) and exposes Membrain to OpenClawd hooks (event ingestion, `membrane_search` tool, auto-context injection).

## clawd-wallet

**Privy-powered embedded Solana wallet for the openclawd ecosystem.**

```bash
npm install @openclawd/wallet
```

```tsx
import { PrivyProvider, useClawdWallet } from "@openclawd/wallet/react";

<PrivyProvider appId={process.env.PRIVY_APP_ID!} embeddedWallets>
  <MyApp />
</PrivyProvider>

// Inside component:
const { wallet, connectWallet } = useClawdWallet();
```

- **React**: `<PrivyProvider>` + `useClawdWallet()` + `useClawdWalletBalance()`
- **Node.js**: `ClawdWallet` + `SwapService` for Jupiter quotes + execution
- **Agentic**: `AgenticWallet` with Grok 4.20 Beta transaction screening
- **CLI**: `clawd-wallet tokens | quote | balance | swap`

Architecture: `User → Grok 4.20 Beta → ClawdWallet (Privy TEE) → Solana`

See [`packages/clawd-wallet/README.md`](./clawd-wallet/README.md) for full docs.

## Development

```bash
cd packages/clawd-wallet
npm install
npm run build
```

## License

MIT — See [`../LICENSE.md`](../LICENSE.md)
