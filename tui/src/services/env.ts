import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

let loaded = false;

export function loadEnv() {
  if (loaded) return;
  // Try CWD first, then walk up to find an .env (the X/.env at the repo root level)
  const candidates = [
    path.join(process.cwd(), '.env'),
    path.resolve(process.cwd(), '../X/.env'),
    path.resolve(process.cwd(), '../.env'),
    path.resolve(process.cwd(), '../../.env'),
    path.resolve(process.cwd(), '../../X/.env'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      dotenv.config({ path: p });
      break;
    }
  }
  loaded = true;
}

export function reqEnv(key: string): string {
  loadEnv();
  const v = process.env[key];
  if (!v) throw new Error(`Missing env: ${key}`);
  return v;
}

export function optEnv(key: string, fallback = ''): string {
  loadEnv();
  return process.env[key] || fallback;
}
