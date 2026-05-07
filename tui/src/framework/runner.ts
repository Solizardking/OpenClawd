/**
 * Spawns the openclawd-framework CLI as a subprocess and streams stdout
 * back to the TUI line-by-line.
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

function findFrameworkCli(): string | null {
  const candidates = [
    path.resolve(process.cwd(), '../openclawd-framework/dist/index.js'),
    path.resolve(process.cwd(), '../openclawd-framework/src/index.ts'),
    path.resolve(process.cwd(), 'openclawd-framework/dist/index.js'),
    path.resolve(process.cwd(), 'openclawd-framework/src/index.ts'),
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

export interface RunHandle {
  kill: () => void;
  done: Promise<number>;
}

export function runFramework(args: string[], onLine: (line: string) => void): RunHandle {
  const cli = findFrameworkCli();
  if (!cli) {
    onLine('🪨 openclawd-framework not found in this checkout.');
    return { kill: () => {}, done: Promise.resolve(127) };
  }
  const isTs = cli.endsWith('.ts');
  const cmd = isTs ? 'npx' : 'node';
  const cmdArgs = isTs ? ['tsx', cli, ...args] : [cli, ...args];
  const child = spawn(cmd, cmdArgs, { stdio: ['ignore', 'pipe', 'pipe'] });

  const flush = (buf: string) => buf.split('\n').filter(Boolean).forEach(onLine);
  let outBuf = '';
  let errBuf = '';
  child.stdout.on('data', (c) => { outBuf += c.toString(); const lines = outBuf.split('\n'); outBuf = lines.pop() || ''; lines.forEach(onLine); });
  child.stderr.on('data', (c) => { errBuf += c.toString(); const lines = errBuf.split('\n'); errBuf = lines.pop() || ''; lines.forEach((l) => onLine(`⚠️  ${l}`)); });

  const done = new Promise<number>((resolve) => {
    child.on('exit', (code) => {
      if (outBuf) flush(outBuf);
      if (errBuf) flush(errBuf);
      resolve(code ?? 0);
    });
  });

  return { kill: () => { try { child.kill('SIGINT'); } catch {} }, done };
}
