#!/usr/bin/env node
/**
 * Brand check - catches old brand references in docs
 */

import { readdirSync, readFileSync, statSync } from 'fs';
import { join, extname, relative } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const rootDir = join(__dirname, '..');

// Old brands to replace (case-insensitive)
const OLD_BRANDS = [
  { pattern: /solanaos/gi, replacement: 'openclawd', reason: 'Use OpenClawd' },
  { pattern: /nanosolana/gi, replacement: 'openclawdsolana', reason: 'Use @openclawdsolana' },
  { pattern: /nanohub/gi, replacement: 'clawdhub', reason: 'Use ClawdHub' },
  { pattern: /solana-clawd/gi, replacement: 'openclawd', reason: 'Use OpenClawd' },
  { pattern: /clawd3d/gi, replacement: 'clawd3d', reason: 'Verify capitalization' },
];

// Docs files to check
const DOC_EXTENSIONS = ['.md', '.json', '.txt'];
const DOC_DIRECTORIES = ['docs', 'articles'];

function scanFile(filePath) {
  const issues = [];
  const relativePath = relative(rootDir, filePath);
  
  try {
    const stat = statSync(filePath);
    if (stat.size > 1024 * 1024) return issues;
    
    const content = readFileSync(filePath, 'utf8');
    
    for (const { pattern, replacement, reason } of OLD_BRANDS) {
      if (pattern.test(content)) {
        const matches = content.match(pattern);
        issues.push({
          type: 'brand',
          message: `${reason} (found "${matches[0]}")`,
          path: relativePath,
        });
      }
    }
  } catch {
    // Skip unreadable files
  }
  
  return issues;
}

function getDocFiles() {
  const files = [];
  
  function walk(dir) {
    try {
      const entries = readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name === 'node_modules' || entry.name === '.git') continue;
        
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (DOC_EXTENSIONS.includes(extname(entry.name).toLowerCase())) {
          files.push(fullPath);
        }
      }
    } catch {
      // Skip inaccessible directories
    }
  }
  
  // Scan root and common doc locations
  walk(rootDir);
  for (const docDir of DOC_DIRECTORIES) {
    walk(join(rootDir, docDir));
  }
  
  return files;
}

function main() {
  console.log('🔍 Checking for old brand references...\n');
  
  const files = getDocFiles();
  const allIssues = [];
  
  for (const filePath of files) {
    const issues = scanFile(filePath);
    allIssues.push(...issues);
  }
  
  if (allIssues.length > 0) {
    console.log('⚠️  Brand references found:');
    for (const issue of allIssues) {
      console.log(`  • ${issue.message}`);
      console.log(`    File: ${issue.path}`);
    }
    console.log(`\n${allIssues.length} brand reference(s) need updating`);
    process.exit(1);
  } else {
    console.log('✅ All brand references are current');
    process.exit(0);
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(0);
});
