# SperaxOS Plugin Documentation

> **Live:** [plugin.delivery](https:plugin.delivery) • **SDK:** `@speraxplugin-sdk`

Build AI-powered plugins for SperaxOS. Extend chat capabilities with custom APIs, OpenAPI integrations, and interactive UIs.

---

## 📚 Documentation Index

### Getting Started

| Guide | Description | Time |
|-------|-------------|------|
| **[🚀 Quick Start](.QUICK_START.md)** | Build your first plugin | 10 min |
| **[📖 Development Guide](.PLUGIN_DEVELOPMENT_GUIDE.md)** | Complete walkthrough | 30 min |
| **[🎨 Plugin Types](.PLUGIN_TYPES.md)** | Choose the right type | 5 min |

### Reference

| Document | Description |
|----------|-------------|
| **[📋 Manifest Reference](.PLUGIN_MANIFEST.md)** | manifest.json specification |
| **[🔌 SDK API Reference](.SDK_API_REFERENCE.md)** | Full SDK documentation |
| **[💬 Communication Guide](.COMMUNICATION_GUIDE.md)** | Plugin ↔ Host messaging |
| **[🌐 OpenAPI Integration](.OPENAPI_INTEGRATION.md)** | Use OpenAPI specs |

### Publishing

| Document | Description |
|----------|-------------|
| **[📤 Submit Your Plugin](.SUBMIT_PLUGIN.md)** | List in the marketplace |

### Advanced

| Document | Description |
|----------|-------------|
| **[🎭 Artifacts Guide](.ARTIFACTS_GUIDE.md)** | Rich interactive content |
| **[🔄 MCP Comparison](.MCP_COMPARISON.md)** | Model Context Protocol vs Plugins |
| **[⚡ Complete Guide](.SPERAXOS_PLUGIN_COMPLETE_GUIDE.md)** | Everything in one doc |

---

## 🎯 Choose Your Path

### "I want to return data for AI to explain"
→ Use **Default** type → [Quick Start](.QUICK_START.md)

### "I want to show formatted texttables"
→ Use **Markdown** type → [Plugin Types](.PLUGIN_TYPES.md#markdown)

### "I want to build interactive UI"
→ Use **Standalone** type → [Plugin Types](.PLUGIN_TYPES.md#standalone)

### "I have an OpenAPI spec already"
→ Use **OpenAPI** type → [OpenAPI Guide](.OPENAPI_INTEGRATION.md)

---

## 🏗️ Plugin Architecture

```
User: "What's the price of ETH?"
           │
           ▼
    ┌──────────────┐
    │   SperaxOS   │ ←── Discovers plugin from index
    │   AI Model   │
    └──────┬───────┘
           │
           ▼ Function Call: getPrice(coin: "ethereum")
    ┌──────────────┐
    │   Gateway    │ ←── Routes, validates, injects settings
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │ Plugin API   │ ←── Your code runs here
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │   Response   │ ←── JSON, Markdown, or UI
    └──────────────┘
```

### Three Plugin Types

| Type | Output | AI Processing | Use Case |
|------|--------|---------------|----------|
| **Default** | JSON | ✅ AI summarizes | Data APIs |
| **Markdown** | Formatted text | ❌ Direct display | Reports, tables |
| **Standalone** | ReactHTML | ❌ Custom UI | Dashboards, tools |

---

## ⚡ Quick Start

```bash
# 1. Clone template
git clone https:github.comsolizardkingplugin.delivery.git
cd plugins
cp -r templatesdefault my-plugin
cd my-plugin

# 2. Install & run
bun install
bun dev

# 3. Test in SperaxOS
# Add custom plugin: http:localhost:3400manifest.json
```

[Full Quick Start Guide →](.QUICK_START.md)

---

## 📦 Templates

| Template | Type | Use Case |
|----------|------|----------|
| [basic](..templatesbasic) | Default | Full-featured with CI |
| [default](..templatesdefault) | Default | Simple backend + UI |
| [markdown](..templatesmarkdown) | Markdown | Formatted output |
| [openapi](..templatesopenapi) | OpenAPI | Auto-generated |
| [settings](..templatessettings) | Default | User preferences |
| [standalone](..templatesstandalone) | Standalone | Interactive UI |

---

## 🔗 Resources

### Packages

| Package | npm |
|---------|-----|
| `@speraxplugin-sdk` | [![npm](https:img.shields.ionpmv@speraxplugin-sdk)](https:www.npmjs.compackage@speraxplugin-sdk) |
| `@speraxchat-plugins-gateway` | [![npm](https:img.shields.ionpmv@speraxchat-plugins-gateway)](https:www.npmjs.compackage@speraxchat-plugins-gateway) |

### Links

| Resource | URL |
|----------|-----|
| Plugin Index | [plugin.delivery](https:plugin.delivery) |
| GitHub | [github.comsolizardkingplugin.delivery](https:github.comsolizardkingplugin.delivery) |
| TwitterX | [@nichxbt](https:x.comnichxbt) |

---

## 🏷️ Plugin Categories

| Category | ID | Examples |
|----------|-----|----------|
| 💰 Stocks & Finance | `stocks-finance` | Crypto prices, trading |
| 🔧 Developer Tools | `developer` | Code tools, APIs |
| 🔍 Information | `information` | Search, lookups |
| 🎨 Media | `media-generate` | Images, video |
| 📚 Education | `science-education` | Learning, research |
| 🎮 Gaming | `gaming` | Games, entertainment |
| 🌍 Lifestyle | `lifestyle` | Travel, weather |

---

## ❓ Need Help?

- **GitHub Issues:** [github.comsolizardkingplugin.deliveryissues](https:github.comsolizardkingplugin.deliveryissues)
- **TwitterX:** [@nichxbt](https:x.comnichxbt)
- **Example Plugin:** [CoinGecko](..srccoingecko.json)

