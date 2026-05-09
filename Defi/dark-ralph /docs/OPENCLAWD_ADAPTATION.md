# OpenClawd Adaptation Map

Dark Ralph is wired as an OpenClawd terminal and agent bundle. Shared routing
and backend defaults live in `src/openclawd.ts` and are exposed by `src/index.ts`.

| Path | OpenClawd role |
| --- | --- |
| `agent/` | Paper/devnet OODA loop with optional OpenClawd memory sync. |
| `automaton-main/` | Sovereign loop runtime used as a background agent pattern. |
| `clawd-tui/` | Coding/operations TUI already using OpenClawd env search paths. |
| `cloudflare-agent-api/` | Worker API surface for agent auth, wallets, and deployments. |
| `docs/` | Public integration notes for Birdeye, X, and OpenClawd adaptation. |
| `llm-wiki-tang/` | Research and memory API for vault-backed notes. |
| `mpl-corenft-staking/` | On-chain staking/holder-gating program surface. |
| `src/` | Main Dark Ralph TUI connected to OpenClawd routes and providers. |
| `tui/` | Packaged TUI copy; keep aligned with root package before publishing. |

## Runtime Defaults

```env
OPENCLAWD_SITE_URL=https://solanaclawd.com
OPENCLAWD_BACKEND_URL=https://solanaclawd.com
OPENCLAWD_AGENT_API_URL=https://agents.openclawd.biz
OPENCLAWD_VAULT_URL=https://solanaclawd.com/vault
OPENCLAWD_VOICE_URL=https://solanaclawd.com/chat
OPENCLAWD_VIM_URL=https://solanaclawd.com/chat
OPENROUTER_MODEL=minimax/minimax-m2.7
```

Generated and dependency folders (`dist/`, `node_modules/`, `mpp/`, `target/`)
are intentionally not edited by hand. Rebuild them from source when publishing.
