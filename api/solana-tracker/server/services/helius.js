const fetch = require('node-fetch');

const API_KEY = process.env.HELIUS_API_KEY;
const RPC_URL = process.env.HELIUS_RPC_URL;
const WALLET_API_BASE = 'https://api.helius.xyz';

class HeliusService {
  // ─── Wallet API Endpoints ─────────────────────────────────

  async getIdentity(address) {
    const url = `${WALLET_API_BASE}/v1/wallet/${address}/identity?api-key=${API_KEY}`;
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

    const url = `${WALLET_API_BASE}/v1/wallet/${address}/balances?${params}`;
    const res = await fetch(url);
    if (!res.ok) throw await this._error(res);
    return res.json();
  }

  async getHistory(address, opts = {}) {
    const params = new URLSearchParams({ 'api-key': API_KEY });
    if (opts.before) params.set('before', opts.before);
    if (opts.limit) params.set('limit', opts.limit);

    const url = `${WALLET_API_BASE}/v1/wallet/${address}/history?${params}`;
    const res = await fetch(url);
    if (!res.ok) throw await this._error(res);
    return res.json();
  }

  async getTransfers(address, opts = {}) {
    const params = new URLSearchParams({ 'api-key': API_KEY });
    if (opts.before) params.set('before', opts.before);
    if (opts.limit) params.set('limit', opts.limit);

    const url = `${WALLET_API_BASE}/v1/wallet/${address}/transfers?${params}`;
    const res = await fetch(url);
    if (!res.ok) throw await this._error(res);
    return res.json();
  }

  async getFundedBy(address) {
    const url = `${WALLET_API_BASE}/v1/wallet/${address}/funded-by?api-key=${API_KEY}`;
    const res = await fetch(url);
    if (res.status === 404) return null;
    if (!res.ok) throw await this._error(res);
    return res.json();
  }

  // ─── DAS API (via RPC) ───────────────────────────────────

  async dasGetAssetsByOwner(owner, opts = {}) {
    return this._rpc('getAssetsByOwner', {
      ownerAddress: owner,
      page: opts.page || 1,
      limit: opts.limit || 50,
      displayOptions: { showFungible: true, showNativeBalance: true }
    });
  }

  async dasGetAsset(id) {
    return this._rpc('getAsset', { id });
  }

  async dasSearchAssets(params) {
    return this._rpc('searchAssets', params);
  }

  async dasGetTokenAccounts(owner) {
    return this._rpc('getTokenAccounts', {
      owner,
      options: { showZeroBalance: false }
    });
  }

  // ─── Standard RPC ────────────────────────────────────────

  async getBalance(address) {
    return this._rpc('getBalance', [address], true);
  }

  async getAccountInfo(address) {
    return this._rpc('getAccountInfo', [address, { encoding: 'jsonParsed' }], true);
  }

  async getSignaturesForAddress(address, opts = {}) {
    const params = [address, {}];
    if (opts.limit) params[1].limit = opts.limit;
    if (opts.before) params[1].before = opts.before;
    return this._rpc('getSignaturesForAddress', params, true);
  }

  async getTransaction(signature) {
    return this._rpc('getTransaction', [signature, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }], true);
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
