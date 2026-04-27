#!/usr/bin/env node

import { constants as fsConstants } from 'node:fs';
import { access } from 'node:fs/promises';
import { homedir, platform } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';

import { installOpenClawd } from './install.mjs';

const homeBinDir = join(homedir(), '.openclawdsolana', 'bin');
const isWin = platform() === 'win32';
const STABLE_BINARIES = [
  join(homeBinDir, isWin ? 'openclawd.exe' : 'openclawd'),
  join(homeBinDir, isWin ? 'openclawdsolana.exe' : 'openclawdsolana'),
  join(homeBinDir, isWin ? 'clawd.exe' : 'clawd'),
];

function splitArgs(argv) {
  if (argv.length === 0) {
    return { mode: 'run', forwarded: [] };
  }

  const [first, ...rest] = argv;
  if (first === 'install' || first === '--install' || first === 'setup') {
    return { mode: 'install', forwarded: rest };
  }

  return { mode: 'run', forwarded: argv };
}

async function fileExists(pathname) {
  try {
    await access(pathname, fsConstants.X_OK);
    return true;
  } catch {
    return false;
  }
}

async function ensureBinary() {
  if (isWin) {
    console.error('OpenClawd does not currently ship a Windows CLI bootstrap. Use WSL, macOS, or Linux.');
    process.exit(1);
  }

  for (const candidate of STABLE_BINARIES) {
    if (await fileExists(candidate)) {
      return candidate;
    }
  }

  console.log('OpenClawd is not installed yet. Bootstrapping now...\n');
  await installOpenClawd([]);

  for (const candidate of STABLE_BINARIES) {
    if (await fileExists(candidate)) {
      return candidate;
    }
  }

  console.error(`Expected OpenClawd binary at ${STABLE_BINARIES[0]}, but installation did not produce it.`);
  process.exit(1);
}

function execBinary(binaryPath, args) {
  const child = spawn(binaryPath, args, {
    stdio: 'inherit',
    env: process.env,
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 0);
  });

  child.on('error', (err) => {
    console.error(`Failed to start OpenClawd: ${err.message}`);
    process.exit(1);
  });
}

async function main() {
  const { mode, forwarded } = splitArgs(process.argv.slice(2));

  if (mode === 'install') {
    await installOpenClawd(forwarded);
    return;
  }

  const binaryPath = await ensureBinary();
  execBinary(binaryPath, forwarded);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
