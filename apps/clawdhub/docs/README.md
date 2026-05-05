---
summary: 'ClawdHub documentation index + reading order.'
read_when:
  - New contributor onboarding
  - Looking for the right doc
---

# ClawdHub Docs

ClawdHub is the OpenClawd skill marketplace + registry — `hub.solanaclawd.com` — and the `clawdhub` CLI that publishes, installs, and syncs skills against it.

Reading order (new contributor):

1. [`../README.md`](../README.md) — repo root: run ClawdHub locally.
2. [`quickstart.md`](quickstart.md) — end-to-end: search → install → publish → sync against ClawdHub.
3. [`architecture.md`](architecture.md) — how the pieces fit (TanStack Start + Convex `third-bobcat-386` + ClawdHub CLI).
4. [`skill-format.md`](skill-format.md) — what a "skill" is on disk and on the ClawdHub registry.
5. [`cli.md`](cli.md) — `clawdhub` CLI reference (flags, config, lockfiles, sync rules).
6. [`http-api.md`](http-api.md) — HTTP endpoints used by the CLI + public ClawdHub API.
7. [`auth.md`](auth.md) — GitHub OAuth + ClawdHub API tokens + CLI loopback login.
8. [`deploy.md`](deploy.md) — Convex + Netlify/Railway deployment for ClawdHub.
9. [`troubleshooting.md`](troubleshooting.md) — common ClawdHub failure modes.

Feature/ops docs:

- [`spec.md`](spec.md) — ClawdHub product + implementation spec (data model + flows).
- [`security.md`](security.md) — moderation, reporting, bans, upload gating on ClawdHub.
- [`telemetry.md`](telemetry.md) — what `clawdhub sync` reports; opt-out.
- [`webhook.md`](webhook.md) — Discord webhook events/payload from ClawdHub.
- [`diffing.md`](diffing.md) — version-to-version diff UI spec for ClawdHub skills.
- [`manual-testing.md`](manual-testing.md) — ClawdHub CLI smoke scripts.
- [`api.md`](api.md) — public REST API (v1) overview.
- [`deploy-hub.md`](deploy-hub.md) — `hub.solanaclawd.com` deployment specifics.
- [`github-import.md`](github-import.md) — import skills from GitHub into ClawdHub.
- [`soul-format.md`](soul-format.md) — soul (agent persona) format on ClawdHub.

Docs tooling:

- [`mintlify.md`](mintlify.md) — publish these docs with Mintlify under `docs.solanaclawd.com`.
- `bun run docs:sync-db` — mirror the docs list and Markdown bodies into the
  `hub_docs` Postgres table for hub search/help surfaces.
