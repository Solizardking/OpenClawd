# Official Obsidian Plugin Submission

OpenClawd for Obsidian is the official native-vault submission surface for OpenClawd memory.

It is built from a file-first philosophy: the vault is local markdown, the plugin is a composable view/action layer, and every memory system receives rebuildable derived records instead of owning the operator's notes.

It turns an Obsidian vault into a safe, local-first command journal for Solana financial agents:

- Operators write trading research, runbooks, wallet observations, and agent outcomes in markdown.
- The plugin exports notes into OpenClawd Memory wiki records.
- The plugin exports notes into Membrain-compatible typed records.
- The plugin exports notes into Honcho-style peer/session messages.
- The plugin keeps all export queues vault-local unless an operator enables a local bridge.

## Demo Path

1. Build the plugin from `apps/obsidian-openclawd`.
2. Copy `main.js`, `manifest.json`, and `styles.css` into a development vault at `.obsidian/plugins/openclawd/`.
3. Enable the `OpenClawd` plugin.
4. Run `Initialize OpenClawd vault`.
5. Create a trading memory note.
6. Export the active note to `.openclawd/openclawd-memory-notes.jsonl`, `.openclawd/membrain-ingest.jsonl`, and `.openclawd/honcho-session.jsonl`.

## Why It Matters

OpenClawd already has a hosted notes app, an AutoResearch Wiki, Membrain typed memory, and Honcho-style persistent sessions. The Obsidian plugin makes that stack available in the place many operators already keep research: a local markdown vault.

The submission stays public-safe by design. It does not require credentials, does not sign transactions, and does not store wallet secrets.
