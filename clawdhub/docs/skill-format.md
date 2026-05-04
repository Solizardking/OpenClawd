---
summary: 'ClawdHub skill folder format, required files, allowed file types, limits.'
read_when:
  - Publishing skills to ClawdHub
  - Debugging ClawdHub publish/sync failures
---

# ClawdHub Skill Format

## On disk

A ClawdHub skill is a folder.

Required:

- `SKILL.md` (or `skill.md`)

Optional:

- any supporting *text-based* files (see "Allowed files").
- `.clawdhubignore` (ignore patterns for publish/sync; legacy `.clawhubignore`).
- `.gitignore` (also honored).

Local install metadata (written by the ClawdHub CLI):

- `<skill>/.clawdhub/origin.json` (legacy `.clawhub`).

Workdir install state (written by the ClawdHub CLI):

- `<workdir>/.clawdhub/lock.json` (legacy `.clawhub`).

## `SKILL.md`

- Markdown with optional YAML frontmatter.
- ClawdHub extracts metadata from frontmatter during publish.
- `description` is used as the skill summary in the ClawdHub UI/search.

## Frontmatter metadata

ClawdHub skill metadata is declared in the YAML frontmatter at the top of `SKILL.md`. This tells the ClawdHub registry (and its security analysis) what the skill needs to run.

### Basic frontmatter

```yaml
---
name: my-skill
description: Short summary of what this ClawdHub skill does.
version: 1.0.0
---
```

### Runtime metadata (`metadata.openclaw`)

Declare runtime requirements under `metadata.openclaw` (aliases: `metadata.clawdbot`, `metadata.clawdis`).

```yaml
---
name: my-skill
description: Manage tasks via the Todoist API.
metadata:
  openclaw:
    requires:
      env:
        - TODOIST_API_KEY
      bins:
        - curl
    primaryEnv: TODOIST_API_KEY
---
```

### Full field reference

| Field | Type | Description |
|-------|------|-------------|
| `requires.env` | `string[]` | Environment variables the skill expects. |
| `requires.bins` | `string[]` | CLI binaries that must all be installed. |
| `requires.anyBins` | `string[]` | CLI binaries where at least one must exist. |
| `requires.config` | `string[]` | Config file paths the skill reads. |
| `primaryEnv` | `string` | The main credential env var for the skill. |
| `always` | `boolean` | If `true`, ClawdHub treats the skill as always active (no explicit install needed). |
| `skillKey` | `string` | Override the skill's invocation key. |
| `emoji` | `string` | Display emoji for the skill in ClawdHub. |
| `homepage` | `string` | URL to the skill's homepage or docs. |
| `os` | `string[]` | OS restrictions (e.g. `["macos"]`, `["linux"]`). |
| `install` | `array` | Install specs for dependencies (see below). |
| `nix` | `object` | Nix plugin spec (see ClawdHub README). |
| `config` | `object` | Clawdbot config spec (see ClawdHub README). |

### Install specs

If a ClawdHub skill needs dependencies installed, declare them in the `install` array:

```yaml
metadata:
  openclaw:
    install:
      - kind: brew
        formula: jq
        bins: [jq]
      - kind: node
        package: typescript
        bins: [tsc]
```

Supported install kinds: `brew`, `node`, `go`, `uv`.

### Why this matters

ClawdHub's security analysis checks that what a skill declares matches what it actually does. If the code references `TODOIST_API_KEY` but the frontmatter doesn't declare it under `requires.env`, ClawdHub will flag a metadata mismatch. Keeping declarations accurate helps a skill pass review and helps users understand what they're installing from ClawdHub.

### Example: complete frontmatter

```yaml
---
name: todoist-cli
description: Manage Todoist tasks, projects, and labels from the command line.
version: 1.2.0
metadata:
  openclaw:
    requires:
      env:
        - TODOIST_API_KEY
      bins:
        - curl
    primaryEnv: TODOIST_API_KEY
    emoji: "✅"
    homepage: https://github.com/example/todoist-cli
---
```

## Allowed files

Only "text-based" files are accepted by ClawdHub publish.

- Extension allowlist is in [`../packages/schema/src/textFiles.ts`](../packages/schema/src/textFiles.ts) (`TEXT_FILE_EXTENSIONS`).
- Content types starting with `text/` are treated as text; plus a small allowlist (JSON/YAML/TOML/JS/TS/Markdown/SVG).

ClawdHub limits (server-side):

- Total bundle size: 50MB.
- Embedding text includes `SKILL.md` + up to ~40 non-`.md` files (best-effort cap).

## Slugs

- Derived from folder name by default.
- Must be lowercase and URL-safe: `^[a-z0-9][a-z0-9-]*$`.

## Versioning + tags

- Each ClawdHub publish creates a new version (semver).
- Tags are string pointers to a version; `latest` is commonly used.

## License

- All skills published on ClawdHub are licensed under `MIT-0`.
- Anyone may use, modify, and redistribute ClawdHub-published skills, including commercially.
- Attribution is not required.
- Do not add conflicting license terms in `SKILL.md`; ClawdHub does not support per-skill license overrides.
