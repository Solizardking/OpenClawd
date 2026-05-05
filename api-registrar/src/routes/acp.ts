/**
 * ACP registry bridge.
 *
 * Exposes the local acp_registry/ directory over HTTP so other services
 * (api-registrar consumers, hub, mint-metaplex.mjs) can read the agent.json
 * and registry.json without filesystem coupling. Read-only — mutations
 * happen via the CLI generator (acp_registry/generate.mjs) and the Metaplex
 * mint script (acp_registry/mint-metaplex.mjs), both of which write back
 * into the same files this route serves.
 */

import { Hono } from 'hono';
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

const router = new Hono();

const ACP_DIR = process.env.ACP_REGISTRY_DIR
  ? resolve(process.env.ACP_REGISTRY_DIR)
  : resolve(process.cwd(), '..', 'acp_registry');

async function loadJson(file: string) {
  const path = join(ACP_DIR, file);
  const raw = await readFile(path, 'utf-8');
  return JSON.parse(raw);
}

router.get('/agent', async (c) => {
  try {
    const agent = await loadJson('agent.json');
    return c.json({
      ...agent,
      _source: 'acp_registry/agent.json',
      _metaplex_registered: Boolean(agent.registry?.metaplex?.core_asset_address),
    });
  } catch (err) {
    return c.json({ error: 'agent.json not found', dir: ACP_DIR }, 404);
  }
});

router.get('/registry', async (c) => {
  try {
    const registry = await loadJson('registry.json');
    return c.json(registry);
  } catch (err) {
    return c.json({ error: 'registry.json not found', dir: ACP_DIR }, 404);
  }
});

router.get('/metaplex', async (c) => {
  try {
    const agent = await loadJson('agent.json');
    const metaplex = agent.registry?.metaplex;
    if (!metaplex) {
      return c.json({
        registered: false,
        hint: 'Run `node acp_registry/mint-metaplex.mjs --uri <metadata-url>` to mint.',
      }, 404);
    }
    return c.json({
      registered: true,
      agent_name: agent.name,
      display_name: agent.display_name,
      ...metaplex,
    });
  } catch (err) {
    return c.json({ error: 'agent.json not found', dir: ACP_DIR }, 404);
  }
});

export default router;
