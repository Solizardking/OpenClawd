#!/usr/bin/env node
// OpenClawd secret scanner — zero-dependency Node script.
// Modes:
//   --staged           scan files staged for the next commit (pre-commit hook)
//   --range <A>..<B>   scan all files changed in commits A..B (pre-push hook)
//   --paths <files...> scan an explicit set of files (CI / manual)
//   --all              scan every tracked file in the working tree (CI nightly)
//
// Exit codes: 0 = clean, 1 = findings, 2 = usage error.
//
// Allowlist: prefix any line you genuinely want to commit with the marker
//   `pragma: allowlist secret` (in a comment for that file's syntax).

import { execSync } from "node:child_process";
import { readFileSync, statSync } from "node:fs";
import path from "node:path";

const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";

const ALLOW_MARKER = "pragma: allowlist secret";

// File-name patterns that should NEVER be committed, regardless of contents.
const FORBIDDEN_PATHS = [
  /(^|\/)\.env$/,
  /(^|\/)\.env\.[^/]*$/i, // .env.local, .env.production, etc. (.env.example is allowed below)
  /(^|\/)\.keys\//,
  /(^|\/)keypair\.json$/,
  /(^|\/)wallet\.json$/,
  /-keypair\.json$/,
  /\.pem$/,
  /\.p12$/,
  /\.pfx$/,
  /(^|\/)id_rsa($|\.)/,
  /(^|\/)id_ed25519($|\.)/,
  /(^|\/)credentials\.json$/,
  /(^|\/)service-account.*\.json$/,
];

// Filenames that are templates / placeholders and exempt from the FORBIDDEN_PATHS rule above.
const PATH_ALLOWLIST = [
  /\.example$/i,
  /\.example\.[^/]+$/i,
  /\.template$/i,
  /\.sample$/i,
];

// Content patterns. Order matters — the first match wins.
const CONTENT_RULES = [
  {
    id: "solana-keypair-array",
    why: "64-byte Solana secret-key array in source",
    re: /\[\s*(?:\d{1,3}\s*,\s*){62,}\d{1,3}\s*\]/,
  },
  {
    id: "base58-private-key",
    why: "Base58-encoded Solana private key (80-128 chars)",
    re: /["'`][1-9A-HJ-NP-Za-km-z]{86,90}["'`]/,
  },
  {
    id: "anthropic-key",
    why: "Anthropic API key",
    re: /sk-ant-[a-zA-Z0-9_-]{40,}/,
  },
  {
    id: "openai-key",
    why: "OpenAI API key",
    re: /sk-(?:proj|live|test|or|None)-[a-zA-Z0-9_-]{40,}/,
  },
  {
    id: "xai-key",
    why: "xAI / Grok API key",
    re: /\bxai-[a-zA-Z0-9]{40,}\b/,
  },
  {
    id: "google-api-key",
    why: "Google / Gemini API key",
    re: /\bAIza[0-9A-Za-z_-]{35}\b/,
  },
  {
    id: "github-pat",
    why: "GitHub personal access token",
    re: /\b(?:ghp_|github_pat_)[A-Za-z0-9_]{30,}\b/,
  },
  {
    id: "helius-key",
    why: "Helius API key (likely embedded in RPC URL)",
    re: /helius[a-z-]*\.com[^\s"'`]*api-key=[A-Za-z0-9-]{20,}/i,
  },
  {
    id: "quiknode-token",
    why: "QuikNode RPC URL with embedded auth token",
    re: /[a-z0-9-]+\.quiknode\.pro\/[0-9a-f]{32,}/i,
  },
  {
    id: "alchemy-key",
    why: "Alchemy RPC URL with embedded API key",
    re: /[a-z0-9-]+\.g\.alchemy\.com\/v2\/[A-Za-z0-9_-]{20,}/i,
  },
  {
    id: "private-jwt",
    why: "JWT (likely a Supabase / Privy / service-role token)",
    re: /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/,
  },
  {
    id: "aws-access-key",
    why: "AWS access key id",
    re: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/,
  },
  {
    id: "private-key-block",
    why: "PEM private key block",
    re: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/,
  },
  {
    id: "populated-private-key-env",
    why: "Hardcoded *_PRIVATE_KEY=<value> in tracked file",
    re: /\b[A-Z][A-Z0-9_]*PRIVATE_KEY\s*=\s*(?!["'`]?\s*(?:$|#|\n))[^\s"'`#]{16,}/m,
  },
];

// Paths to never scan even if changed (binary blobs / generated content).
const SCAN_SKIP = [
  /(^|\/)node_modules\//,
  /(^|\/)dist\//,
  /(^|\/)build\//,
  /(^|\/)\.next\//,
  /(^|\/)\.turbo\//,
  /(^|\/)\.git\//,
  /\.lock$/,
  /package-lock\.json$/,
  /pnpm-lock\.yaml$/,
  /yarn\.lock$/,
  /\.(?:png|jpg|jpeg|gif|webp|ico|svg|woff2?|ttf|eot|mp4|webm|mp3|wav|pdf|zip|tar|gz|tgz|bz2|7z)$/i,
];

function git(args) {
  return execSync(`git ${args}`, {
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
  }).trim();
}

function listStaged() {
  return git("diff --cached --name-only --diff-filter=ACMR")
    .split("\n")
    .filter(Boolean);
}

function listInRange(range) {
  return git(`diff --name-only --diff-filter=ACMR ${range}`)
    .split("\n")
    .filter(Boolean);
}

function listAllTracked() {
  return git("ls-files").split("\n").filter(Boolean);
}

function isAllowedPath(p) {
  return PATH_ALLOWLIST.some((re) => re.test(p));
}

function isForbiddenPath(p) {
  if (isAllowedPath(p)) return false;
  return FORBIDDEN_PATHS.some((re) => re.test(p));
}

function shouldSkipScan(p) {
  return SCAN_SKIP.some((re) => re.test(p));
}

function readSafe(p) {
  try {
    const st = statSync(p);
    if (!st.isFile()) return null;
    if (st.size > 2 * 1024 * 1024) return null; // skip files > 2 MiB
    const buf = readFileSync(p);
    // Crude binary detector: NULs in first 4 KiB.
    const head = buf.subarray(0, 4096);
    for (let i = 0; i < head.length; i++) if (head[i] === 0) return null;
    return buf.toString("utf8");
  } catch {
    return null;
  }
}

function scanContent(p, content) {
  const findings = [];
  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes(ALLOW_MARKER)) continue;
    for (const rule of CONTENT_RULES) {
      const m = rule.re.exec(line);
      if (m) {
        findings.push({
          file: p,
          line: i + 1,
          rule: rule.id,
          why: rule.why,
          excerpt: line.trim().slice(0, 160),
        });
        break; // one finding per line is enough
      }
    }
  }
  return findings;
}

function main(argv) {
  const args = argv.slice(2);
  let mode = null;
  let modeArg = null;
  const explicitPaths = [];

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--staged") mode = "staged";
    else if (a === "--all") mode = "all";
    else if (a === "--range") {
      mode = "range";
      modeArg = args[++i];
    } else if (a === "--paths") {
      mode = "paths";
      while (i + 1 < args.length && !args[i + 1].startsWith("--")) {
        explicitPaths.push(args[++i]);
      }
    } else if (a === "-h" || a === "--help") {
      process.stdout.write(
        "Usage: scan-secrets.mjs [--staged | --range A..B | --paths <files...> | --all]\n",
      );
      process.exit(0);
    }
  }
  if (!mode) mode = "staged";

  let files = [];
  if (mode === "staged") files = listStaged();
  else if (mode === "range") files = listInRange(modeArg);
  else if (mode === "paths") files = explicitPaths;
  else if (mode === "all") files = listAllTracked();

  files = files.filter(Boolean);

  const findings = [];
  const forbiddenFiles = [];

  for (const f of files) {
    if (isForbiddenPath(f)) {
      forbiddenFiles.push(f);
      continue;
    }
    if (shouldSkipScan(f)) continue;
    const content = readSafe(f);
    if (content == null) continue;
    findings.push(...scanContent(f, content));
  }

  if (forbiddenFiles.length === 0 && findings.length === 0) {
    if (mode !== "staged") {
      process.stdout.write(
        `${DIM}openclawd-secret-scan: clean (${files.length} files checked)${RESET}\n`,
      );
    }
    process.exit(0);
  }

  process.stderr.write(
    `\n${RED}OpenClawd secret scanner blocked this operation.${RESET}\n\n`,
  );

  if (forbiddenFiles.length) {
    process.stderr.write(
      `${RED}Files that must never be committed:${RESET}\n`,
    );
    for (const f of forbiddenFiles) {
      process.stderr.write(`  - ${f}\n`);
    }
    process.stderr.write(
      `\n  Move secrets to a gitignored file (e.g. \`.env\`) and commit a\n  template (\`.env.example\`) instead. See SECURITY.md.\n\n`,
    );
  }

  if (findings.length) {
    process.stderr.write(`${RED}Likely secrets in tracked content:${RESET}\n`);
    for (const f of findings) {
      process.stderr.write(
        `  ${YELLOW}${f.file}:${f.line}${RESET}  [${f.rule}] ${f.why}\n` +
          `    ${DIM}${f.excerpt}${RESET}\n`,
      );
    }
    process.stderr.write(
      `\n  If a hit is genuinely safe (a public address, a placeholder, a\n  fixture), append \`# ${ALLOW_MARKER}\` to the line — or use the\n  matching comment syntax for the file's language.\n\n`,
    );
  }

  process.stderr.write(
    `  To bypass this check ${DIM}only when you are certain${RESET}: re-run with\n    ${DIM}git commit --no-verify${RESET}   (NOT recommended)\n\n`,
  );
  process.exit(1);
}

main(process.argv);
