import { reqEnv } from './env.js';

export async function getBalance(wallet: string): Promise<number> {
  const url = reqEnv('HELIUS_RPC_URL');
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getBalance', params: [wallet] }),
  });
  const j: any = await r.json();
  return (j?.result?.value ?? 0) / 1e9;
}

export async function walletAssets(wallet: string): Promise<any> {
  const url = reqEnv('HELIUS_RPC_URL');
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getAssetsByOwner',
      params: { ownerAddress: wallet, page: 1, limit: 50 },
    }),
  });
  const j: any = await r.json();
  return j?.result || {};
}
