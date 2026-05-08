# OpenClawd Obsidian Integration

`apps/obsidian-openclawd/` is the official OpenClawd Obsidian plugin.

It adapts the standard Obsidian plugin lifecycle into a local-first OpenClawd memory workflow. The design follows the same file-first philosophy that makes Obsidian valuable for operators: markdown files are the canonical artifact, and every agent memory layer is derived from files the user controls.

- `onload()` registers commands, ribbon actions, settings, and export queues.
- `onunload()` logs plugin unload and leaves no background resources running.
- `manifest.json` uses the official plugin id `openclawd`.
- `main.ts` maps markdown notes into OpenClawd Memory wiki notes, Membrain records, and Honcho session messages.

## Memory Stack Mapping

| Repo path | Plugin role |
| --- | --- |
| `membrain/` | Defines typed memory records, decay, revisability, retrieval, and the daemon target. |
| `membrain/api` | Future local bridge can translate exported JSONL into gRPC ingestion calls. |
| `membrain/clients/openclawd` | Existing OpenClawd Membrain plugin concepts mirrored in Obsidian export metadata. |
| `membrain/pkg/schema` | Memory types used by note frontmatter: `episodic`, `working`, `semantic`, `competence`, `plan_graph`. |
| `memory/honcho_jack` | Honcho source model for peer/session message export. |
| `memory/honcho_jack/src/openclawd_memory` | OpenClawd Memory note graph model: markdown notes, tags, metadata, wikilinks, backlinks, search, and JSONL persistence. |
| `memory/honcho_jack/sdks` | SDK target for a future online sync bridge. |
| `llm-wiki-tang` | AutoResearch Wiki. Its research summaries can be represented as OpenClawd Memory notes with `source: llm_wiki`. |
| `apps/clawd-notes` | Hosted note app; the Obsidian plugin is the native-vault counterpart. |

## Public Safety

The plugin does not store API keys, private keys, wallet keypairs, populated env files, or hidden wallet material. By default it only writes vault-local markdown and JSONL queues:

- `.openclawd/openclawd-memory-notes.jsonl` for the OpenClawd Memory wiki
- `.openclawd/membrain-ingest.jsonl` for Membrain typed memory
- `.openclawd/honcho-session.jsonl` for Honcho-style session replay

Local bridge sync is opt-in from plugin settings.

## Wiki To Memory To Membrain

The plugin treats the Obsidian vault as the source wiki. Exporting a note produces:

1. An OpenClawd Memory note record compatible with `MemoryNoteCreate`.
2. A Membrain record with `memory_type`, `sensitivity`, `subject`, `agent`, links, tags, and provenance.
3. A Honcho-style message with workspace, session, peer, source path, and metadata.

This preserves the user's plain markdown while still giving agents structured memory.
