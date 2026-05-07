const BASE = 'https://api.jup.ag';

export interface JupQuote {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  priceImpactPct: string;
  slippageBps: number;
}

export async function jupQuote(inputMint: string, outputMint: string, amountAtoms: string, slippageBps = 100): Promise<JupQuote> {
  const url = new URL(`${BASE}/swap/v1/quote`);
  url.searchParams.set('inputMint', inputMint);
  url.searchParams.set('outputMint', outputMint);
  url.searchParams.set('amount', amountAtoms);
  url.searchParams.set('slippageBps', String(slippageBps));
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Jupiter quote ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return r.json() as Promise<JupQuote>;
}

export async function jupPrice(mint: string): Promise<number | null> {
  const r = await fetch(`${BASE}/price/v3?ids=${mint}`);
  if (!r.ok) return null;
  const j: any = await r.json();
  return j?.data?.[mint]?.price ?? null;
}

export async function jupTrending(limit = 10): Promise<any[]> {
  // Jupiter Lite (toptrades) — proxy through hot tokens endpoint; fall back to empty.
  const r = await fetch(`${BASE}/tokens/v1/tagged/verified?limit=${limit}`);
  if (!r.ok) return [];
  const j: any = await r.json();
  return Array.isArray(j) ? j.slice(0, limit) : [];
}
