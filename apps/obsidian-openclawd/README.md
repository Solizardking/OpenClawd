# OpenClawd for Obsidian

Official OpenClawd Obsidian plugin for Solana trading notes, the OpenClawd Memory wiki, Membrain ingestion queues, and Honcho-style memory sessions.

The design is intentionally file-first: markdown files in the vault remain the durable source of truth, and OpenClawd generates derived memory queues from those files. Obsidian is the operator UI; OpenClawd Memory, Membrain, and Honcho are composable downstream layers.

## What It Adds

- Initializes an OpenClawd vault structure for runbooks, research, memory, and submission notes.
- Creates trading memory notes with `openclawd.*` frontmatter.
- Exports active notes into `.openclawd/openclawd-memory-notes.jsonl`.
- Exports active notes into `.openclawd/membrain-ingest.jsonl`.
- Exports Honcho-style peer/session messages into `.openclawd/honcho-session.jsonl`.
- Optionally POSTs exported records to a local OpenClawd bridge.

The plugin is safe for the public hackathon/submission bundle by default: it does not ask for wallet keys or API secrets, and local bridge sync is disabled until an operator enables it.

## Build

```bash
cd apps/obsidian-openclawd
npm install
npm run build
```

This produces the Obsidian plugin files:

- `main.js`
- `manifest.json`
- `styles.css`

## Install Into a Development Vault

```bash
mkdir -p /path/to/vault/.obsidian/plugins/openclawd
cp main.js manifest.json styles.css /path/to/vault/.obsidian/plugins/openclawd/
```

In Obsidian, enable community plugins and turn on `OpenClawd`.

## Commands

- `Initialize OpenClawd vault`
- `Create trading memory note`
- `Export active note to OpenClawd memory queues`
- `Sync active note to local OpenClawd bridge`

## Repository Integration

This plugin adapts the Obsidian sample plugin lifecycle into OpenClawd:

- `onload()` configures ribbon actions, commands, settings, and export queues.
- `onunload()` releases plugin resources.
- `manifest.json` declares the official plugin id `openclawd`.
- `main.ts` maps notes into OpenClawd Memory, Membrain, and Honcho-compatible records.

Mapped local systems:

- `membrain/` - typed, revisable memory substrate and gRPC daemon.
- `membrain/clients/openclawd/` - OpenClawd Membrain bridge concepts mirrored by the Obsidian export schema.
- `memory/honcho_jack/src/openclawd_memory/` - markdown note graph model mirrored by `.openclawd/openclawd-memory-notes.jsonl`.
- `memory/honcho_jack/` - Honcho service and SDK source used as the session export target model.
- `llm-wiki-tang/` - AutoResearch Wiki source that can feed and consume OpenClawd Memory notes.
- `apps/clawd-notes/` - hosted Obsidian-style note surface; this plugin is the native Obsidian counterpart.

## File-First Positioning

This plugin is inspired by Obsidian's local markdown model:

- The vault is ordinary files on disk.
- Export queues are ordinary JSONL files on disk.
- Network sync and hosted memory services are optional.
- Operators keep control of their notes and can rebuild derived memory from the vault.
- Plugin behavior avoids lock-in and dark-pattern defaults.
