# OpenClawd Plugin Ordering System

This directory contains comprehensive tests and documentation for OpenClawd's plugin ordering system, which ensures that embedding-capable plugins are always loaded last to serve as fallbacks.

## Overview

OpenClawd uses a sophisticated plugin loading system that automatically detects available API keys and services, then loads plugins in a specific order to ensure proper fallback behavior for embeddings.

### Key Principles

1. **Embedding Plugins Last**: Plugins that support embeddings (OpenAI, Ollama, Google GenAI) are always loaded with the lowest priority
2. **Ollama as Universal Fallback**: Ollama is always included as a fallback for local AI capabilities
3. **Text-Only Plugins First**: Providers without embedding support (Anthropic) load before embedding-capable plugins
4. **Environment-Driven**: Plugin selection is automatic based on available environment variables

## Plugin Categories

### 🗄️ Core Plugins

- `@openclawdsolana/plugin-sql` - Always loaded first, provides database functionality

### 📝 Text-Only AI Plugins (No Embedding Support)

- `@openclawdsolana/plugin-anthropic` - Claude models (text generation only)

### 🌐 Platform Plugins

- `@openclawdsolana/plugin-discord` - Discord integration
- `@openclawdsolana/plugin-twitter` - Twitter integration (requires 4 API tokens)
- `@openclawdsolana/plugin-telegram` - Telegram bot integration

### 🚀 Bootstrap Plugin

- `@openclawdsolana/plugin-bootstrap` - Default event handlers, actions, and providers

### 🧠 Embedding-Capable AI Plugins (Always Last)

- `@openclawdsolana/plugin-openai` - GPT models + embeddings
- `@openclawdsolana/plugin-google-genai` - Gemini models + embeddings
- `@openclawdsolana/plugin-ollama` - Local models + embeddings (always included as fallback)

## Plugin Loading Order

The system loads plugins in this strict order:

```
1. Core Plugins (SQL)
2. Text-Only AI Plugins (Anthropic)
3. Embedding-Capable AI Plugins (OpenRouter, OpenAI, Ollama, Google)
4. Platform Plugins (Discord, Twitter, Telegram)
5. Bootstrap Plugin
```

## Environment Detection Logic

### AI Provider Detection

```typescript
// Text-only providers (loaded first)
...(process.env.ANTHROPIC_API_KEY ? ['@openclawdsolana/plugin-anthropic'] : []),

// Embedding providers (loaded after text-only)
...(process.env.OPENROUTER_API_KEY ? ['@openclawdsolana/plugin-openrouter'] : []),
...(process.env.OPENAI_API_KEY ? ['@openclawdsolana/plugin-openai'] : []),
...(process.env.OLLAMA_API_ENDPOINT ? ['@openclawdsolana/plugin-ollama'] : []),
...(process.env.GOOGLE_GENERATIVE_AI_API_KEY ? ['@openclawdsolana/plugin-google-genai'] : []),

```

### Platform Plugin Detection

```typescript
...(process.env.DISCORD_API_TOKEN ? ['@openclawdsolana/plugin-discord'] : []),
...(process.env.TELEGRAM_BOT_TOKEN ? ['@openclawdsolana/plugin-telegram'] : []),

// Twitter requires ALL 4 tokens
...(process.env.TWITTER_API_KEY &&
    process.env.TWITTER_API_SECRET_KEY &&
    process.env.TWITTER_ACCESS_TOKEN &&
    process.env.TWITTER_ACCESS_TOKEN_SECRET
      ? ['@openclawdsolana/plugin-twitter']
      : []),
```

## Test Files

### `character-plugin-ordering.test.ts`

Comprehensive test suite covering:

- Core plugin ordering
- Ollama fallback behavior
- Embedding plugin priority
- Complex environment combinations
- Edge cases and validation

### `plugin-ordering-demo.ts`

Interactive demonstration script showing:

- 9 different environment scenarios
- Visual plugin ordering output
- Automatic validation of ordering rules
- Real-time environment variable testing

## Running Tests

### Run Plugin Ordering Tests

```bash
# CLI package tests
cd packages/cli
bun test src/__tests__/character-plugin-ordering.test.ts

# Project starter tests
cd packages/project-starter
bun test src/__tests__/character-plugin-ordering.test.ts
```

### Run Interactive Demo

```bash
cd packages/cli
bun run src/__tests__/plugin-ordering-demo.ts
```

## Test Scenarios Covered

### 1. No AI Providers

- **Environment**: Clean (no API keys)
- **Result**: SQL → Bootstrap → Ollama
- **Validation**: Ollama serves as fallback

### 2. Anthropic Only

- **Environment**: `ANTHROPIC_API_KEY`
- **Result**: SQL → Anthropic → Bootstrap
- **Validation**: No embedding plugin needed (Anthropic handles text only)

### 3. OpenAI Only

- **Environment**: `OPENAI_API_KEY`
- **Result**: SQL → Bootstrap → OpenAI
- **Validation**: OpenAI handles both text and embeddings

### 4. Mixed Providers

- **Environment**: `ANTHROPIC_API_KEY` + `OPENAI_API_KEY`
- **Result**: SQL → Anthropic → Bootstrap → OpenAI
- **Validation**: Text-only first, embedding-capable last

### 5. All Providers

- **Environment**: All AI provider keys
- **Result**: SQL → Anthropic → Bootstrap → OpenRouter → OpenAI → Ollama → Google
- **Validation**: Ollama included for local AI fallback

### 6. Platform Integration

- **Environment**: AI providers + Discord/Twitter/Telegram
- **Result**: Core → AI Text → Platforms → Bootstrap → AI Embedding
- **Validation**: Platform plugins properly positioned

### 7. Bootstrap Disabled

- **Environment**: `IGNORE_BOOTSTRAP=true`
- **Result**: Only core and AI plugins loaded
- **Validation**: Bootstrap correctly excluded

## Validation Rules

The test suite validates these critical rules:

1. ✅ **SQL Always First**: `@openclawdsolana/plugin-sql` must be the first plugin
2. ✅ **AI Plugin Order**: Text-only plugins (Anthropic) load before embedding-capable plugins (OpenRouter, OpenAI, Ollama, Google)
3. ✅ **Ollama Fallback**: Always present as universal fallback
4. ✅ **Platform After AI**: Platform plugins load after all AI plugins
5. ✅ **Bootstrap Last**: Bootstrap loads after all other plugins (unless disabled)
6. ✅ **No Duplicates**: Each plugin appears exactly once
7. ✅ **Consistent Ordering**: Same environment produces same plugin order

## Why This Matters

### Embedding Fallback Strategy

When a primary AI provider (like Anthropic/Claude) doesn't support embeddings:

1. The text-only plugin handles chat/generation
2. An embedding-capable plugin provides embeddings
3. Plugin order ensures the right plugin handles each request type

### Example: Anthropic + OpenAI Setup

```typescript
plugins: [
  '@openclawdsolana/plugin-sql', // Database
  '@openclawdsolana/plugin-anthropic', // Primary AI (text only)
  '@openclawdsolana/plugin-openai', // Embedding fallback
  '@openclawdsolana/plugin-bootstrap', // Default handlers
];
```

When OpenClawd needs:

- **Text generation**: Anthropic handles it (higher priority)
- **Embeddings**: OpenAI handles it (only embedding provider)

### Example: OpenAI Only Setup

```typescript
plugins: [
  '@openclawdsolana/plugin-sql', // Database
  '@openclawdsolana/plugin-openai', // Handles both text and embeddings
  '@openclawdsolana/plugin-bootstrap', // Default handlers
];
```

OpenAI handles both text generation and embeddings since it's the only AI provider.

## Files Using This System

This plugin ordering logic is implemented consistently across:

- `packages/cli/src/characters/openclawd.ts` - CLI character
- `packages/project-starter/src/character.ts` - Project template
- `packages/project-tee-starter/src/character.ts` - TEE project template
- `AGENTS.md` - Documentation examples

All use identical logic to ensure consistent behavior across the OpenClawd ecosystem.

## Contributing

When adding new plugins:

1. **Determine Category**: Is it core, AI (text/embedding), platform, or utility?
2. **Place Correctly**: Add to appropriate section in plugin array
3. **Add Tests**: Include test cases in the plugin ordering test suite
4. **Update Demo**: Add scenario to `plugin-ordering-demo.ts` if relevant
5. **Document**: Update this README with new plugin information

## Troubleshooting

### Common Issues

**Q: Why isn't my AI plugin loading?**
A: Check environment variables are set correctly and match the expected names.

**Q: Why is Ollama always loading?**
A: Ollama is always included as a universal fallback for local AI capabilities, regardless of other providers.

**Q: Why isn't Twitter loading?**
A: Twitter requires ALL 4 environment variables: API key, secret, access token, and access token secret.

**Q: Plugin order seems wrong?**
A: Run the demo script to see actual ordering and validation results:

```bash
bun run src/__tests__/plugin-ordering-demo.ts
```

### Debugging Plugin Loading

Use the demo script to diagnose plugin loading issues:

1. Set your environment variables
2. Run the demo to see actual vs expected plugin order
3. Check validation results for specific issues
4. Verify environment variable names match expected patterns

The demo provides detailed output showing which plugins loaded and why, making it easy to troubleshoot configuration issues.
