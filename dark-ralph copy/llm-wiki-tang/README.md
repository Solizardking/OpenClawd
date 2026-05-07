# llm-wiki-tang

Local OpenClawd AutoResearch API used by `clawd-tui`.

Run it:

```bash
python3 -m uvicorn api.main:app --reload --host 127.0.0.1 --port 8000
```

Then point the TUI at it:

```bash
RESEARCH_API_URL=http://localhost:8000 npm start
```

The service is intentionally offline-safe for demos and local development. It does
not require API keys and returns deterministic research summaries for the
`/research` and `/autoloop` commands.
