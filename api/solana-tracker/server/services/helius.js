const fetch = require('node-fetch');

const API_KEY = process.env.HELIUS_API_KEY;
const WALLET_API_BASE = 'https://api.helius.xyz';
const SOLANA_ADDRESS_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const SIGNATURE_RE = /^[1-9A-HJ-NP-Za-km-z]{64,96}$/;
const HELIUS_RPC_HOSTS = new Set(['mainnet.helius-rpc.com', 'devnet.helius-rpc.com']);

function assertSolanaAddress(value) {
  if (typeof value !== 'string' || !SOLANA_ADDRESS_RE.test(value)) {
    throw new Error('Invalid Solana address');
  }
  return value;
}

function assertSignature(value) {
  if (typeof value !== 'string' || !SIGNATURE_RE.test(value)) {
    throw new Error('Invalid transaction signature');
  }
  return value;
}

function safeRpcUrl(value) {
  const fallback = API_KEY
    ? `https://mainnet.helius-rpc.com/?api-key=${encodeURIComponent(API_KEY)}`
    : 'https://mainnet.helius-rpc.com';
  const url = new URL(value || fallback);
  if (url.protocol !== 'https:' || !HELIUS_RPC_HOSTS.has(url.hostname)) {
    throw new Error('HELIUS_RPC_URL must point to an approved Helius RPC host');
  }
  return url.toString();
}

const RPC_URL = safeRpcUrl(process.env.HELIUS_RPC_URL);

class HeliusService {
  // ─── Wallet API Endpoints ─────────────────────────────────

  async getIdentity(address) {
    const url = `${WALLET_API_BASE}/v1/wallet/${assertSolanaAddress(address)}/identity?api-key=${encodeURIComponent(API_KEY)}`;
    const res = await fetch(url);
    if (res.status === 404) return null;
    if (!res.ok) throw await this._error(res);
    return res.json();
  }

  async batchIdentity(addresses) {
    const url = `${WALLET_API_BASE}/v1/wallet/batch-identity?api-key=${API_KEY}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ addresses })
    });
    if (!res.ok) throw await this._error(res);
    return res.json();
  }

  async getBalances(address, opts = {}) {
    const params = new URLSearchParams({ 'api-key': API_KEY });
    if (opts.page) params.set('page', opts.page);
    if (opts.limit) params.set('limit', opts.limit);
    if (opts.showNfts) params.set('showNfts', 'true');
    if (opts.showZeroBalance) params.set('showZeroBalance', 'true');
    if (opts.showNative === false) params.set('showNative', 'false');

    const url = `${WALLET_API_BASE}/v1/wallet/${assertSolanaAddress(address)}/balances?${params}`;
    const res = await fetch(url);
    if (!res.ok) throw await this._error(res);
    return res.json();
  }

  async getHistory(address, opts = {}) {
    const params = new URLSearchParams({ 'api-key': API_KEY });
    if (opts.before) params.set('before', opts.before);
    if (opts.limit) params.set('limit', opts.limit);

    const url = `${WALLET_API_BASE}/v1/wallet/${assertSolanaAddress(address)}/history?${params}`;
    const res = await fetch(url);
    if (!res.ok) throw await this._error(res);
    return res.json();
  }

  async getTransfers(address, opts = {}) {
    const params = new URLSearchParams({ 'api-key': API_KEY });
    if (opts.before) params.set('before', opts.before);
    if (opts.limit) params.set('limit', opts.limit);

    const url = `${WALLET_API_BASE}/v1/wallet/${assertSolanaAddress(address)}/transfers?${params}`;
    const res = await fetch(url);
    if (!res.ok) throw await this._error(res);
    return res.json();
  }

  async getFundedBy(address) {
    const url = `${WALLET_API_BASE}/v1/wallet/${assertSolanaAddress(address)}/funded-by?api-key=${encodeURIComponent(API_KEY)}`;
    const res = await fetch(url);
    if (res.status === 404) return null;
    if (!res.ok) throw await this._error(res);
    return res.json();
  }

  // ─── DAS API (via RPC) ───────────────────────────────────

  async dasGetAssetsByOwner(owner, opts = {}) {
    return this._rpc('getAssetsByOwner', {
      ownerAddress: assertSolanaAddress(owner),
      page: opts.page || 1,
      limit: opts.limit || 50,
      displayOptions: { showFungible: true, showNativeBalance: true }
    });
  }

  async dasGetAsset(id) {
    return this._rpc('getAsset', { id: assertSolanaAddress(id) });
  }

  async dasSearchAssets(params) {
    return this._rpc('searchAssets', params);
  }

  async dasGetTokenAccounts(owner) {
    return this._rpc('getTokenAccounts', {
      owner: assertSolanaAddress(owner),
      options: { showZeroBalance: false }
    });
  }

  // ─── Standard RPC ────────────────────────────────────────

  async getBalance(address) {
    return this._rpc('getBalance', [assertSolanaAddress(address)], true);
  }

  async getAccountInfo(address) {
    return this._rpc('getAccountInfo', [assertSolanaAddress(address), { encoding: 'jsonParsed' }], true);
  }

  async getSignaturesForAddress(address, opts = {}) {
    const params = [assertSolanaAddress(address), {}];
    if (opts.limit) params[1].limit = opts.limit;
    if (opts.before) params[1].before = opts.before;
    return this._rpc('getSignaturesForAddress', params, true);
  }

  async getTransaction(signature) {
    return this._rpc('getTransaction', [assertSignature(signature), { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }], true);
  }

  // ─── Helpers ──────────────────────────────────────────────

  async _rpc(method, params, isStandard = false) {
    const body = {
      jsonrpc: '2.0',
      id: `req-${Date.now()}`,
      method,
      params: isStandard ? params : params
    };

    const res = await fetch(RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (!res.ok) throw new Error(`RPC HTTP ${res.status}`);
    const json = await res.json();
    if (json.error) throw new Error(json.error.message || JSON.stringify(json.error));
    return json.result;
  }

  async _error(res) {
    let msg;
    try { msg = (await res.json()).error || res.statusText; } catch { msg = res.statusText; }
    const err = new Error(msg);
    err.status = res.status;
    return err;
  }
}

module.exports = new HeliusService();
