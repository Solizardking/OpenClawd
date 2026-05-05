---
summary: 'ClawdHub local setup + CLI smoke: login, search, install, publish, sync.'
read_when:
  - First run / local ClawdHub dev setup
  - Verifying end-to-end ClawdHub flows
---

# ClawdHub Quickstart

## 0) Prereqs

- Bun
- Convex CLI (`bunx convex ...`)
- GitHub OAuth App (for ClawdHub login)
- Together API key (for ClawdHub embeddings/search)
- OpenAI key (for ClawdHub moderation/summaries)

## 1) Local dev (web + Convex)

```bash
bun install
cp .env.local.example .env.local

# terminal A — ClawdHub web app
bun run dev

# terminal B — ClawdHub Convex backend
bunx convex dev
```

## 2) Auth setup (GitHub OAuth + Convex Auth keys)

Fill in `.env.local`:

- `AUTH_GITHUB_ID`
- `AUTH_GITHUB_SECRET`
- `VITE_CONVEX_URL`
- `VITE_CONVEX_SITE_URL`
- `CONVEX_SITE_URL` (same as `VITE_CONVEX_SITE_URL`)
- `TOGETHER_API_KEY`
- `OPENAI_API_KEY`

Generate Convex Auth keys for your ClawdHub deployment:

```bash
bunx auth --deployment-name <deployment> --web-server-url http://localhost:3000
```

Then paste the printed `JWT_PRIVATE_KEY` + `JWKS` into `.env.local` (and ensure the ClawdHub deployment got them too).

## 3) ClawdHub CLI: login + basic commands

From this repo:

```bash
bun clawdhub --help
bun clawdhub login
bun clawdhub whoami
bun clawdhub search gif --limit 5
```

Install a ClawdHub skill into `./skills/<slug>` (if Clawdbot is configured, ClawdHub installs into that workspace instead):

```bash
bun clawdhub install <slug>
bun clawdhub list
bun clawdhub uninstall <slug> --yes
```

You can also install into any folder:

```bash
bun clawdhub install <slug> --workdir /tmp/clawdhub-demo --dir skills
```

Update:

```bash
bun clawdhub update --all
```

## 4) Publish a skill to ClawdHub

Create a folder containing `SKILL.md` (required) plus any supporting text files:

```bash
mkdir -p /tmp/clawdhub-skill-demo && cd /tmp/clawdhub-skill-demo
cat > SKILL.md <<'EOF'
---
name: Demo Skill
description: Demo ClawdHub skill for local testing
---

# Demo Skill

Hello from ClawdHub.
EOF
```

Publish to ClawdHub:

```bash
bun clawdhub publish . \
  --slug clawdhub-demo-$(date +%s) \
  --name "Demo $(date +%s)" \
  --version 1.0.0 \
  --tags latest \
  --changelog "Initial release"
```

## 5) Sync local skills (auto-publish new/changed to ClawdHub)

`sync` scans for local skill folders and publishes the ones that aren't "synced" with ClawdHub yet.

```bash
bun clawdhub sync
```

Dry run + non-interactive:

```bash
bun clawdhub sync --all --dry-run --no-input
```
