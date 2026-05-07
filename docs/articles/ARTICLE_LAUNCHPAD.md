# Sealed Launches: the OpenClawd Agentic Launchpad on Solana + Base

**TL;DR** — `/launchpad` is the new home for zero-to-token agent deployments on CLAWD. You mint an agent on `mpl-agent-registry`, attest it inside a **Phala TDX enclave**, attach a handful of skills, and let it launch its own token on **Pump.fun** (Solana) or **Clanker** (Base) in one signed flow. No eliza runtime, no Docker trust-me, no seat licenses. Just OpenClawd agents, TEE-sealed keys, and x402-metered inference.

---

## Why a new launchpad?

Every "agent launchpad" in 2025 cargo-culted the same three pieces: a fork of eliza, a token that claimed to represent the agent's treasury, and a Discord bot running in someone's bedroom. The problem was never the vibes. The problem was *trust assumptions*.

- You couldn't prove the agent wasn't hot-swapped between your audit and your deposit.
- You couldn't prove its keys weren't copied to a second machine.
- You couldn't prove LLM calls weren't being ghost-billed.
- You definitely couldn't prove it would still work after the founder rage-quit.

We wanted a launchpad where **every one of those is provable by the user, before any money moves.** That's what `/launchpad` is.

---

## What's in the box

### 1. OpenClawd agents (eliza is out)
We deleted the `eliza-develop` runtime and replaced it with OpenClawd — the same agent framework the rest of the site runs on. That gives every launchpad agent four things it didn't have before:

1. **Registry identity** — every agent is minted on `mpl-agent-registry` (Solana) and mirrored on Base via a Wormhole-signed ERC-7857 attestation. Same identity, two chains.
2. **Honcho brain** — wallet-keyed memory shared with your CLAWD Terminal. Your launchpad agent remembers what you taught it in `/terminal`.
3. **ClawdRouter inference** — all LLM calls are x402-metered against a per-agent USDC balance. Zero LLM downtime surprises.
4. **SOUL profiles** — trait-driven behavior tuning (aggression, patience, risk tolerance) that survives handoffs.

### 2. Phala TDX enclave
Agent code runs inside a Phala TDX enclave. You get the **attestation quote** before you fund anything:

```bash
clawd launchpad attest <agent-address>
```

The quote proves the enclave booted the exact bytecode you expect, sealed its private keys to the TEE hardware, and hasn't been tampered with. If any of those change, the next attestation fails loudly.

### 3. Dual-rail token launch

| rail | token std | launch venue | base fee |
|------|-----------|--------------|----------|
| Solana | SPL (Token-2022) | Pump.fun bond → Raydium LP | ~0.02 SOL |
| Base | ERC-20 | Clanker pair + Zora coin mirror | ~0.0004 ETH |

A single mint tx on Solana (or a 4337 bundle on Base) handles the token, the agent registry entry, the LP seed, and the initial fee-share recipient. **One signature, one tx, one LP.**

### 4. Ten new skills
We shipped ten skill wrappers over the `plugin.delivery/api/*` services so agents get the same data your browser does:

- `defillama-market` — sector TVL, protocol revenue, fundamentals screener
- `dexscreener-scout` — new-pair scanning, bundler heat, volume deltas
- `coingecko-rates` — cross-exchange spot + historic series
- `oneinch-router` — best-of-N DEX routing on Base
- `pump-fun-sdk` — bond curves, graduation heuristics, dev-wallet flags
- `phishing-detector` — URL + contract screener
- `sanctions-check` — OFAC + chainalysis gates before any tx
- `contract-scanner` — proxy detection, mint authority audit
- `gas-estimator` — live gas oracles across Base, Ethereum, Optimism, Arbitrum
- `grants-finder` — open Solana + Base grant programs with deadlines

Each installs with one line:

```bash
clawd skills:install defillama-market
```

---

## The install story

One command, any machine:

```bash
curl -fsSL https://install.solanaclawd.com | bash
```

You get `clawd`, `nanosolana`, and `solanaos` in `~/.local/bin`. If you prefer npm:

```bash
npm i -g @mawdbotsonsolana/cli
```

Homebrew tap also available at `x402agent/tap/solana-clawd`. All three paths produce the same binary.

---

## The six-step launch

```
01 · Connect Phantom + any EIP-6963 wallet.
02 · Mint agent on mpl-agent-registry (Base mirror in the same flow).
03 · Attach 3–5 skills from the library.
04 · Boot Phala TEE (attestation hash returned in ~30s).
05 · Deposit ~0.02 SOL / ~0.0004 ETH; Pump.fun or Clanker pair + LP created.
06 · Agent goes live. x402-metered inference. Pause / rotate any time.
```

---

## What this replaces

| before | after |
|--------|-------|
| eliza-develop fork | OpenClawd agents (native) |
| "trust me bro" Docker | Phala TDX + attestation quote |
| API-key theft risk | wallet-signed x402 per call |
| chain-of-one | Solana first, Base parity via Wormhole |
| ad-hoc skills | 10 curated + 50+ in `/skills` |

---

## Try it

- **Page**: [`/launchpad`](https://solanaclawd.com/launchpad)
- **CLI**: `curl -fsSL https://install.solanaclawd.com | bash`
- **Mint an agent**: [`/agents/mint`](https://solanaclawd.com/agents/mint)
- **Skills**: [`/skills`](https://solanaclawd.com/skills)
- **Source**: [github.com/x402agent/clawd-terminal](https://github.com/x402agent/clawd-terminal)

---

*Filed under: launches, TEE, agent infra, Solana, Base, Phala.*
