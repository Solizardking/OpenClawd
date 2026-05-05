-- Manual migration mirror for environments that run drizzle/migrations/*
-- instead of the drizzle-kit top-level SQL files. Metadata seed rows live in
-- ../0007_hub_docs.sql; Markdown bodies are synced with:
--   DATABASE_URL="$DATABASE_URL" bun run docs:sync-db

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
