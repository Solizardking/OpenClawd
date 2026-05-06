import path from 'node:path';

/**
 * Utility helpers for resolving standard OpenClawd directories.
 *
 * All CLI-generated data should live under the hidden `.openclawd` folder
 * that sits in the project root (i.e. <project>/.openclawd/…).  By
 * centralising the path logic here we avoid the hard-coded scattered
 * variants that previously lived throughout the codebase.
 */

export function getOpenClawdBaseDir(cwd: string = process.cwd()): string {
  return path.join(cwd, '.openclawd');
}

export function getOpenClawdDbDir(cwd: string = process.cwd()): string {
  return path.join(getOpenClawdBaseDir(cwd), '.openclawddb');
}

export function getOpenClawdDataDir(cwd: string = process.cwd()): string {
  return path.join(getOpenClawdBaseDir(cwd), 'data');
}

export function getOpenClawdUploadsDir(cwd: string = process.cwd()): string {
  return path.join(getOpenClawdDataDir(cwd), 'uploads');
}

export function getOpenClawdGeneratedDir(cwd: string = process.cwd()): string {
  return path.join(getOpenClawdDataDir(cwd), 'generated');
}

export function getOpenClawdCharactersDir(cwd: string = process.cwd()): string {
  return path.join(getOpenClawdDataDir(cwd), 'characters');
}
