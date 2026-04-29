# 🦞 ClawdVault — Canvas-driven memory vault for OpenClawd

> **Status:** placeholder · planned for a future release · **see [AGENT-TASK.md](./AGENT-TASK.md)** for the full work-plan.

ClawdVault extends `clawvault canvas` with a template system on top of the [JSON Canvas](https://jsoncanvas.org/) spec — Obsidian-style boards, project Kanbans, knowledge-graph overviews — generated from your local OpenClawd memory graph.

This package is currently a planning artifact. The implementation will live in `src/` once the canvas-template engine described in [AGENT-TASK.md](./AGENT-TASK.md) lands.

## Related, already-shipping packages

If you want vault-style memory **today**, use one of these — they're live on npm:

| Package | What it does | Install |
|---|---|---|
| [`@openclawdsolana/vault-mcp`](../mcp/vault-mcp) | MCP server for security-pattern scanning, secret detection, vault ops | `npm i @openclawdsolana/vault-mcp` |
| [`@openclawdsolana/membrain-types`](../packages/membrain-types) | Types + gRPC-web client for the Membrain selective-memory layer | `npm i @openclawdsolana/membrain-types` |

## What lands here when implementation starts

Per [AGENT-TASK.md](./AGENT-TASK.md):

- `src/lib/canvas-templates.ts` — `CanvasTemplate` registry + `registerTemplate()` / `getTemplate()` / `listTemplates()`
- Built-in templates: `default` (current dashboard), `project-board` (Kanban), `brain` (knowledge graph)
- Hooks into the existing `clawvault canvas` command via `--template <id>`
- Filtering by `--project`, `--from`, `--to`

## License

MIT — © OpenClawd contributors
