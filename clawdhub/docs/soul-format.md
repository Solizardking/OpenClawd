---
summary: 'ClawdHub soul bundle format, required files, limits.'
read_when:
  - Publishing souls to ClawdHub
  - Debugging ClawdHub soul publish failures
---

# ClawdHub Soul Format

A ClawdHub soul is a single-file agent persona, distinct from a multi-file skill. It's the "who you are" half of an OpenClawd agent (the skill is the "what you can do" half).

## On disk

A soul is a single file:

- `SOUL.md` (or `soul.md`)

ClawdHub's soul publisher rejects any extra files in the bundle.

## `SOUL.md`

- Markdown with optional YAML frontmatter.
- ClawdHub extracts metadata from frontmatter during publish.
- `description` is used as the soul summary in the ClawdHub UI/search.

## Limits

- Total bundle size: 50MB (functionally `SOUL.md` only).
- ClawdHub embedding text includes `SOUL.md` only.

## Slugs

- Derived from folder name by default.
- Must be lowercase and URL-safe: `^[a-z0-9][a-z0-9-]*$`.

## Versioning + tags

- Each ClawdHub publish creates a new version (semver).
- Tags are string pointers to a version; `latest` is commonly used.
