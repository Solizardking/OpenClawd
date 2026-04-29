# 🦞 OpenClawd Browser Bridge

> A Chrome extension that turns your browser into an OpenClawd surface.
> Three things in one: CDP relay for tab automation · OpenClawd Gateway client for live Solana market data · an encrypted Solana agent wallet that signs transactions in-extension.

| Subsystem        | What it does                                                     | Backend                                  |
| ---------------- | ---------------------------------------------------------------- | ---------------------------------------- |
| **CDP Relay**    | Attach `chrome.debugger` to the active tab, bridge to OpenClawd  | `ws://127.0.0.1:18792/extension`         |
| **Gateway**      | Token cards, wallet portfolio lookups via right-click menu       | `http://127.0.0.1:8788` (or remote)      |
| **Agent Wallet** | Ed25519 keypair + AES-GCM at-rest, auto-locks after 15 min       | `chrome.storage.local` + WebCrypto       |

---

## Install (load unpacked)

1. **Build/run** the OpenClawd CDP relay (any of: `clawd browser relay`, the Gateway service, or a local Node host).
2. Make sure `http://127.0.0.1:18792/` answers a `HEAD /` (default port).
3. Optionally start the OpenClawd Gateway at `http://127.0.0.1:8788` (`cd gateway && npm run dev`).
4. **Chrome → `chrome://extensions`** → toggle **Developer mode**.
5. **Load unpacked** → select this folder.
6. Pin the lobster icon. Click it on any tab to attach the debugger.

The first launch opens the options page automatically so you can configure all three subsystems.

---

## 1. CDP Relay (browser automation)

Click the toolbar icon. The extension:

- Calls `chrome.debugger.attach({tabId})`
- Connects to `ws://127.0.0.1:<port>/extension`
- Forwards every CDP command from OpenClawd → Chrome and every CDP event from Chrome → OpenClawd
- Routes child-target sessions correctly (popups, prerenders, OOPIFs)

**Badge legend** (matches the lobster palette):

| Badge          | Meaning                                                     |
| -------------- | ----------------------------------------------------------- |
| 🟢 `ON`        | Tab is attached and bridged                                 |
| 🟠 `…`         | Connecting to the local relay                               |
| 🔴 `!`         | Relay not reachable — start it, then click the icon again   |
| 🟣 `SIG`       | Wallet just signed a transaction (transient flash)          |

Change the relay port in **Options → 1. CDP Relay** if your OpenClawd profile uses something other than `18792`.

---

## 2. OpenClawd Gateway client

The extension talks to the OpenClawd Gateway HTTP API (the `gateway/` package — `@openclawdsolana/gateway`) for live market data:

- **Right-click any selected text** that looks like a Solana address → **"Look up in OpenClawd"** → notification shows price, mcap, 24h delta.
- The wallet card's **Check balance** button fans out to `/api/wallet/portfolio` and prints net worth + token count.
- Default base URL: `http://127.0.0.1:8788`. For prod set it to `https://gateway.solanaclawd.com`.

Endpoints the extension uses:

| Method | Path                                     | When                            |
| ------ | ---------------------------------------- | ------------------------------- |
| GET    | `/health`                                | Options page **Test** button    |
| GET    | `/api/token/overview?address=<mint>`     | Right-click lookup              |
| GET    | `/api/wallet/portfolio?address=<wallet>` | Wallet **Check balance** button |
| POST   | `/api/wallet/submit`                     | Forward signed transaction      |
| POST   | `/api/wallet/swap/build`                 | Build a swap to sign locally    |

If the gateway returns an unexpected payload shape, the extension is forgiving — it handles both the raw `data` envelope and the unwrapped form.

---

## 3. Solana Agent Wallet

A real Solana keypair that lives **inside the extension**, not in any external wallet provider.

### Cryptography

- **Ed25519** — generated via `crypto.subtle.generateKey({name:'Ed25519'})`. Requires Chrome 130+ (or any Chromium browser with native WebCrypto Ed25519).
- **At-rest encryption** — AES-GCM with a 256-bit key derived from your passphrase via PBKDF2-SHA-256, **310,000 iterations**, fresh 16-byte salt + 12-byte IV per write.
- **Auto-lock** — decrypted secret is held in service-worker memory only; auto-cleared after **15 minutes** of inactivity.
- **Storage** — `chrome.storage.local` under key `wallet:keystore` (extension-isolated, never synced).

### Flows

| Action            | What happens                                                                          |
| ----------------- | ------------------------------------------------------------------------------------- |
| **Create**        | Generates a fresh Ed25519 keypair, encrypts with passphrase, stores keystore record   |
| **Import**        | Accepts a 64-byte base58 Solana secret (Phantom export format), encrypts, stores      |
| **Unlock**        | Decrypts with passphrase, holds secret in memory until auto-lock                      |
| **Sign**          | `Wallet.signSolanaMessage(base58)` → returns base58 signature ready to embed in a tx  |
| **Reveal secret** | Re-prompts passphrase, displays base58 secret in a danger-styled box                  |
| **Erase**         | Confirms, clears keystore from `chrome.storage.local`                                 |

### Programmatic access

Other extension code (or a content script you add later) can talk to the wallet via `chrome.runtime.sendMessage`:

```javascript
// Get current wallet status
chrome.runtime.sendMessage({ kind: 'wallet', op: 'status', args: [] }, (resp) => {
  console.log(resp.result); // { exists, pubkey, unlocked, createdAt }
});

// Sign a serialized Solana transaction message (base58-encoded bytes)
chrome.runtime.sendMessage(
  { kind: 'wallet', op: 'signSolanaMessage', args: [serializedMessageBase58] },
  (resp) => console.log(resp.result), // { signature, pubkey }
);

// Look up a token through the gateway
chrome.runtime.sendMessage(
  { kind: 'gateway', op: 'tokenOverview', args: ['So11111111111111111111111111111111111111112'] },
  (resp) => console.log(resp.result),
);
```

The full handler set is in [`background.js`](./background.js); wallet ops are defined in [`solana-wallet.js`](./solana-wallet.js); gateway ops in [`gateway-client.js`](./gateway-client.js).

### Sign-and-submit pattern

The extension intentionally does **not** ship `@solana/web3.js` — bundling it would balloon the package size and pull in a build step. Instead, the gateway constructs the transaction (e.g. via Jupiter), serializes the message, hands it back, the extension signs the bytes, and the gateway forwards the signed transaction to RPC:

```text
[Web page / OpenClawd agent]
        │  initiate swap (from wallet pubkey, mints, amount)
        ▼
[Gateway POST /api/wallet/swap/build]
        │  returns { messageBase58, blockhash, ... }
        ▼
[Extension Wallet.signSolanaMessage(messageBase58)]
        │  returns { signature, pubkey }
        ▼
[Gateway POST /api/wallet/submit]
        │  packages signature into the tx, sends via Helius RPC
        ▼
[Tx signature]
```

This keeps the extension small, the secret strictly in-extension, and the heavy Solana dependencies in a single canonical place (the gateway).

---

## Security notes

- The private key **never leaves the extension** unless you explicitly click **Reveal secret** (which forces a passphrase re-prompt).
- The passphrase is held in memory only during the encrypt/decrypt window — there's no `keepUnlocked` global.
- 310,000 PBKDF2 iterations matches OWASP 2024 guidance.
- The CDP relay is bound to `127.0.0.1` only — `host_permissions` does not include public hosts for the relay path.
- If you use a remote Gateway URL, prefer HTTPS (`https://gateway.solanaclawd.com`).
- Secret is rendered with `style="word-break: break-all"` and a danger-colored box so it doesn't accidentally end up in a screenshot tab thumbnail.

---

## Files

```text
openclawd-chrome-extension/
├── manifest.json          # MV3, v0.2.0, OpenClawd-branded
├── background.js          # Service worker — CDP relay + wallet/gateway router + context menu
├── solana-wallet.js       # Ed25519 + base58 + AES-GCM keystore (no deps)
├── gateway-client.js      # HTTP client for @openclawdsolana/gateway
├── options.html           # Three-card config UI (Relay · Gateway · Wallet)
├── options.js             # Wires the cards via chrome.runtime.sendMessage
├── icons/                 # Lobster pack (16, 32, 48, 128 px)
└── README.md              # This file
```

---

## License

MIT — © OpenClawd contributors · `8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump`
