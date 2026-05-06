#!/usr/bin/env node

// Thin shim that defers to @openclawdsolana/cli's binary (ESM).
// Keeps this package as an alias while ensuring the same behavior.
import '@openclawdsolana/cli';
