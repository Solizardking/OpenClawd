---
summary: 'ClawdHub install telemetry collected via `clawdhub sync` + opt-out.'
read_when:
  - Working on ClawdHub telemetry / privacy controls
  - Questions about what data ClawdHub collects
---

# ClawdHub Telemetry

ClawdHub uses **minimal telemetry** to compute **install counts** (what's actually in use) and to power better sorting/filtering on `hub.solanaclawd.com`. This is based on the CLI `clawdhub sync` command.

## When telemetry is collected

ClawdHub telemetry is only sent when:

- You are **logged in** in the `clawdhub` CLI (auth is already required for sync/publish flows).
- You run `clawdhub sync`.
- ClawdHub telemetry is **not disabled** (see "How to disable" below).

If you are not logged in to ClawdHub, nothing is reported.

## What ClawdHub collects

On each `clawdhub sync`, the CLI reports a **full snapshot** of what it found, grouped by scan root ("folder/root").

For each root ClawdHub stores:

- `rootId`: a **SHA-256 hash** of the canonical root path (the ClawdHub server never sees the raw path).
- `label`: a human-readable label derived from the last two path segments (home paths are shown with `~`).
- `firstSeenAt`, `lastSeenAt`, optional `expiredAt`.

For each skill found under a root ClawdHub stores:

- `skillId` (resolved by slug; only skills that exist in the ClawdHub registry are tracked).
- `firstSeenAt`, `lastSeenAt`.
- `lastVersion` (best-effort; currently the registry-matched version if known).
- optional `removedAt` when a previously-reported install disappears from a root.

### What ClawdHub does *not* collect

- No raw absolute folder paths (only hashed `rootId` + a short display label).
- No file contents.
- No per-run logs, prompts, or other CLI output.
- No tracking for skills that aren't uploaded to ClawdHub (unknown slugs are ignored).

## Install counts

ClawdHub maintains two counters per skill:

- `installsCurrent`: unique users who currently have the skill installed in at least one active root.
- `installsAllTime`: unique users who have ever reported the skill installed.

### Multiple roots

If you sync from multiple folders, ClawdHub treats each scan root independently. A skill is "currently installed" if it exists in **any** active root.

### Uninstall detection

Because `sync` reports the full set per root:

- If a skill disappears from a root on the next sync, ClawdHub marks it removed for that root.
- If the skill is removed from all of your roots, it no longer counts toward `installsCurrent`.
- `installsAllTime` never decreases unless you delete telemetry (see below).

### Staleness (120 days)

Roots that don't report telemetry to ClawdHub for **120 days** are marked stale and their installs stop counting toward `installsCurrent`. This is evaluated lazily (on the next telemetry report) to avoid background jobs.

## Transparency + user controls

ClawdHub provides a private "Installed" tab on your own profile:

- Shows the exact roots + installed skills ClawdHub stores.
- Includes a **JSON export** view.
- Includes a **Delete telemetry** action to remove all stored telemetry for your ClawdHub account.

Everyone else only sees **aggregated install counters**; no one else can see your roots/folders on ClawdHub.

Deleting your ClawdHub account also deletes your telemetry data.

## How to disable telemetry

Set the environment variable:

```bash
export CLAWDHUB_DISABLE_TELEMETRY=1
```

(legacy `CLAWHUB_DISABLE_TELEMETRY=1` still honored)

With this set, the ClawdHub CLI will not send telemetry during `clawdhub sync`.
