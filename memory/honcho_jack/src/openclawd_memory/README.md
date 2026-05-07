# OpenClawd Memory

OpenClawd Memory is the lightweight OpenClawd adaptation of the Honcho memory
service. It exposes an Obsidian-style vault model:

- Markdown notes
- tags
- metadata
- `[[wikilinks]]`
- backlinks
- full-text-ish local search
- JSONL persistence for local/dev use

The API is intentionally simple:

```text
POST   /v1/openclawd/memory/notes
GET    /v1/openclawd/memory/notes
GET    /v1/openclawd/memory/notes/{id-or-slug}
DELETE /v1/openclawd/memory/notes/{id-or-slug}
GET    /v1/openclawd/memory/search?q=...
GET    /v1/openclawd/memory/links
GET    /v1/openclawd/memory/health
```

Set `OPENCLAWD_MEMORY_PATH` to choose where the JSONL vault is stored.
Callers can set `OPENCLAWD_MEMORY_URL` to point `llm-wiki-tang` and Dark
Ralph at this service. If no URL is set, those integrations fall back to
local JSONL memory so demos stay offline-safe.

Sources used by the first integrations:

- `llm_wiki`: AutoResearch summaries and run outputs
- `dark_ralph`: OODA-loop ticks and paper-trading decisions
- `manual`: operator-created notes

