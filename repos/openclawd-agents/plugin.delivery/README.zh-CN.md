<div align="center">

# 🔌 Plugin Delivery

**AI Function Call Plugins & Tools for SperaxOS**

[![Deploy with Vercel](https:vercel.combutton)](https:vercel.comnewclone?repository-url=https:github.comsolizardkingplugin.delivery)
[![License: MIT](https:img.shields.iobadgeLicense-MIT-yellow.svg)](https:opensource.orglicensesMIT)
[![npm](https:img.shields.ionpmv@speraxplugin-sdk)](https:www.npmjs.compackage@speraxplugin-sdk)

**Live:** [`plugin.delivery`](https:plugin.delivery)

[📚 Docs](#documentation) • [🚀 Quick Start](#quick-start) • [📦 Templates](#plugin-templates) • [🎨 Plugin Types](#plugin-types) • [🔧 Development](#development)

<div>

---

## What Is Plugin Delivery?

The **official plugin marketplace and SDK** for SperaxOS — a cryptoDeFi-focused AI assistant platform.

| Feature | Description |
|---------|-------------|
| 📋 **Plugin Index** | JSON registry of AI-discoverable plugins |
| ⚡ **Gateway Service** | Secure proxy routing function calls to plugin APIs |
| 🛠️ **SDK** | TypeScript SDK for building custom plugins |
| 🎨 **Templates** | 6 starter templates for different plugin types |
| 🌍 **i18n** | 18 languages supported out of the box |

### How It Works

```
User: "What's the price of ETH?"
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  SperaxOS discovers plugin from plugin.delivery index   │
│  AI generates function call: getPrice(coin: "ethereum") │
│  Gateway routes request to CoinGecko API                │
│  Response rendered in chat (JSON, Markdown, or UI)      │
└─────────────────────────────────────────────────────────┘
         │
         ▼
AI: "ETH is currently trading at $3,450..."
```

---

## Plugin Types

SperaxOS supports **4 distinct plugin types**, each optimized for different use cases:

| Type | Rendering | Best For | Complexity |
|------|-----------|----------|------------|
| **Default** | Server-rendered JSON → AI formats | Data APIs, lookups | ⭐ Simple |
| **Markdown** | Pre-formatted rich text | Documentation, reports | ⭐ Simple |
| **Standalone** | Full ReactHTML app in iframe | Interactive dashboards | ⭐⭐⭐ Advanced |
| **OpenAPI** | Auto-generated from spec | Existing APIs | ⭐⭐ Medium |

### Default Plugins

Returns JSON data that the AI formats into natural language.

```json
{
  "ui": {
    "mode": "default"
  }
}
```

**Use when:** You have an API that returns structured data and want the AI to explain results conversationally.

### Markdown Plugins

Returns pre-formatted Markdown that displays directly in chat.

```json
{
  "ui": {
    "mode": "markdown"
  }
}
```

**Use when:** You want full control over formatting — tables, code blocks, headers, etc.

### Standalone Plugins (Artifacts)

Embeds a full ReactHTML application in an iframe within the chat.

```json
{
  "ui": {
    "mode": "standalone",
    "url": "https:your-plugin.comui",
    "height": 400
  }
}
```

**Use when:** You need rich interactivity — charts, forms, dashboards, embedded apps.

> 💡 **Standalone plugins are SperaxOS's superpower** — they enable experiences beyond what ChatGPT plugins can do.

### OpenAPI Plugins

Auto-generated from an OpenAPI 3.x specification. No custom code needed.

```json
{
  "openapi": "https:your-api.comopenapi.json"
}
```

**Use when:** You already have an OpenAPI spec for your API.

---

## Artifacts, Embeds & Interactive UI

### What Are Artifacts?

Artifacts are **rich interactive content** that plugins can render directly in chat. Unlike plain text responses, artifacts can include:

- 📊 **Charts & Visualizations** (Chart.js, Recharts, D3)
- 📝 **Interactive Forms** (Input fields, buttons, selectors)
- 🎮 **Mini Applications** (Games, calculators, tools)
- 📄 **Rich Documents** (Formatted reports, tables)

### HTML Artifacts

Render raw HTML directly:

```typescript
 In your plugin API response
return {
  type: 'html',
  content: `
    <div style="padding: 20px;">
      <h2>Price Alert<h2>
      <p>ETH crossed $3,500!<p>
    <div>
  `
};
```

### React Artifacts

Render React components (standalone plugins):

```tsx
 uipage.tsx
export default function PriceChart({ data }) {
  return (
    <div className="p-4">
      <LineChart data={data}>
        <Line dataKey="price" stroke="#22c55e" >
      <LineChart>
    <div>
  );
}
```

### iframe Embeds

Embed external content:

```json
{
  "ui": {
    "mode": "standalone",
    "url": "https:tradingview.comchart?symbol=BTCUSD",
    "height": 500
  }
}
```

### Function Calls from UI

Standalone plugins can trigger additional function calls:

```typescript
import { speraxOS } from '@speraxplugin-sdkclient';

 Trigger a new function call from your UI
speraxOS.triggerFunctionCall({
  name: 'getTokenDetails',
  arguments: { token: 'ETH' }
});
```

---

## Plugin Templates

Get started fast with our official templates:

| Template | Type | Description | Use Case |
|----------|------|-------------|----------|
| [**basic**](.templatesbasic) | Default | Standard plugin with API endpoint | Simple data lookups |
| [**default**](.templatesdefault) | Default | Plugin with settings UI | Configurable plugins |
| [**markdown**](.templatesmarkdown) | Markdown | Rich text output | Formatted reports |
| [**openapi**](.templatesopenapi) | OpenAPI | Auto-generated from spec | Existing APIs |
| [**settings**](.templatessettings) | Default | Plugin with user preferences | Personalized tools |
| [**standalone**](.templatesstandalone) | Standalone | Full React application | Interactive dashboards |

### Using a Template

```bash
# Clone template to new directory
cp -r templatesstandalone my-plugin
cd my-plugin

# Install dependencies
bun install

# Start development
bun dev
```

### Template Structure

```
templatesstandalone
├── public
│   └── manifest.json    # Plugin manifest
├── src
│   ├── api            # API endpoints
│   │   └── index.ts    # Main handler
│   └── ui             # React UI (standalone only)
│       └── page.tsx    # UI component
├── package.json
└── README.md
```

---

## Quick Start

### 1. Install the SDK

```bash
bun add @speraxplugin-sdk
# or
npm install @speraxplugin-sdk
```

### 2. Create manifest.json

```json
{
  "$schema": "https:plugin.deliveryschema.json",
  "identifier": "my-crypto-plugin",
  "api": [
    {
      "name": "getPrice",
      "description": "Get cryptocurrency price",
      "url": "https:my-plugin.vercel.appapiprice",
      "parameters": {
        "type": "object",
        "properties": {
          "coin": {
            "type": "string",
            "description": "Coin ID (e.g., bitcoin, ethereum)"
          }
        },
        "required": ["coin"]
      }
    }
  ],
  "meta": {
    "title": "My Crypto Plugin",
    "description": "Get real-time crypto prices",
    "avatar": "🪙",
    "tags": ["crypto", "prices"]
  }
}
```

### 3. Create API Handler

```typescript
 apiprice.ts
export default async function handler(req: Request) {
  const { coin } = await req.json();
  
  const res = await fetch(
    `https:api.coingecko.comapiv3simpleprice?ids=${coin}&vs_currencies=usd`
  );
  const data = await res.json();
  
  return Response.json({
    coin,
    price: data[coin]?.usd,
    timestamp: new Date().toISOString()
  });
}
```

### 4. Deploy & Register

```bash
# Deploy to Vercel
vercel --prod

# Add to plugin index (submit PR or use Plugin Store)
```

---

## Documentation

| Guide | Description |
|-------|-------------|
| [📖 Plugin Development Guide](.docsPLUGIN_DEVELOPMENT_GUIDE.md) | Complete development walkthrough |
| [📋 Plugin Manifest Reference](.docsPLUGIN_MANIFEST.md) | Full manifest.json specification |
| [🎨 Plugin Types Guide](.docsPLUGIN_TYPES.md) | Default, Markdown, Standalone explained |
| [🔌 SDK API Reference](.docsSDK_API_REFERENCE.md) | Client SDK documentation |
| [🌐 OpenAPI Integration](.docsOPENAPI_INTEGRATION.md) | Using OpenAPI specs |
| [💬 Communication Guide](.docsCOMMUNICATION_GUIDE.md) | Plugin ↔ Host messaging |
| [🎭 Artifacts Guide](.docsARTIFACTS_GUIDE.md) | Rich UI components |
| [⚡ Complete Guide](.docsSPERAXOS_PLUGIN_COMPLETE_GUIDE.md) | Everything in one doc |

---

## Available Plugins

### Production

| Plugin | Description | Type | API |
|--------|-------------|------|-----|
| 🪙 **[CoinGecko Crypto](.srccoingecko.json)** | Prices, trends, market data for 1M+ tokens | OpenAPI | Free |

### Coming Soon

| Plugin | Description | Status |
|--------|-------------|--------|
| 📊 **DexScreener** | DEX pairs, volume, liquidity | In Development |
| 📈 **DefiLlama** | Protocol TVL, yields | Planned |
| 💼 **Portfolio Tracker** | Multi-chain wallet aggregation | Planned |
| ⛓️ **Chain Explorer** | Transaction lookup, gas prices | Planned |

---

## Development

### Prerequisites

- **Bun** 1.0+ (recommended) or Node.js 18+
- **Git**

### Setup

```bash
# Clone
git clone https:github.comsolizardkingplugin.delivery.git
cd plugins

# Install
bun install

# Dev server
bun dev
```

### Commands

| Command | Description |
|---------|-------------|
| `bun dev` | Start local dev server |
| `bun build` | Build plugin index |
| `bun test` | Run tests |
| `bun lint` | Lint code |
| `bun format` | Format JSON files |

### Project Structure

```
plugins
├── packages
│   ├── sdk              # @speraxplugin-sdk
│   └── gateway          # @speraxchat-plugins-gateway
├── templates            # Starter templates
│   ├── basic
│   ├── default
│   ├── markdown
│   ├── openapi
│   ├── settings
│   └── standalone
├── public               # Static files (auto-generated)
│   ├── index.json        # Plugin registry
│   └── openai           # OpenAPI manifests
├── src                  # Plugin definitions
├── locales              # i18n translations
├── docs                 # Documentation
└── api                  # Serverless functions
```

---

## Packages

| Package | Description | npm |
|---------|-------------|-----|
| `@speraxplugin-sdk` | Plugin SDK for building SperaxOS plugins | [![npm](https:img.shields.ionpmv@speraxplugin-sdk)](https:www.npmjs.compackage@speraxplugin-sdk) |
| `@speraxchat-plugins-gateway` | Gateway service for routing plugin calls | [![npm](https:img.shields.ionpmv@speraxchat-plugins-gateway)](https:www.npmjs.compackage@speraxchat-plugins-gateway) |

### SDK Usage

```typescript
import { 
  pluginManifestSchema,
  createPluginResponse,
  PluginError 
} from '@speraxplugin-sdk';

 Client-side (in standalone UI)
import { speraxOS } from '@speraxplugin-sdkclient';
```

---

## Gateway

The Plugin Gateway securely routes function calls from SperaxOS to plugin APIs:

```
SperaxOS → Gateway → Plugin API
              │
              ├── Auth injection
              ├── Rate limiting
              ├── Request logging
              └── Response transform
```

### Self-Hosting

```bash
# Clone gateway
cd packagesgateway

# Deploy
vercel --prod

# Set in SperaxOS
PLUGINS_GATEWAY_URL=https:your-gateway.vercel.app
```

---

## Contributing

We welcome contributions! See [CONTRIBUTING.md](.CONTRIBUTING.md).

### Submit a Plugin

1. **Option A:** Open a [Plugin Submission](https:github.comsolizardkingplugin.deliveryissuesnew?template=plugin_submission.md) issue
2. **Option B:** Submit a PR adding your plugin to `src`

### Requirements

- ✅ Valid manifest with working endpoints
- ✅ Tested in SperaxOS
- ✅ No API key required (or documented)
- ✅ en-US locale at minimum

---

## Links

| Resource | URL |
|----------|-----|
| 🌐 **Plugin Index** | [plugin.delivery](https:plugin.delivery) |
| 📦 **SDK on npm** | [@speraxplugin-sdk](https:www.npmjs.compackage@speraxplugin-sdk) |
| 🐙 **GitHub** | [github.comsolizardkingplugin.delivery](https:github.comsolizardkingplugin.delivery) |
| 🐦 **TwitterX** | [@nichxbt](https:x.comnichxbt) |

---

## License

MIT © [Sperax](https:sperax.io)

---

<div align="center">

**[🔌 plugin.delivery](https:plugin.delivery)** — AI Function Calls for the Crypto Era

Built with ❤️ by [nich](https:x.comnichxbt)

<div>

