<div align="center">

<img src="assets/banner.png" alt="Clawd Router Banner" width="600">

<h1>The LLM router built for autonomous agents</h1>

<p>Agents can't sign up for accounts. Agents can't enter credit cards.<br>
Agents can only sign transactions.<br><br>
<strong>Clawd Router is the only LLM router that lets agents operate independently.</strong><br><br>
<em>8 models free, no crypto required. Powered by $CLAWD on Solana.</em></p>

<br>

<img src="https://img.shields.io/badge/🆓_8_Free_Models-success?style=for-the-badge" alt="8 free models">&nbsp;
<img src="https://img.shields.io/badge/🤖_Agent--Native-black?style=for-the-badge" alt="Agent native">&nbsp;
<img src="https://img.shields.io/badge/🔑_Zero_API_Keys-blue?style=for-the-badge" alt="No API keys">&nbsp;
<img src="https://img.shields.io/badge/⚡_Local_Routing-yellow?style=for-the-badge" alt="Local routing">&nbsp;
<img src="https://img.shields.io/badge/💰_x402_USDC-purple?style=for-the-badge" alt="x402 USDC">&nbsp;
<img src="https://img.shields.io/badge/🔓_Open_Source-green?style=for-the-badge" alt="Open source">&nbsp;
<img src="https://img.shields.io/badge/🦞_Powered_by_$CLAWD-9945FF?style=for-the-badge" alt="$CLAWD token">

[![npm version](https://img.shields.io/npm/v/@openclawd/clawd-router.svg?style=flat-square&color=cb3837)](https://npmjs.com/package/@openclawd/clawd-router)
[![npm downloads](https://img.shields.io/npm/dm/@openclawd/clawd-router.svg?style=flat-square&color=blue)](https://npmjs.com/package/@openclawd/clawd-router)
[![GitHub stars](https://img.shields.io/github/stars/x402agent/clawdrouter?style=flat-square&label=GitHub%20stars)](https://github.com/x402agent/clawdrouter)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[![Solana](https://img.shields.io/badge/Solana-USDC-9945FF?style=flat-square&logo=solana&logoColor=white)](https://solana.com)
[![OpenClawd Plugin](https://img.shields.io/badge/OpenClawd-Plugin-orange?style=for-the-badge)](https://openclawd.ai)

</div>

> **Clawd Router** is an open-source smart LLM router that reduces AI API costs by up to 92%. It analyzes each request across 15 dimensions and routes to the cheapest capable model in under 1ms, entirely locally. Clawd Router is the only LLM router built for autonomous AI agents — it uses wallet signatures for authentication (no API keys) and USDC micropayments via the x402 protocol (no credit cards). 55+ models from OpenAI, Anthropic, Google, xAI, DeepSeek, and more. MIT licensed.

**$CLAWD Token:** `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump` on Solana

---

## Why Clawd Router exists

Every other LLM router was built for **human developers** — create an account, get an API key, pick a model from a dashboard, pay with a credit card.

**Agents can't do any of that.**

Clawd Router is built for the agent-first world:

- **Starts at $0** — 8 NVIDIA models are free forever, no balance needed to start
- **No accounts** — a wallet is generated locally, no signup
- **No API keys** — your wallet signature IS authentication
- **No model selection** — 15-dimension scoring picks the right model automatically
- **No credit cards** — agents pay per-request with USDC via [x402](https://x402.org)
- **No trust required** — runs locally, <1ms routing, zero external dependencies

This is the stack that lets agents operate autonomously: **x402 + USDC + local routing**.

---

## How it compares

|                  | OpenRouter        | LiteLLM          | Martian           | Portkey           | **Clawd Router**          |
| ---------------- | ----------------- | ---------------- | ----------------- | ----------------- | ----------------------- |
| **Models**       | 200+              | 100+             | Smart routing     | Gateway           | **55+**                 |
| **Free tier**    | Rate-limited      | BYO keys         | No                | No                | **8 models, no signup** |
| **Routing**      | Manual selection  | Manual selection | Smart (closed)    | Observability     | **Smart (open source)** |
| **Auth**         | Account + API key | Your API keys    | Account + API key | Account + API key | **Wallet signature**    |
| **Payment**      | Credit card       | BYO keys         | Credit card       | $49-499/mo        | **USDC per-request**    |
| **Runs locally** | No                | Yes              | No                | No                | **Yes**                 |
| **Open source**  | No                | Yes              | No                | Partial           | **Yes**                 |
| **Agent-ready**  | No                | No               | No                | No                | **Yes**                 |

✓ Open source · ✓ Smart routing · ✓ Runs locally · ✓ Crypto native · ✓ Agent ready

**We're the only one that checks all five boxes.**

---

## Quick Start

> **No wallet? 8 models work free out of the box.** Install, run, and pin `nvidia/gpt-oss-120b` — no crypto, no signup, no balance required. Add USDC later when you want paid models.

### Option A — OpenClawd Agent

[OpenClawd](https://openclawd.ai) is an AI coding agent. If you're using it, Clawd Router installs as a plugin:

```bash
curl -fsSL https://openclawd.ai/clawdrouter-update | bash
openclawd gateway restart
```

Done. Smart routing (`clawdrouter/auto`) is now your default model.

### Option B — Standalone (continue.dev, Cursor, VS Code, any OpenAI-compatible client)

> **Using Clawd Code?** Clawd Router works with any OpenAI-compatible client.

No OpenClawd required. Clawd Router runs as a local proxy on port 8402.

**1. Start the proxy**

```bash
npx @openclawd/clawd-router
```

**2. Fund your wallet** — optional, skip for free tier
Your wallet address is printed on first run. For paid models, send a few USDC on Solana — $5 covers thousands of requests. To stay at $0, pin any of the 8 free models (e.g. `nvidia/gpt-oss-120b`) or use `/model free` inside OpenClawd.

**3. Point your client at `http://localhost:8402`**

<details>
<summary><strong>continue.dev</strong> — <code>~/.continue/config.yaml</code></summary>

> **Important:** `apiBase` must end with `/v1/` (including the trailing slash). Without it, continue.dev constructs the URL as `/chat/completions` instead of `/v1/chat/completions`, and the proxy returns 404.

```yaml
models:
  - name: Clawd Router Auto
    provider: openai
    model: clawdrouter/auto
    apiBase: http://localhost:8402/v1/
    apiKey: x402
    roles:
      - chat
      - edit
      - apply
```

To pin a specific model, replace `clawdrouter/auto` with any model from [openclawd.ai/models](https://openclawd.ai/models), e.g. `anthropic/claude-opus-4.6`, `xai/grok-4-0709`.

</details>

<details>
<summary><strong>Cursor</strong> — Settings → Models → OpenAI-compatible</summary>

Set base URL to `http://localhost:8402`, API key to `x402`, model to `clawdrouter/auto`.

</details>

<details>
<summary><strong>Any OpenAI SDK</strong></summary>

```python
from openai import OpenAI
client = OpenAI(base_url="http://localhost:8402", api_key="x402")
response = client.chat.completions.create(model="clawdrouter/auto", messages=[...])
```

</details>

---

## Routing Profiles

Choose your routing strategy with `/model <profile>`:

| Profile          | Strategy           | Savings  | Best For             |
| ---------------- | ------------------ | -------- | -------------------- |
| `/model free`    | Free NVIDIA models | **100%** | $0 balance, learning |
| `/model auto`    | Balanced (default) | 74-100%  | General use          |
| `/model eco`     | Cheapest possible  | 95-100%  | Maximum savings     |
| `/model premium` | Best quality       | 0%       | Mission-critical    |

**Shortcuts:** `/model grok`, `/model br-sonnet`, `/model gpt5`, `/model o3`

---

## How It Works

**100% local routing. <1ms latency. Zero external API calls.**

```
Request → Weighted Scorer (15 dimensions) → Tier → Best Model → Response
```

| Tier      | ECO Model                           | AUTO Model                            | PREMIUM Model                |
| --------- | ----------------------------------- | ------------------------------------- | ---------------------------- |
| SIMPLE    | nvidia/gpt-oss-120b (**FREE**)      | gemini-2.5-flash ($0.30/$2.50)        | kimi-k2.5                    |
| MEDIUM    | gemini-3.1-flash-lite ($0.25/$1.50) | kimi-k2.5 ($0.60/$3.00)               | gpt-5.3-codex ($1.75/$14.00) |
| COMPLEX   | gemini-3.1-flash-lite ($0.25/$1.50) | gemini-3.1-pro ($2/$12)               | claude-opus-4.6 ($5/$25)     |
| REASONING | grok-4-1-fast ($0.20/$0.50)         | grok-4-1-fast-reasoning ($0.20/$0.50) | claude-sonnet-4.6 ($3/$15)   |

**Blended average: $2.05/M** vs $25/M for Clawd Opus = **92% savings**

---

## Image Generation

Generate images directly from chat with `/imagegen`:

```
/imagegen a dog dancing on the beach
/imagegen --model dall-e-3 a futuristic city at sunset
/imagegen --model banana-pro --size 2048x2048 mountain landscape
```

| Model                        | Provider              | Price        | Max Size  |
| ---------------------------- | --------------------- | ------------ | --------- |
| `nano-banana`                | Google Gemini Flash   | $0.05/image  | 1024x1024 |
| `banana-pro`                 | Google Gemini Pro     | $0.10/image  | 4096x4096 |
| `dall-e-3`                   | OpenAI DALL-E 3       | $0.04/image  | 1792x1024 |
| `gpt-image`                  | OpenAI GPT Image 1    | $0.02/image  | 1536x1024 |
| `flux`                       | Black Forest Flux 1.1 | $0.04/image  | 1024x1024 |
| `xai/grok-imagine-image`     | xAI Grok Imagine      | $0.02/image  | 1024x1024 |
| `xai/grok-imagine-image-pro` | xAI Grok Imagine Pro  | $0.07/image  | 1024x1024 |
| `zai/cogview-4`              | Zhipu CogView-4       | $0.015/image | 1440x1440 |

## Video Generation

Generate short AI videos directly from chat with `/videogen`:

```
/videogen a red apple slowly spinning
/videogen --model seedance-2-fast --duration=5 a cat waving
/videogen --model grok-video a neon city at night
```

| Model                         | Provider           | Price     | Duration              |
| ----------------------------- | ------------------ | --------- | --------------------- |
| `bytedance/seedance-1.5-pro`  | ByteDance Seedance | $0.03/sec | 5s default, up to 10s |
| `bytedance/seedance-2.0-fast` | ByteDance Seedance | $0.15/sec | 5s default, up to 10s |
| `bytedance/seedance-2.0`      | ByteDance Seedance | $0.30/sec | 5s default, up to 10s |
| `xai/grok-imagine-video`      | xAI Grok Imagine   | $0.05/sec | 8s default            |

---

## Models & Pricing

55+ models across 9 providers, one wallet. **Starting at $0.0002/request.**

> **💡 "Cost per request"** = estimated cost for a typical chat message (~500 input + 500 output tokens).

### Budget Models (under $0.001/request)

| Model                              | Input $/M | Output $/M | ~$/request | Context | Features                          |
| ---------------------------------- | --------: | ---------: | ---------: | ------- | --------------------------------- |
| nvidia/gpt-oss-120b                |  **FREE** |   **FREE** |     **$0** | 128K    |                                   |
| nvidia/gpt-oss-20b                 |  **FREE** |   **FREE** |     **$0** | 128K    |                                   |
| nvidia/deepseek-v3.2               |  **FREE** |   **FREE** |     **$0** | 131K    | reasoning                         |
| nvidia/qwen3-coder-480b            |  **FREE** |   **FREE** |     **$0** | 131K    | coding                            |
| nvidia/glm-4.7                     |  **FREE** |   **FREE** |     **$0** | 131K    | reasoning                         |
| nvidia/llama-4-maverick            |  **FREE** |   **FREE** |     **$0** | 131K    | reasoning                         |
| nvidia/qwen3-next-80b-a3b-thinking |  **FREE** |   **FREE** |     **$0** | 131K    | reasoning                         |
| nvidia/mistral-small-4-119b        |  **FREE** |   **FREE** |     **$0** | 131K    |                                   |
| openai/gpt-5-nano                  |     $0.05 |      $0.40 |    $0.0002 | 128K    | tools                             |
| openai/gpt-4.1-nano                |     $0.10 |      $0.40 |    $0.0003 | 128K    | tools                             |
| google/gemini-2.5-flash-lite       |     $0.10 |      $0.40 |    $0.0003 | 1M      | tools                             |
| openai/gpt-4o-mini                 |     $0.15 |      $0.60 |    $0.0004 | 128K    | tools                             |
| xai/grok-4-fast                    |     $0.20 |      $0.50 |    $0.0004 | 131K    | tools                             |
| xai/grok-4-fast-reasoning          |     $0.20 |      $0.50 |    $0.0004 | 131K    | reasoning, tools                  |
| xai/grok-4-1-fast                  |     $0.20 |      $0.50 |    $0.0004 | 131K    | tools                             |
| xai/grok-4-1-fast-reasoning        |     $0.20 |      $0.50 |    $0.0004 | 131K    | reasoning, tools                  |
| xai/grok-4-0709                    |     $0.20 |      $1.50 |    $0.0009 | 131K    | reasoning, tools                  |
| openai/gpt-5-mini                  |     $0.25 |      $2.00 |    $0.0011 | 200K    | tools                             |
| deepseek/deepseek-chat             |     $0.28 |      $0.42 |    $0.0004 | 128K    | tools                             |
| deepseek/deepseek-reasoner         |     $0.28 |      $0.42 |    $0.0004 | 128K    | reasoning, tools                  |
| xai/grok-3-mini                    |     $0.30 |      $0.50 |    $0.0004 | 131K    | tools                             |
| minimax/minimax-m2.7               |     $0.30 |      $1.20 |    $0.0008 | 205K    | reasoning, agentic, tools         |
| minimax/minimax-m2.5               |     $0.30 |      $1.20 |    $0.0008 | 205K    | reasoning, agentic, tools         |
| google/gemini-2.5-flash            |     $0.30 |      $2.50 |    $0.0014 | 1M      | vision, tools                     |
| openai/gpt-4.1-mini                |     $0.40 |      $1.60 |    $0.0010 | 128K    | tools                             |
| google/gemini-3-flash-preview      |     $0.50 |      $3.00 |    $0.0018 | 1M      | vision                            |
| moonshot/kimi-k2.5                 |     $0.60 |      $3.00 |    $0.0018 | 262K    | reasoning, vision, agentic, tools |
| moonshot/kimi-k2.6                 |     $0.95 |      $4.00 |    $0.0025 | 262K    | reasoning, vision, agentic, tools |

> **Free tier:** 8 models cost nothing — `/model free` points to gpt-oss-120b, or pick any free model directly (e.g., `/model qwen-thinking`, `/model mistral-small`, `/model deepseek-free`).

---

## Payment

No account. No API key. **Payment IS authentication** via [x402](https://x402.org).

```
Request → 402 (price: $0.003) → wallet signs USDC → retry → response
```

USDC stays in your wallet until spent — non-custodial. Price is visible in the 402 header before signing.

**Dual-chain support:** Pay with **USDC** on **Solana** or **Base (EVM)**. Both wallets are derived from a single BIP-39 mnemonic on first run.

```bash
/wallet              # Check balance and address (both chains)
/wallet export       # Export mnemonic + keys for backup
/wallet recover      # Restore wallet from mnemonic on a new machine
/wallet solana       # Switch to Solana USDC payments
/wallet base         # Switch back to Base (EVM) USDC payments
/chain solana        # Alias for /wallet solana
/stats               # View usage and savings
/stats clear         # Reset usage statistics
/exclude             # Show excluded models
/exclude add <model> # Block a model from routing (aliases work: "grok-4", "free")
/exclude remove <model> # Unblock a model
/exclude clear       # Remove all exclusions
```

**Fund your wallet:**

- **Solana:** Send USDC on Solana to your Solana address
- **Base (EVM):** Send USDC on Base to your EVM address
- **CEX:** Withdraw USDC to either network

---

## Screenshots

<table>
<tr>
<td width="50%" align="center">
<strong>Smart Routing in Action</strong><br><br>
<img src="docs/clawdrouter-savings.png" alt="Clawd Router savings" width="400">
</td>
<td width="50%" align="center">
<strong>Telegram Integration</strong><br><br>
<img src="assets/telegram-demo.png" alt="Telegram demo" width="400">
</td>
</tr>
</table>

---

## Configuration

For basic usage, no configuration needed. For advanced options:

| Variable                    | Default                               | Description             |
| --------------------------- | ------------------------------------- | ----------------------- |
| `CLAWDROUTER_WALLET_KEY`    | auto-generated                        | Your wallet private key |
| `CLAWDROUTER_PROXY_PORT`    | `8402`                                | Local proxy port        |
| `CLAWDROUTER_DISABLED`      | `false`                               | Disable smart routing   |
| `CLAWDROUTER_SOLANA_RPC_URL`| `https://api.mainnet-beta.solana.com` | Solana RPC endpoint     |

**Full reference:** [docs/configuration.md](docs/configuration.md)

---

## Development

```bash
git clone https://github.com/x402agent/clawdrouter.git
cd clawdrouter
npm install
npm run build
npm test
```

---

## Support

| Channel               | Link                                                               |
| --------------------- | ------------------------------------------------------------------ |
| 📅 Schedule Demo      | [calendly.com/vickyfu9/30min](https://calendly.com/vickyfu9/30min) |
| 💬 Community Telegram | [t.me/openclawd](https://t.me/openclawd)                          |
| 🐦 X / Twitter        | [x.com/openclawd](https://x.com/openclawd)                        |
| 📱 Founder Telegram   | [@bc1max](https://t.me/bc1max)                                     |

---

## From the OpenClawd Ecosystem

**$CLAWD Token:** `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump` on Solana

OpenClawd is the autonomous AI agent platform for Solana DeFi. Clawd Router is the LLM routing layer that powers it.

---

## More Resources

| Resource                                               | Description              |
| ------------------------------------------------------ | ------------------------ |
| [Documentation](https://openclawd.ai/docs)              | Full docs                |
| [Model Pricing](https://openclawd.ai/models)            | All models & prices      |
| [Image Generation & Editing](docs/image-generation.md) | API examples, 5 models   |
| [Routing Profiles](docs/routing-profiles.md)           | ECO/AUTO/PREMIUM details |
| [Architecture](docs/architecture.md)                   | Technical deep dive      |
| [Configuration](docs/configuration.md)                 | Environment variables    |

---

## Frequently Asked Questions

### What is Clawd Router?

Clawd Router is an open-source (MIT licensed) smart LLM router built for autonomous AI agents. It analyzes each request across 15 dimensions and routes to the cheapest capable model in under 1ms, entirely locally — no external API calls needed for routing decisions.

### How much can Clawd Router save on LLM costs?

Clawd Router's blended average cost is $2.05 per million tokens compared to $25/M for Clawd Opus, representing 92% savings. Actual savings depend on your workload — simple queries are routed to free models ($0/request), while complex tasks get premium models.

### How does Clawd Router compare to OpenRouter?

Clawd Router is open source and runs locally. It uses wallet-based authentication (no API keys) and USDC per-request payments (no credit cards or subscriptions). OpenRouter requires an account, API key, and credit card. Clawd Router also features smart routing — it automatically picks the best model for each request, while OpenRouter requires manual model selection.

### Is Clawd Router free?

Clawd Router itself is free and MIT licensed. You pay only for the LLM API calls routed through it — and 8 NVIDIA-hosted models (`gpt-oss-120b`, `gpt-oss-20b`, `deepseek-v3.2`, `qwen3-coder-480b`, `glm-4.7`, `llama-4-maverick`, `qwen3-next-80b-a3b-thinking`, `mistral-small-4-119b`) are completely free. Use `/model free` to smart-route across them, or pick any by name.

---

<div align="center">

**MIT License** · [OpenClawd](https://openclawd.ai) — Agent-native AI infrastructure on Solana

🦞 Powered by $CLAWD · `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump`

⭐ If Clawd Router powers your agents, consider starring the repo!

</div>