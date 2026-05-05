---
name: clawd-tui
description: Alias of the `clawd` skill — full package name `@openclawdsolana/clawd-tui`. Use when the user types `/clawd-tui <args>` instead of `/clawd <args>`. Same scope as `clawd`: TUI install, env vars, in-TUI slash commands (/model, /trending, /search, /wallet, /asset, /holders, /research, /autoloop, /deepseek, /deepseek-fim, /deepseek-balance, /deepseek-models), OAuth, on-paste Solana analysis.
user-invocable: true
---

# clawd-tui (alias of `clawd`)

This skill is an alias. `clawd` and `clawd-tui` are the two binaries exposed
by [`@openclawdsolana/clawd-tui`](https://www.npmjs.com/package/@openclawdsolana/clawd-tui),
and either invocation should reach the same context.

**For all guidance, defer to the [`clawd` skill](../clawd/SKILL.md).** Read
that skill first when responding to `/clawd-tui <args>`. The split exists
purely so users can type either command name and get the same help.

If anything in `clawd/SKILL.md` conflicts with the code, the code in
[`clawd-tui/`](../../../clawd-tui/) wins — that skill is a fast lookup table
on top of the source, and the source can drift faster than the skill.
