# openclawd

Alias package for `@openclawdsolana/cli` that provides the same `openclawd` command-line interface.

## What is this?

This package exists as a convenience alias on npm so you can install and run the OpenClawd CLI using either name:

- `@openclawdsolana/cli` (canonical)
- `openclawd` (alias)

Both resolve to the exact same CLI and features.

## Install

Global install:

```bash
bun i -g openclawd
# or
bun i -g @openclawdsolana/cli
```

Local (dev dependency):

```bash
bun add -d openclawd
# or
bun add -d @openclawdsolana/cli
```

## Usage

```bash
# Show version
openclawd --version

# Create a new project/plugin/agent
openclawd create

# Start your project
openclawd start

# Manage agents
openclawd agent list
```

All CLI commands and options are identical to `@openclawdsolana/cli`.

## How it works

This package depends on `@openclawdsolana/cli` and provides a small shim binary that delegates execution to the CLI entrypoint. It is published together with `@openclawdsolana/cli` so versions always match.

## License

MIT
