# Contributing to OpenClawd

Thanks for your interest in OpenClawd. This is an experimental, fast-moving
codebase — please read the notes below before opening a PR.

## Getting set up

1. Fork & clone the repo.
2. Install [pnpm](https://pnpm.io/) (>= 9) and Node.js (>= 22).
3. From the repo root: `pnpm install`. Several subprojects (`tui`,
   `openclawd-framework`, `X`, `agents`, `clawd-code-cli-newnew`,
   `extensions/*`, `ui`, `automaton-main`) have their own
   `package.json` — install per-subproject as needed.
4. Copy `X/.env.example` to `X/.env` and populate with your own credentials.
   **Never** commit `.env`. See [SECURITY.md](SECURITY.md).

## Workflow

- Open issues for non-trivial changes before sending a PR.
- One topic per PR. Keep diffs focused.
- Run `pnpm typecheck` (and `pnpm test`, where it exists) before pushing.
- Don't add files under `node_modules/` or `dist/` — both are gitignored.
- Don't include `.DS_Store`, editor metadata, or Finder duplicate
  files (`* 2.md`, `* 2.json`, etc.).

## Code style

- TypeScript strict mode where it's already enabled. Don't loosen it.
- Avoid adding new wallet-signing or fund-moving code paths without a
  clearly-scoped review.
- Prefer environment variables over hardcoded paths, URLs, or addresses.

## Reporting security issues

See [SECURITY.md](SECURITY.md). Do not open a public issue for security
problems.
