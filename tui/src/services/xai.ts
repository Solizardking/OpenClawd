import { optEnv, reqEnv } from './env.js';

const BASE = 'https://api.x.ai/v1';

export async function xaiChat(prompt: string, model = optEnv('GROK_MODEL', 'grok-4-1-fast')): Promise<string> {
  const apiKey = reqEnv('XAI_API_KEY');
  const r = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      stream: false,
    }),
  });
  if (!r.ok) throw new Error(`xAI ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const j: any = await r.json();
  return j?.choices?.[0]?.message?.content ?? '';
}

export async function xaiSearch(query: string, mode: 'x' | 'web' = 'web'): Promise<string> {
  const apiKey = reqEnv('XAI_API_KEY');
  const r = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'grok-4-1-fast',
      messages: [{ role: 'user', content: query }],
      search_parameters: { mode: 'auto', sources: [{ type: mode }] },
    }),
  });
  if (!r.ok) throw new Error(`xAI search ${r.status}: ${(await r.text()).slice(0, 200)}`);
  const j: any = await r.json();
  return j?.choices?.[0]?.message?.content ?? '';
}
