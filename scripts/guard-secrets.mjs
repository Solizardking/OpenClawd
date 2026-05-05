#!/usr/bin/env node
/**
 * Guard secrets - scan for leaked credentials
 * Run with --staged or --worktree
 */

import { execSync } from 'child_process';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname, relative } from 'path';
import { fileURLToPath } from 'url';
import { parseArgs } from 'util';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = join(__dirname, '..');

// Known-safe patterns (excluded from scanning)
const SAFE_PATTERNS = [
  /^11111111111111111111111111111111$/, // Solana System Program address
  /^11111111111111111111111111111112$/, // Solana placeholder address (System Program + 1), common test fixture
  /^AKIAIOSFODNN7EXAMPLE$/, // AWS example access key
  /^c8a8aaeb7ef3fbcce40bada2196e2bcb$/, // Known example hash
  /^0bc83cb571cd1c50ba6f3e8a78ef1346$/, // Gravatar example hash (MD5)
  /^2f5db575118d15ec19000e13282201bc$/, // Public Cloudflare Account ID (not a credential)
];

// Secret patterns to detect
const SECRET_PATTERNS = [
  { pattern: /sk-[a-zA-Z0-9]{20,}/, name: 'OpenAI/HeyAPI key', exclude: ['scripts/', 'node_modules/'] },
  { pattern: /sk-proj-[a-zA-Z0-9_-]{20,}/, name: 'OpenAI project key', exclude: ['scripts/', 'node_modules/'] },
  { pattern: /sk-or-v1-[a-zA-Z0-9_-]{20,}/, name: 'OpenRouter key', exclude: ['scripts/', 'node_modules/'] },
  { pattern: /xai-[a-zA-Z0-9_-]{20,}/, name: 'xAI API key', exclude: ['scripts/', 'node_modules/'] },
  { pattern: /[a-zA-Z0-9_-]{32,}\.(api|secret|key)[a-zA-Z0-9_-]*['"`,]/i, name: 'Generic API key', exclude: ['scripts/', 'node_modules/'] },
  { pattern: /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/, name: 'Private key block', exclude: ['scripts/', 'node_modules/'] },
  { pattern: /xox[baprs]-[a-zA-Z0-9]{10,}/, name: 'Slack token', exclude: ['scripts/', 'node_modules/'] },
  { pattern: /ghp_[a-zA-Z0-9]{36}/, name: 'GitHub token', exclude: ['scripts/', 'node_modules/'] },
  { pattern: /AKIA[0-9A-Z]{16}/, name: 'AWS access key', exclude: ['scripts/', 'node_modules/'], safeIf: ['EXAMPLE'] },
  { pattern: /["'`][0-9a-f]{32}["'`]/, name: 'Generic hex secret', exclude: ['scripts/', 'node_modules/'] },
];

// File extensions to scan
const SCAN_EXTENSIONS = ['.js', '.ts', '.json', '.md', '.sh', '.yaml', '.yml', '.env', '.txt'];

// Files to skip
const SKIP_FILES = [
  'guard-secrets.mjs',
  'package.json',
  '.gitignore',
  'node_modules',
];

function isSafeMatch(match) {
  const value = match.replace(/["'`]/g, '');
  return SAFE_PATTERNS.some(safe => safe.test(value));
}

function scanFile(filePath, content) {
  const issues = [];
  const relativePath = relative(rootDir, filePath);
  
  for (const { pattern, name, exclude } of SECRET_PATTERNS) {
    // Check exclusions
    if (exclude.some(prefix => relativePath.startsWith(prefix))) {
      continue;
    }
    
    const matches = content.match(new RegExp(pattern, 'g'));
    if (matches) {
      for (const match of matches) {
        // Skip safe patterns
        if (isSafeMatch(match)) continue;
        
        issues.push({
          type: name,
          snippet: match.substring(0, 50) + (match.length > 50 ? '...' : ''),
          path: relativePath,
        });
      }
    }
  }
  
  return issues;
}

function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only', { cwd: rootDir, encoding: 'utf8' });
    return output.trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

function getAllFiles() {
  try {
    const output = execSync('git ls-files --cached --others --exclude-standard', {
      cwd: rootDir,
      encoding: 'utf8',
    });
    return output
      .trim()
      .split('\n')
      .filter(Boolean)
      .filter(file => SCAN_EXTENSIONS.includes(extname(file).toLowerCase()))
      .filter(file => !SKIP_FILES.some(skip => file === skip || file.includes(`/${skip}/`)))
      .map(file => join(rootDir, file));
  } catch {
    return [];
  }
}

async function main() {
  const { values } = parseArgs({
    options: {
      staged: { type: 'boolean', short: 's' },
      worktree: { type: 'boolean', short: 'w' },
    },
  });
  
  const mode = values.staged ? 'staged' : 'worktree';
  console.log(`🔍 Scanning ${mode} for secrets...\n`);
  
  const files = values.staged ? getStagedFiles().map(f => join(rootDir, f)) : getAllFiles();
  const allIssues = [];
  
  for (const filePath of files) {
    try {
      // Skip binary or very large files
      const stat = statSync(filePath);
      if (stat.size > 1024 * 1024) continue; // Skip > 1MB
      
      const content = readFileSync(filePath, 'utf8');
      const issues = scanFile(filePath, content);
      allIssues.push(...issues);
    } catch {
      // Skip unreadable files
    }
  }
  
  if (allIssues.length > 0) {
    console.log('❌ Secrets detected:');
    for (const issue of allIssues) {
      console.log(`  • ${issue.type} in ${issue.path}`);
      console.log(`    Found: ${issue.snippet}`);
    }
    console.log(`\n${allIssues.length} issue(s) found`);
    process.exit(1);
  } else {
    console.log(`✅ No secrets detected (scanned ${files.length} file(s))`);
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(0); // Don't block on errors
});
