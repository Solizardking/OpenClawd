-- Research persistence: every chain/defi/market call (and every autoloop tick)
-- writes one row here. Used by /api/v1/research/runs and the future TUI history
-- panel. Schema is intentionally permissive (jsonb blobs) so we don't need a
-- migration every time a new orchestrator method is added.

CREATE TABLE IF NOT EXISTS research_runs (
  id           text PRIMARY KEY,
  kind         text NOT NULL,            -- chain | defi | market | autoloop
  agent        text NOT NULL,
  query        text NOT NULL,
  results      jsonb NOT NULL DEFAULT '{}'::jsonb,
  sources      text[] NOT NULL DEFAULT '{}',
  confidence   numeric(4,3),
  metadata     jsonb NOT NULL DEFAULT '{}'::jsonb,
  user_id      uuid,                     -- nullable; populated when called by an authenticated user
  created_at   timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS research_runs_kind_created_idx
  ON research_runs (kind, created_at DESC);

CREATE INDEX IF NOT EXISTS research_runs_agent_created_idx
  ON research_runs (agent, created_at DESC);

CREATE INDEX IF NOT EXISTS research_runs_user_created_idx
  ON research_runs (user_id, created_at DESC) WHERE user_id IS NOT NULL;

-- Findings: optional fine-grained extraction of individual signals from a run.
-- The orchestrator can split a single run into multiple findings (e.g. a
-- pump_fun mandate produces N "trending" findings). Useful for ranking and
-- de-duplication across windows.
CREATE TABLE IF NOT EXISTS research_findings (
  id           bigserial PRIMARY KEY,
  run_id       text NOT NULL REFERENCES research_runs(id) ON DELETE CASCADE,
  kind         text NOT NULL,            -- trending | new_listing | yield | arbitrage | whale | alpha
  subject      text,                      -- mint, wallet, pair address, …
  score        numeric,                   -- normalized signal strength 0..1
  payload      jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at   timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS research_findings_run_idx
  ON research_findings (run_id);

CREATE INDEX IF NOT EXISTS research_findings_subject_kind_idx
  ON research_findings (subject, kind, created_at DESC);

-- Autoloop mandates: persist between restarts. Read at startup if the table
-- exists; default mandates are seeded by services/research_autoloop.py.
CREATE TABLE IF NOT EXISTS research_mandates (
  name             text PRIMARY KEY,
  kind             text NOT NULL,
  payload          jsonb NOT NULL DEFAULT '{}'::jsonb,
  enabled          boolean NOT NULL DEFAULT TRUE,
  interval_seconds integer,
  created_at       timestamptz NOT NULL DEFAULT NOW(),
  updated_at       timestamptz NOT NULL DEFAULT NOW()
);
