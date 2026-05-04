---
summary: 'ClawdHub architecture: web app + Convex backend + CLI + shared schema.'
read_when:
  - Orienting in the ClawdHub codebase
  - Tracing a user flow across ClawdHub layers
---

# ClawdHub Architecture

## Pieces

- **Web app:** TanStack Start (React) under [`../src/`](../src/) — the `hub.solanaclawd.com` frontend.
- **Backend:** Convex under [`../convex/`](../convex/) (DB, storage, actions, HTTP routes). Currently deployed on `third-bobcat-386`.
- **CLI:** [`../packages/clawdhub/`](../packages/clawdhub/) — published as `@openclawdsolana/clawdhub`, bin `clawdhub` (`clawhub` retained as legacy alias).
- **Shared schemas/routes:** [`../packages/schema/`](../packages/schema/) — `@openclawdsolana/clawdhub-schema` (legacy `clawhub-schema`).

## Data + storage

- A ClawdHub skill **bundle** = versioned set of text files stored in Convex `_storage`.
- Metadata is extracted from each skill's `SKILL.md` frontmatter on publish.
- Per-skill stats (downloads, installs, stars, comments) live on the `skills` table.

## Main flows

### Browse (web)

- The ClawdHub UI reads skill metadata + latest version via Convex queries/actions.
- `SKILL.md` is rendered as Markdown in the skill detail page.

### Search (HTTP)

- `/api/v1/search?q=...` routes to a Convex action for vector search.
- Embeddings are generated during publish on ClawdHub.

### Install (CLI)

- Resolve latest version via `GET /api/v1/skills/<slug>` against ClawdHub.
- Download zip via `GET /api/v1/download?slug=...&version=...`.
- Extract into `./skills/<slug>` (default).
- Persist install state:
  - `./.clawdhub/lock.json` (per workdir; `.clawhub` retained as legacy alias).
  - `./skills/<slug>/.clawdhub/origin.json` (per skill folder).

### Update (CLI)

- Hash local files, call `GET /api/v1/resolve?slug=...&hash=<sha256>` against ClawdHub.
- If the hash matches a known version → use that for "current".
- If it doesn't match:
  - refuse by default.
  - or overwrite with `--force`.

### Publish (CLI)

- Publish via `POST /api/v1/skills` (multipart; ClawdHub Bearer token required).

### Sync (CLI)

- Scan roots for skill folders (any folder containing a `SKILL.md`).
- Compute fingerprint; compare to ClawdHub registry state.
- Optionally report telemetry — see [`telemetry.md`](telemetry.md).
- Publish new/changed skills to ClawdHub (skips modified installed skills inside an install root).
