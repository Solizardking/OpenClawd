// 🦞 OpenClawd Gateway client — thin HTTP wrapper around the gateway/
// service (Telegram + Birdeye/Helius control plane). Used by the
// extension so users can right-click any Solana address on a page and
// pull a card without leaving Chrome.
//
// The default base URL points at the local dev gateway. Override in the
// options page for staging / production deployments.

const DEFAULT_GATEWAY = 'http://127.0.0.1:8788';
const DEFAULT_TIMEOUT_MS = 8000;

export async function getGatewayBase() {
  const stored = await chrome.storage.local.get(['gatewayBase']);
  const raw = String(stored.gatewayBase || '').trim();
  if (!raw) return DEFAULT_GATEWAY;
  // Strip trailing slashes — paths are joined with leading slash.
  return raw.replace(/\/+$/, '');
}

async function gwFetch(path, init = {}) {
  const base = await getGatewayBase();
  const url = `${base}${path.startsWith('/') ? path : '/' + path}`;
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), init.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: init.method ?? 'GET',
      headers: {
        accept: 'application/json',
        ...(init.body ? { 'content-type': 'application/json' } : {}),
        ...(init.headers || {}),
      },
      body: init.body ? JSON.stringify(init.body) : undefined,
      signal: ctl.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Gateway ${res.status}: ${text.slice(0, 200)}`);
    }
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

export const Gateway = {
  // Health check — extension uses this to surface "gateway down" badge.
  async health() {
    return await gwFetch('/health');
  },

  // Token overview by mint address. The gateway proxies Birdeye + Helius
  // and returns a unified card payload. Used by the right-click menu.
  async tokenOverview(mintAddress) {
    return await gwFetch(`/api/token/overview?address=${encodeURIComponent(mintAddress)}`);
  },

  // Wallet portfolio summary by address. Same shape clawd-tui /portfolio uses.
  async walletPortfolio(walletAddress) {
    return await gwFetch(`/api/wallet/portfolio?address=${encodeURIComponent(walletAddress)}`);
  },

  // Submit a signed Solana transaction to the gateway, which forwards to
  // Helius RPC. Caller passes base58-encoded fully-signed transaction.
  // Returns { signature: <txSignature> }.
  async sendSignedTransaction(signedTxBase58) {
    return await gwFetch('/api/wallet/submit', {
      method: 'POST',
      body: { signed: signedTxBase58 },
    });
  },

  // Request a transaction template from the gateway (e.g. a Jupiter swap
  // quote serialized to a message). Caller signs the returned message and
  // resubmits via sendSignedTransaction.
  async buildSwap({ from, to, inputMint, outputMint, amountIn }) {
    return await gwFetch('/api/wallet/swap/build', {
      method: 'POST',
      body: { from, to, inputMint, outputMint, amountIn },
    });
  },
};
