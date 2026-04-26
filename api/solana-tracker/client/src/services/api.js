const BASE = process.env.REACT_APP_API_URL || '/api';

async function request(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
  const data = await res.json();
  if (!res.ok) throw { status: res.status, ...data };
  return data;
}

const api = {
  health: () => request('/health'),

  // Wallet API
  wallet: {
    identity: (addr) => request(`/wallet/${addr}/identity`),
    batchIdentity: (addrs) => request('/wallet/batch-identity', { method: 'POST', body: { addresses: addrs } }),
    balances: (addr, params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/wallet/${addr}/balances${qs ? '?' + qs : ''}`);
    },
    history: (addr, params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/wallet/${addr}/history${qs ? '?' + qs : ''}`);
    },
    transfers: (addr, params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/wallet/${addr}/transfers${qs ? '?' + qs : ''}`);
    },
    fundedBy: (addr) => request(`/wallet/${addr}/funded-by`),
  },

  // DAS API
  das: {
    assets: (owner, params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/das/assets/${owner}${qs ? '?' + qs : ''}`);
    },
    asset: (id) => request(`/das/asset/${id}`),
    tokenAccounts: (owner) => request(`/das/token-accounts/${owner}`),
    search: (body) => request('/das/search', { method: 'POST', body }),
  },

  // Tracking (composite)
  tracking: {
    profile: (addr) => request(`/tracking/${addr}/profile`),
    activity: (addr, params = {}) => {
      const qs = new URLSearchParams(params).toString();
      return request(`/tracking/${addr}/activity${qs ? '?' + qs : ''}`);
    },
    batchProfile: (addrs) => request('/tracking/batch-profile', { method: 'POST', body: { addresses: addrs } }),
  }
};

export default api;
