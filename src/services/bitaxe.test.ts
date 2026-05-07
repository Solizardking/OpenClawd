import * as assert from 'node:assert/strict';
import { test } from 'node:test';

import { BitaxeClient } from './bitaxe.js';

test('BitaxeClient snapshot calls AxeOS info, asic, and dashboard endpoints', async () => {
  const calls: string[] = [];
  const client = new BitaxeClient({
    baseUrl: 'http://bitaxe.local/',
    fetchImpl: (async (input: RequestInfo | URL) => {
      const url = String(input);
      calls.push(url.replace('http://bitaxe.local', ''));
      return new Response(JSON.stringify({ ok: true, url }), { status: 200 });
    }) as unknown as typeof fetch,
  });

  const snapshot = await client.snapshot();

  assert.equal(snapshot.baseUrl, 'http://bitaxe.local');
  assert.deepEqual(calls.sort(), [
    '/api/system/asic',
    '/api/system/info',
    '/api/system/statistics/dashboard',
  ]);
});

test('BitaxeClient normalizes host without protocol', async () => {
  const client = new BitaxeClient({
    baseUrl: '192.168.1.42',
    fetchImpl: (async () => new Response('{}', { status: 200 })) as unknown as typeof fetch,
  });

  assert.equal(client.baseUrl, 'http://192.168.1.42');
});
