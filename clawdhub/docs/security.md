---
summary: 'ClawdHub security + moderation controls (reports, bans, upload gating).'
read_when:
  - Working on ClawdHub moderation or abuse controls
  - Reviewing ClawdHub upload restrictions
  - Troubleshooting hidden/removed ClawdHub skills
---

# ClawdHub Security + Moderation

## Roles + permissions

- **user**: upload skills/souls to ClawdHub (subject to GitHub age gate); report skills/comments.
- **moderator**: hide/restore ClawdHub skills, view hidden skills, unhide, soft-delete, ban users (except admins).
- **admin**: all moderator actions + hard-delete ClawdHub skills, change owners, change roles.

## Reporting + auto-hide

- Reports on ClawdHub are unique per user + target (skill/comment).
- Report reason required (trimmed, max 500 chars). Abuse of ClawdHub reporting may result in account bans.
- Per-user cap: 20 **active** reports.
  - Active skill report = skill exists, not soft-deleted, not `moderationStatus = removed`, and the owner is not banned.
  - Active comment report = comment exists, not soft-deleted, parent skill still active, and the comment author is not banned/deactivated.
- Auto-hide: when unique ClawdHub reports exceed 3 (4th report):
  - skill report flow:
    - soft-delete skill (`softDeletedAt`)
    - set `moderationStatus = hidden`
    - set `moderationReason = auto.reports`
    - set embeddings visibility `deleted`
    - audit log entry: `skill.auto_hide`
  - comment report flow:
    - soft-delete comment (`softDeletedAt`)
    - decrement comment stat via `uncomment` stat event
    - audit log entry: `comment.auto_hide`
- ClawdHub public queries hide non-active moderation statuses; staff can still access via staff-only queries and unhide/restore/delete/ban.
- The ClawdHub skills directory supports an optional "Hide suspicious" filter to exclude active-but-flagged (`flagged.suspicious`) entries from browse/search results.

## ClawdHub skill moderation pipeline

- New ClawdHub skill publishes persist a deterministic static scan result on the version.
- ClawdHub skill moderation state stores a structured snapshot:
  - `moderationVerdict`: `clean | suspicious | malicious`
  - `moderationReasonCodes[]`: canonical machine-readable reasons
  - `moderationEvidence[]`: capped file/line evidence for static findings
  - `moderationSummary`, engine version, evaluation timestamp, source version id
- Structured ClawdHub moderation is rebuilt from current signals instead of appending stale scanner codes.
- Legacy moderation flags remain in sync for existing public visibility and suspicious-skill filtering.

## AI comment scam backfill

- ClawdHub moderators/admins can run a comment backfill scanner to classify scam comments with OpenAI.
- Scanner stores per-comment moderation metadata:
  - `scamScanVerdict`: `not_scam | likely_scam | certain_scam`
  - `scamScanConfidence`: `low | medium | high`
  - explanation/evidence/model/check timestamp fields on `comments`.
- Auto-ban trigger is intentionally strict:
  - only `certain_scam` with `high` confidence can trigger a ClawdHub account ban.
  - moderator/admin accounts are never auto-banned by this pipeline.
- Ban reason is bounded to 500 chars and includes concise evidence + comment/skill IDs.
- ClawdHub CLI run examples:
  - one-shot: `npx convex run commentModeration:backfillCommentScamModeration '{"batchSize":25,"maxBatches":20}'`
  - background chain: `npx convex run commentModeration:scheduleCommentScamModeration '{"batchSize":25}'`

## Bans

- Banning a ClawdHub user:
  - hard-deletes all owned skills
  - soft-deletes all authored skill comments + soul comments
  - revokes ClawdHub API tokens
  - sets `deletedAt` on the user
- Admins can manually unban (`deletedAt` + `banReason` cleared); revoked ClawdHub API tokens stay revoked and should be recreated by the user.
- Optional ban reason is stored in `users.banReason` and ClawdHub audit logs.
- Moderators cannot ban admins; nobody can ban themselves.
- Report counters effectively reset because deleted/banned ClawdHub skills are no longer considered active in the per-user report cap.

## User account deletion

- ClawdHub user-initiated deletion is irreversible.
- Deletion flow:
  - sets `deactivatedAt` + `purgedAt`
  - revokes ClawdHub API tokens
  - clears profile/contact fields
  - clears telemetry
- Deleted ClawdHub accounts cannot be restored by logging in again.
- Published ClawdHub skills remain public.

## Upload gate (GitHub account age)

- ClawdHub skill + soul publish actions require GitHub account age ≥ 14 days.
- ClawdHub skill + soul comment creation also requires GitHub account age ≥ 14 days.
- Lookup uses GitHub `created_at` fetched by the immutable GitHub numeric ID (`providerAccountId`) and caches on the ClawdHub user:
  - `githubCreatedAt` (source of truth)
- Gate applies to ClawdHub web uploads, CLI publish, GitHub import, and comments.
- If GitHub responds `403` or `429`, ClawdHub publish fails with:
  - `GitHub API rate limit exceeded — please try again in a few minutes`
- To reduce rate-limit failures, set `GITHUB_TOKEN` in ClawdHub Convex env for authenticated GitHub API requests.

## Empty-skill cleanup (backfill)

- ClawdHub cleanup uses quality heuristics plus trust tier to identify very thin/templated skills.
- Word counting is language-aware (`Intl.Segmenter` with fallback), reducing false positives for non-space-separated languages.
