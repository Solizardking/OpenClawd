#!/usr/bin/env node
import { appendFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const READ_COMMANDS = new Set(['info', 'asic', 'stats', 'dashboard', 'scoreboard', 'wifi', 'logs', 'snapshot']);
const MUTATING_COMMANDS = new Set(['identify', 'pause', 'resume', 'restart', 'settings']);

function usage(exitCode = 0) {
  console.log(`OpenClawd Bitaxe / AxeOS connector

Usage:
  BITAXE_URL=http://<ip-or-host> node scripts/bitaxe.mjs <command> [options]

Read commands:
  info          GET /api/system/info
  asic          GET /api/system/asic
  stats         GET /api/system/statistics
  dashboard     GET /api/system/statistics/dashboard
  scoreboard    GET /api/system/scoreboard
  wifi          GET /api/system/wifi/scan
  logs          GET /api/system/logs
  snapshot      info + asic + dashboard, also writes OpenClawd memory

Mutating commands, require --yes:
  identify      POST /api/system/identify
  pause         POST /api/system/pause
  resume        POST /api/system/resume
  restart       POST /api/system/restart
  settings      PATCH /api/system --json '{"fanspeed":"80"}'

Options:
  --url <url>       Overrides BITAXE_URL / OPENCLAWD_BITAXE_URL
  --json <json>     JSON body for settings
  --yes             Required for mutating commands
  --remember        Write read result to OpenClawd memory JSONL
  --memory-url URL  POST note to OpenClawd memory service
`);
  process.exit(exitCode);
}

const args = process.argv.slice(2);
if (args.length === 0 || args.includes('--help') || args.includes('-h')) usage(0);

const command = args[0];
const options = parseOptions(args.slice(1));

if (!READ_COMMANDS.has(command) && !MUTATING_COMMANDS.has(command)) {
  console.error(`Unknown command: ${command}`);
  usage(1);
}

if (MUTATING_COMMANDS.has(command) && !options.yes) {
  console.error(`Refusing to run '${command}' without --yes.`);
  process.exit(2);
}

const baseUrl = normalizeBaseUrl(options.url || process.env.BITAXE_URL || process.env.OPENCLAWD_BITAXE_URL);

try {
  const result = await run(command, baseUrl, options);
  if (typeof result === 'string') {
    console.log(result);
  } else {
    console.log(JSON.stringify(result, null, 2));
  }
  if (command === 'snapshot' || options.remember) {
    await remember(command, baseUrl, result, options.memoryUrl);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

async function run(command, baseUrl, options) {
  switch (command) {
    case 'info':
      return requestJson(baseUrl, 'GET', '/api/system/info');
    case 'asic':
      return requestJson(baseUrl, 'GET', '/api/system/asic');
    case 'stats':
      return requestJson(baseUrl, 'GET', '/api/system/statistics');
    case 'dashboard':
      return requestJson(baseUrl, 'GET', '/api/system/statistics/dashboard');
    case 'scoreboard':
      return requestJson(baseUrl, 'GET', '/api/system/scoreboard');
    case 'wifi':
      return requestJson(baseUrl, 'GET', '/api/system/wifi/scan');
    case 'logs':
      return requestText(baseUrl, 'GET', '/api/system/logs');
    case 'identify':
      return requestJson(baseUrl, 'POST', '/api/system/identify');
    case 'pause':
      return requestJson(baseUrl, 'POST', '/api/system/pause');
    case 'resume':
      return requestJson(baseUrl, 'POST', '/api/system/resume');
    case 'restart':
      return requestJson(baseUrl, 'POST', '/api/system/restart');
    case 'settings': {
      const body = parseJsonBody(options.json);
      return requestJson(baseUrl, 'PATCH', '/api/system', body);
    }
    case 'snapshot': {
      const [info, asic, dashboard] = await Promise.all([
        requestJson(baseUrl, 'GET', '/api/system/info'),
        requestJson(baseUrl, 'GET', '/api/system/asic'),
        requestJson(baseUrl, 'GET', '/api/system/statistics/dashboard'),
      ]);
      return { baseUrl, capturedAt: new Date().toISOString(), info, asic, dashboard };
    }
  }
}

async function requestJson(baseUrl, method, path, body) {
  const text = await requestText(baseUrl, method, path, body);
  return text.trim() ? JSON.parse(text) : {};
}

async function requestText(baseUrl, method, path, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Number(process.env.BITAXE_TIMEOUT_MS || 5000));
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      signal: controller.signal,
      headers: body === undefined ? undefined : { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`AxeOS ${method} ${path} failed with ${response.status}: ${text.slice(0, 300)}`);
    }
    return text;
  } finally {
    clearTimeout(timer);
  }
}

async function remember(command, baseUrl, result, memoryUrl) {
  const note = {
    title: `Bitaxe ${command} ${new URL(baseUrl).host}`,
    body: [
      `# Bitaxe ${command}`,
      '',
      `Device: ${baseUrl}`,
      `Captured: ${new Date().toISOString()}`,
      '',
      '[[Bitaxe Hardware]] [[OpenClawd Hardware]]',
      '',
      '```json',
      JSON.stringify(result, null, 2),
      '```',
    ].join('\n'),
    tags: ['openclawd', 'hardware', 'bitaxe', 'bitcoin-miner', command],
    source: 'system',
    metadata: { command, baseUrl },
  };

  if (memoryUrl) {
    const posted = await postMemory(memoryUrl, note);
    if (posted) return;
  }

  const file = resolve(ROOT, '.openclawd-memory', 'notes.jsonl');
  await mkdir(dirname(file), { recursive: true });
  const now = new Date().toISOString();
  await appendFile(file, JSON.stringify({
    id: `local-bitaxe-${Date.now()}`,
    slug: note.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    links: ['Bitaxe Hardware', 'OpenClawd Hardware'],
    backlinks: [],
    created_at: now,
    updated_at: now,
    ...note,
  }) + '\n');
}

async function postMemory(memoryUrl, note) {
  const base = normalizeBaseUrl(memoryUrl);
  for (const path of ['/v1/openclawd/memory/notes', '/api/v1/memory/notes']) {
    try {
      const response = await fetch(`${base}${path}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(note),
      });
      if (response.ok) return true;
    } catch {
      // Fall through to local memory.
    }
  }
  return false;
}

function parseOptions(input) {
  const out = { yes: false, remember: false, url: undefined, json: undefined, memoryUrl: process.env.OPENCLAWD_MEMORY_URL };
  for (let i = 0; i < input.length; i += 1) {
    const item = input[i];
    if (item === '--yes') out.yes = true;
    else if (item === '--remember') out.remember = true;
    else if (item === '--url') out.url = input[++i];
    else if (item === '--json') out.json = input[++i];
    else if (item === '--memory-url') out.memoryUrl = input[++i];
    else throw new Error(`Unknown option: ${item}`);
  }
  return out;
}

function parseJsonBody(value) {
  if (!value) throw new Error("settings requires --json '{...}'");
  const parsed = JSON.parse(value);
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('settings JSON must be an object');
  }
  return parsed;
}

function normalizeBaseUrl(value) {
  if (!value?.trim()) {
    throw new Error('Missing Bitaxe URL. Set BITAXE_URL=http://<ip> or pass --url http://<ip>.');
  }
  const withProtocol = /^https?:\/\//i.test(value) ? value : `http://${value}`;
  return withProtocol.replace(/\/+$/, '');
}

