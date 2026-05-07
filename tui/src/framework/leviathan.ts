/**
 * Bridges the TUI to the @openclawd/leviathan framework.
 * Reads the framework's keystore + shell.db when available; never writes.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const HOME = os.homedir();
const SHELL_DIR = path.join(HOME, '.openclawd');
const KEYSTORE = path.join(SHELL_DIR, 'keystore.json');
const SHELL_MD = path.join(SHELL_DIR, 'SHELL.md');
const SHELL_DB = path.join(SHELL_DIR, 'shell.db');

export interface LeviathanState {
  exists: boolean;
  pubkey?: string;
  spawnedAt?: number;
  shellMd?: string;
  shellDbPath?: string;
}

export function readLeviathanState(): LeviathanState {
  if (!fs.existsSync(KEYSTORE)) return { exists: false };
  try {
    const ks = JSON.parse(fs.readFileSync(KEYSTORE, 'utf8'));
    const shellMd = fs.existsSync(SHELL_MD) ? fs.readFileSync(SHELL_MD, 'utf8') : undefined;
    return {
      exists: true,
      pubkey: ks.pubkey,
      spawnedAt: ks.spawnedAt,
      shellMd,
      shellDbPath: fs.existsSync(SHELL_DB) ? SHELL_DB : undefined,
    };
  } catch {
    return { exists: false };
  }
}

export function appendShell(line: string): boolean {
  if (!fs.existsSync(SHELL_MD)) return false;
  fs.appendFileSync(SHELL_MD, `\n${line}\n`);
  return true;
}

export function readShellMd(): string | null {
  if (!fs.existsSync(SHELL_MD)) return null;
  return fs.readFileSync(SHELL_MD, 'utf8');
}

export function readThreeLaws(): string {
  const candidates = [
    path.resolve(process.cwd(), '../openclawd-framework/scripts/three-laws.txt'),
    path.resolve(process.cwd(), '../../openclawd-framework/scripts/three-laws.txt'),
    path.resolve(process.cwd(), 'openclawd-framework/scripts/three-laws.txt'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return fs.readFileSync(p, 'utf8');
  }
  return 'three-laws.txt not found in this checkout.';
}

export { SHELL_DIR, KEYSTORE, SHELL_MD, SHELL_DB };
