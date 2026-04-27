/**
 * POST /api/attestation/verify
 *
 * Body: { identifier: string }
 *
 * Looks up the plugin by identifier in the public index, then:
 *   1. Validates its attestation block against the SDK schema (offchain)
 *   2. If an attestation_pda is present, asks the configured Solana RPC to
 *      confirm the account exists under the SAS program
 *
 * Returns:
 *   { status: "verify-ok",   plugin, attestation, onchain? }
 *   { status: "verify-fail", reason }
 *   { status: "unattested" }
 */
import {
  attestedPluginExtensionSchema,
  verifyAttestationOffchain,
} from '@openclawdsolana/plugin-sdk';

export const config = { runtime: 'edge' };

const SAS_PROGRAM_ID = '22zoJMtdu4tQc2PzL74ZUT7FrwgB1Udec8DdW4yw4BdG';
const DEFAULT_RPC = 'https://api.mainnet-beta.solana.com';

interface IndexEntry {
  identifier: string;
  attestation?: unknown;
  capabilities?: unknown;
  registry?: unknown;
}

async function loadPlugin(identifier: string, indexUrl: string): Promise<IndexEntry | null> {
  const res = await fetch(indexUrl, { headers: { Accept: 'application/json' } });
  if (!res.ok) return null;
  const data = (await res.json()) as { plugins?: IndexEntry[] };
  return data.plugins?.find((p) => p.identifier === identifier) ?? null;
}

async function checkOnchain(
  pda: string,
  rpcUrl: string,
): Promise<{ exists: boolean; owner?: string; reason?: string }> {
  const res = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getAccountInfo',
      params: [pda, { encoding: 'base64' }],
    }),
  });
  if (!res.ok) return { exists: false, reason: `rpc ${res.status}` };
  const json = (await res.json()) as {
    result?: { value?: { owner?: string } | null };
    error?: { message?: string };
  };
  if (json.error) return { exists: false, reason: json.error.message };
  const value = json.result?.value;
  if (!value) return { exists: false, reason: 'pda not found' };
  return { exists: true, owner: value.owner };
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const url = new URL(req.url);
    const indexUrl =
      url.searchParams.get('index') ?? 'https://plugin.delivery/index.json';
    const rpcUrl = url.searchParams.get('rpc') ?? DEFAULT_RPC;

    const body = (await req.json()) as { identifier?: string };
    const identifier = body?.identifier;
    if (!identifier) {
      return new Response(
        JSON.stringify({ error: 'identifier is required in body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const plugin = await loadPlugin(identifier, indexUrl);
    if (!plugin) {
      return new Response(
        JSON.stringify({ status: 'verify-fail', reason: 'plugin not in index' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const off = verifyAttestationOffchain(plugin);
    if (off.status !== 'verify-ok') {
      return new Response(JSON.stringify({ ...off, plugin: { identifier } }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (off.attestation.program_id !== SAS_PROGRAM_ID) {
      return new Response(
        JSON.stringify({
          status: 'verify-fail',
          reason: `program_id mismatch: expected ${SAS_PROGRAM_ID}, got ${off.attestation.program_id}`,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const ext = attestedPluginExtensionSchema.parse(plugin);
    let onchain: Awaited<ReturnType<typeof checkOnchain>> | null = null;
    if (off.attestation.attestation_pda) {
      onchain = await checkOnchain(off.attestation.attestation_pda, rpcUrl);
      if (onchain.exists && onchain.owner !== SAS_PROGRAM_ID) {
        return new Response(
          JSON.stringify({
            status: 'verify-fail',
            reason: `attestation_pda owner ${onchain.owner} != SAS program ${SAS_PROGRAM_ID}`,
            onchain,
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }
    }

    return new Response(
      JSON.stringify({
        status: 'verify-ok',
        plugin: { identifier },
        attestation: off.attestation,
        capabilities: ext.capabilities ?? null,
        registry: ext.registry ?? null,
        onchain,
      }),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'verify error';
    return new Response(JSON.stringify({ status: 'verify-fail', reason: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
