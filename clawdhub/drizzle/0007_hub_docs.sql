-- Mirror ClawdHub docs metadata into Postgres so hub surfaces can search and
-- route docs without scraping the repo at runtime. Markdown bodies are loaded
-- by scripts/sync-hub-docs.ts so migrations stay small and reviewable.

CREATE TABLE IF NOT EXISTS hub_docs (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(96) NOT NULL UNIQUE,
  title VARCHAR(160) NOT NULL,
  summary TEXT NOT NULL,
  "sourcePath" TEXT NOT NULL,
  "routePath" TEXT NOT NULL,
  "canonicalUrl" TEXT NOT NULL,
  "readWhen" JSON NOT NULL DEFAULT '[]',
  content TEXT,
  "contentHash" VARCHAR(64),
  published BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS hub_docs_slug_idx ON hub_docs (slug);
CREATE INDEX IF NOT EXISTS hub_docs_published_idx ON hub_docs (published);
CREATE INDEX IF NOT EXISTS hub_docs_updated_idx ON hub_docs ("updatedAt" DESC);

INSERT INTO hub_docs (
  slug,
  title,
  summary,
  "sourcePath",
  "routePath",
  "canonicalUrl",
  "readWhen",
  "updatedAt"
) VALUES
  (
    'api',
    'ClawdHub API v1',
    'ClawdHub public REST API (v1) overview and conventions.',
    'docs/api.md',
    '/docs/api',
    'https://hub.solanaclawd.com/docs/api',
    '["Building ClawdHub API clients","Adding endpoints or schemas to the ClawdHub registry"]'::json,
    NOW()
  ),
  (
    'architecture',
    'ClawdHub Architecture',
    'ClawdHub architecture: web app + Convex backend + CLI + shared schema.',
    'docs/architecture.md',
    '/docs/architecture',
    'https://hub.solanaclawd.com/docs/architecture',
    '["Orienting in the ClawdHub codebase","Tracing a user flow across ClawdHub layers"]'::json,
    NOW()
  ),
  (
    'auth',
    'ClawdHub Auth',
    'ClawdHub auth: GitHub OAuth (web) + ClawdHub API tokens (CLI).',
    'docs/auth.md',
    '/docs/auth',
    'https://hub.solanaclawd.com/docs/auth',
    '["Working on ClawdHub login/token flows","Debugging 401s against hub.solanaclawd.com"]'::json,
    NOW()
  ),
  (
    'cli',
    'ClawdHub CLI',
    'ClawdHub CLI reference: commands, flags, config, lockfile, sync behavior.',
    'docs/cli.md',
    '/docs/cli',
    'https://hub.solanaclawd.com/docs/cli',
    '["Working on ClawdHub CLI behavior","Debugging install/update/sync against hub.solanaclawd.com"]'::json,
    NOW()
  ),
  (
    'deploy-hub',
    'Deploying ClawdHub to hub.solanaclawd.com',
    'Runbook for deploying ClawdHub to hub.solanaclawd.com.',
    'docs/deploy-hub.md',
    '/docs/deploy-hub',
    'https://hub.solanaclawd.com/docs/deploy-hub',
    '["Shipping ClawdHub to production","Wiring DNS / Vercel / Convex for hub.solanaclawd.com"]'::json,
    NOW()
  ),
  (
    'deploy',
    'ClawdHub Deploy',
    'ClawdHub deploy checklist: Convex backend + Netlify/Railway web app.',
    'docs/deploy.md',
    '/docs/deploy',
    'https://hub.solanaclawd.com/docs/deploy',
    '["Shipping ClawdHub to production","Debugging /api routing on hub.solanaclawd.com"]'::json,
    NOW()
  ),
  (
    'diffing',
    'ClawdHub Diffing Mode',
    'ClawdHub skill version diffing mode (Monaco-backed).',
    'docs/diffing.md',
    '/docs/diffing',
    'https://hub.solanaclawd.com/docs/diffing',
    '["Implementing the ClawdHub skill diff UI","Adding version comparisons on hub.solanaclawd.com"]'::json,
    NOW()
  ),
  (
    'github-import',
    'ClawdHub: GitHub Import',
    'ClawdHub feature spec: import a skill from a public GitHub URL (auto-detect SKILL.md, selective file upload, provenance).',
    'docs/github-import.md',
    '/docs/github-import',
    'https://hub.solanaclawd.com/docs/github-import',
    '["Adding GitHub import to ClawdHub (web + API)","Reviewing safety limits (SSRF/zip-bombs) on ClawdHub uploads","Implementing provenance + canonical-claim flows for ClawdHub skills"]'::json,
    NOW()
  ),
  (
    'http-api',
    'ClawdHub HTTP API',
    'ClawdHub HTTP API reference (public + CLI endpoints + auth).',
    'docs/http-api.md',
    '/docs/http-api',
    'https://hub.solanaclawd.com/docs/http-api',
    '["Adding/changing ClawdHub endpoints","Debugging ClawdHub CLI ↔ registry requests"]'::json,
    NOW()
  ),
  (
    'manual-testing',
    'Manual Testing (CLI)',
    'Copy/paste ClawdHub CLI smoke checklist for local and production verification.',
    'docs/manual-testing.md',
    '/docs/manual-testing',
    'https://hub.solanaclawd.com/docs/manual-testing',
    '["Pre-merge validation","Reproducing a reported ClawdHub CLI bug"]'::json,
    NOW()
  ),
  (
    'mintlify',
    'ClawdHub Mintlify Docs',
    'ClawdHub docs publishing notes for Mintlify.',
    'docs/mintlify.md',
    '/docs/mintlify',
    'https://hub.solanaclawd.com/docs/mintlify',
    '["Publishing ClawdHub docs","Configuring docs.solanaclawd.com"]'::json,
    NOW()
  ),
  (
    'quickstart',
    'ClawdHub Quickstart',
    'Quickstart for using ClawdHub from hub.solanaclawd.com and the CLI.',
    'docs/quickstart.md',
    '/docs/quickstart',
    'https://hub.solanaclawd.com/docs/quickstart',
    '["Installing ClawdHub","Publishing or installing OpenClawd skills"]'::json,
    NOW()
  ),
  (
    'readme',
    'ClawdHub Docs',
    'ClawdHub documentation index.',
    'docs/README.md',
    '/docs',
    'https://hub.solanaclawd.com/docs',
    '["Finding the right ClawdHub doc","Updating ClawdHub documentation"]'::json,
    NOW()
  ),
  (
    'security',
    'ClawdHub Security + Moderation',
    'ClawdHub security + moderation controls (reports, bans, upload gating).',
    'docs/security.md',
    '/docs/security',
    'https://hub.solanaclawd.com/docs/security',
    '["Working on ClawdHub moderation or abuse controls","Reviewing ClawdHub upload restrictions","Troubleshooting hidden/removed ClawdHub skills"]'::json,
    NOW()
  ),
  (
    'skill-format',
    'ClawdHub Skill Format',
    'ClawdHub skill folder format, required files, allowed file types, limits.',
    'docs/skill-format.md',
    '/docs/skill-format',
    'https://hub.solanaclawd.com/docs/skill-format',
    '["Publishing skills to ClawdHub","Debugging ClawdHub publish/sync failures"]'::json,
    NOW()
  ),
  (
    'soul-format',
    'ClawdHub Soul Format',
    'ClawdHub soul bundle format, required files, limits.',
    'docs/soul-format.md',
    '/docs/soul-format',
    'https://hub.solanaclawd.com/docs/soul-format',
    '["Publishing souls to ClawdHub","Debugging ClawdHub soul publish failures"]'::json,
    NOW()
  ),
  (
    'spec',
    'ClawdHub Product + Implementation Spec',
    'ClawdHub spec: skills registry, versioning, vector search, moderation.',
    'docs/spec.md',
    '/docs/spec',
    'https://hub.solanaclawd.com/docs/spec',
    '["Bootstrapping ClawdHub","Implementing ClawdHub schema/auth/search/versioning","Reviewing ClawdHub API and upload/download flows"]'::json,
    NOW()
  ),
  (
    'telemetry',
    'ClawdHub Telemetry',
    'ClawdHub install telemetry collected via clawdhub sync + opt-out.',
    'docs/telemetry.md',
    '/docs/telemetry',
    'https://hub.solanaclawd.com/docs/telemetry',
    '["Working on ClawdHub telemetry / privacy controls","Questions about what data ClawdHub collects"]'::json,
    NOW()
  ),
  (
    'troubleshooting',
    'ClawdHub Troubleshooting',
    'Common ClawdHub setup/runtime issues (CLI + backend) and fixes.',
    'docs/troubleshooting.md',
    '/docs/troubleshooting',
    'https://hub.solanaclawd.com/docs/troubleshooting',
    '["Something is broken on ClawdHub and you need a fix-fast checklist"]'::json,
    NOW()
  ),
  (
    'webhook',
    'ClawdHub Webhooks',
    'ClawdHub Discord webhook events/payloads for skill publish + highlight.',
    'docs/webhook.md',
    '/docs/webhook',
    'https://hub.solanaclawd.com/docs/webhook',
    '["Working on ClawdHub webhooks/integrations"]'::json,
    NOW()
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  summary = EXCLUDED.summary,
  "sourcePath" = EXCLUDED."sourcePath",
  "routePath" = EXCLUDED."routePath",
  "canonicalUrl" = EXCLUDED."canonicalUrl",
  "readWhen" = EXCLUDED."readWhen",
  published = EXCLUDED.published,
  "updatedAt" = NOW();
