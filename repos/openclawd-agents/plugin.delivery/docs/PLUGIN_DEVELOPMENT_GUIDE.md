# SperaxOS Plugin Development Guide

> **Version:** 2.0.0  
> **Last Updated:** December 27, 2025  
> **Domain:** `plugin.delivery`  
> **Repository:** `solizardkingplugin.delivery`

This comprehensive guide covers everything you need to know about developing, deploying, and maintaining plugins for SperaxOS.

---

## Table of Contents

1. [Quick Start](#1-quick-start)
2. [Architecture Overview](#2-architecture-overview)
3. [Plugin Types](#3-plugin-types)
4. [Plugin Manifest](#4-plugin-manifest)
5. [Plugin Index](#5-plugin-index)
6. [Development Workflow](#6-development-workflow)
7. [Server-Side Implementation](#7-server-side-implementation)
8. [Frontend UI Implementation](#8-frontend-ui-implementation)
9. [OpenAPI Integration](#9-openapi-integration)
10. [Communication Mechanism](#10-communication-mechanism)
11. [Model Compatibility](#11-model-compatibility)
12. [Build Commands](#12-build-commands)
13. [Deployment & Publishing](#13-deployment--publishing)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. Quick Start

Build and deploy your first plugin in 10 minutes.

### Prerequisites

- Node.js 18+
- Package manager: `pnpm`, `npm`, `yarn`, or `bun`
- Basic knowledge of TypeScriptJavaScript

### Option 1: Use a Template

The fastest way to start:

```bash
# Copy the OpenAPI template
cp -r templatesopenapi my-plugin
cd my-plugin

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Server runs at `http:localhost:3400`

### Option 2: Build from Scratch

Initialize your project:

```bash
mkdir my-plugin && cd my-plugin
pnpm init
pnpm add @speraxplugin-sdk @speraxchat-plugins-gateway
pnpm add -D typescript @typesnode
```

Create `publicmanifest.json`:

```json
{
  "$schema": "https:unpkg.com@speraxplugin-sdkschema.json",
  "identifier": "my-plugin",
  "api": [
    {
      "url": "http:localhost:3000apihello",
      "name": "sayHello",
      "description": "Say hello to someone",
      "parameters": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "description": "Name of the person to greet"
          }
        },
        "required": ["name"]
      }
    }
  ],
  "gateway": "http:localhost:3000apigateway",
  "meta": {
    "avatar": "👋",
    "title": "Hello Plugin",
    "description": "A simple greeting plugin"
  }
}
```

Create `apihello.ts`:

```typescript
import { PluginErrorType, createErrorResponse } from '@speraxplugin-sdk';

export const config = { runtime: 'edge' };

interface RequestBody {
  name: string;
}

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return createErrorResponse(PluginErrorType.MethodNotAllowed);
  }

  try {
    const { name } = (await req.json()) as RequestBody;
    const greeting = `Hello, ${name}! Welcome to my plugin.`;

    return new Response(JSON.stringify({ greeting }), {
      headers: { 'Content-Type': 'applicationjson' },
    });
  } catch (error) {
    return createErrorResponse(PluginErrorType.PluginServerError, {
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
```

Create `apigateway.ts`:

```typescript
import { createSperaxChatPluginGateway } from '@speraxchat-plugins-gateway';

export const config = { runtime: 'edge' };

export default createSperaxChatPluginGateway();
```

### Testing Locally

Start your server and test:

```bash
pnpm dev

# Test manifest
curl http:localhost:3400manifest.json

# Test API directly
curl -X POST http:localhost:3400apihello \
  -H "Content-Type: applicationjson" \
  -d '{"name": "Test"}'
```

Add to SperaxOS:
1. Go to Settings → Plugins
2. Click "Add Custom Plugin"
3. Enter: `http:localhost:3400manifest.json`

### Next Steps

Continue reading for detailed documentation on [Architecture Overview](#2-architecture-overview), [Plugin Types](#3-plugin-types), and more.

---

## 2. Architecture Overview

---

## 1. Architecture Overview

### Plugin System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SPERAXOS CLIENT                                 │
│                                                                              │
│  ┌────────────────┐    ┌────────────────┐    ┌────────────────┐            │
│  │    Chat UI     │    │  Plugin Store  │    │  Agent Config  │            │
│  └───────┬────────┘    └───────┬────────┘    └───────┬────────┘            │
│          │                     │                     │                      │
│          └─────────────────────┴─────────────────────┘                      │
│                                │                                            │
│                    ┌───────────┴───────────┐                                │
│                    │   Plugin Manager      │                                │
│                    │  - Load manifests     │                                │
│                    │  - Route requests     │                                │
│                    │  - Render UI          │                                │
│                    └───────────┬───────────┘                                │
│                                │                                            │
└────────────────────────────────┼────────────────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │    Plugin Gateway       │
                    │  plugin.delivery        │
                    └────────────┬────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│  Plugin Server  │   │  OpenAPI Server │   │  External APIs  │
│  (Next.jsEdge) │   │  (CoinGecko,etc)│   │  (3rd Party)    │
└─────────────────┘   └─────────────────┘   └─────────────────┘
```

### Plugin Ecosystem Components

| Component | Repository | Purpose |
|-----------|------------|---------|
| **Plugin Index** | `solizardkingplugin.delivery` | Plugin marketplace registry |
| **Plugin SDK** | `@speraxplugin-sdk` | Development toolkit |
| **Plugin Gateway** | `@speraxchat-plugins-gateway` | Request proxy service |
| **Plugin Templates** | `templates` | Starter project templates |

### Data Flow: Function Call Mechanism

```
User: "What's the price of Bitcoin?"
         │
         ▼
┌─────────────────┐
│   LLM Model     │◄── Plugin descriptions in system prompt
└────────┬────────┘
         │ Generates Function Call
         ▼
┌─────────────────┐
│  Tool Router    │◄── Matches function to plugin
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ Plugin Gateway  │────►│  Plugin Server  │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │◄──────────────────────┘ JSON Response
         ▼
┌─────────────────┐
│   LLM Model     │◄── Processes response
└────────┬────────┘
         │
         ▼
User: "Bitcoin is currently $96,500 USD, up 2.3% in the last 24h"
```

---

## 2. Plugin Types

SperaxOS supports three distinct plugin types, each suited for different use cases:

### 2.1 Default Plugin

The standard plugin type for backend-driven functionality.

**Characteristics:**
- AI processes and summarizes the plugin's response
- Backend processing with GPT integration
- Simple display without complex interaction
- Compatible with ChatGPT plugins

**Use Cases:**
- Content summarization (web crawlers)
- Data retrieval (search engines, APIs)
- Simple queries (weather, prices)

**Example:**
```json
{
  "type": "default"
}
```

### 2.2 Markdown Plugin

For plugins returning formatted, final content.

**Characteristics:**
- Returns Markdown directly displayed in chat
- Does NOT trigger AI summarization by default
- Quick, formatted responses
- Avoids unnecessary AI processing

**Use Cases:**
- Timedate queries
- Formatted data tables
- Clear, specific answers
- Documentation lookups

**Configuration:**
```json
{
  "type": "markdown"
}
```

**Response Format:**
```typescript
export default async (req: Request) => {
  const result = `
## Current Time
**Location:** New York
**Time:** 3:45 PM EST
**Date:** December 27, 2025
  `;
  
  return new Response(result, {
    headers: { 'Content-Type': 'textplain' }
  });
};
```

### 2.3 Standalone Plugin

For complex, interactive applications.

**Characteristics:**
- Complete control over interaction logic
- Can trigger AI messages programmatically
- Full frontend application capabilities
- Independent of conversation flow

**Use Cases:**
- Forms and data entry
- Games and interactive experiences
- Multi-step workflows
- Custom visualization dashboards

**Configuration:**
```json
{
  "type": "standalone"
}
```

### Choosing the Right Type

| Scenario | Recommended Type |
|----------|-----------------|
| API data that needs AI explanation | `default` |
| Quick, formatted responses | `markdown` |
| Interactive UI with buttonsforms | `standalone` |
| ChatGPT plugin compatibility | `default` |
| Pure frontend application | `standalone` |

---

## 3. Plugin Manifest

The manifest file (`manifest.json`) is the plugin's configuration file that describes its identity, capabilities, and behavior.

### Complete Manifest Schema

```json
{
  "$schema": "https:plugin.deliveryschema.json",
  "identifier": "unique-plugin-id",
  "api": [
    {
      "url": "https:your-server.comapiendpoint",
      "name": "functionName",
      "description": "What this function does (sent to LLM)",
      "parameters": {
        "type": "object",
        "properties": {
          "param1": {
            "type": "string",
            "description": "Parameter description"
          }
        },
        "required": ["param1"]
      }
    }
  ],
  "ui": {
    "url": "https:your-server.comui",
    "height": 400,
    "width": 600
  },
  "gateway": "http:localhost:3400apigateway",
  "type": "default",
  "version": "1",
  "settings": {
    "type": "object",
    "properties": {
      "apiKey": {
        "type": "string",
        "title": "API Key",
        "description": "Your API key for authentication"
      }
    }
  }
}
```

### Field Reference

| Field | Required | Description |
|-------|----------|-------------|
| `identifier` | ✅ | Unique plugin ID (globally unique) |
| `api` | ✅ | Array of API endpoints |
| `api[].url` | ✅ | Endpoint URL |
| `api[].name` | ✅ | Function name for LLM |
| `api[].description` | ✅ | Description for LLM |
| `api[].parameters` | ✅ | JSON Schema for parameters |
| `ui` | ❌ | Optional UI configuration |
| `ui.url` | ❌ | URL for iframe UI |
| `ui.height` | ❌ | iframe height in pixels |
| `ui.width` | ❌ | iframe width in pixels |
| `gateway` | ❌ | Custom gateway URL (local dev) |
| `type` | ❌ | Plugin type (`default``markdown``standalone`) |
| `version` | ✅ | Manifest version (currently `"1"`) |
| `settings` | ❌ | JSON Schema for user settings |

### OpenAPI Manifest (Alternative)

For plugins using OpenAPI specification:

```json
{
  "api": {
    "type": "openapi",
    "url": "https:your-server.comopenapi.json"
  },
  "auth": {
    "type": "none"
  },
  "contact_email": "contact@example.com",
  "description_for_human": "User-visible description",
  "description_for_model": "LLM instructions for using this plugin",
  "legal_info_url": "https:example.comterms",
  "logo_url": "https:example.comlogo.png",
  "name_for_human": "Plugin Display Name",
  "name_for_model": "plugin_function_name",
  "schema_version": "v1"
}
```

---

## 4. Plugin Index

The plugin index (`publicindex.json`) is the registry that SperaxOS uses to discover and display plugins.

### Index Structure

```json
{
  "schemaVersion": 1,
  "name": "SperaxOS Plugins",
  "description": "The official plugin marketplace for SperaxOS",
  "author": "Sperax",
  "homepage": "https:sperax.io",
  "repository": "https:github.comsolizardkingplugin.delivery",
  "plugins": [
    {
      "author": "CoinGecko",
      "createdAt": "2025-12-27",
      "homepage": "https:www.coingecko.com",
      "identifier": "coingecko",
      "manifest": "https:plugin.deliveryopenaicoingeckomanifest.json",
      "meta": {
        "avatar": "https:example.comlogo.png",
        "description": "Plugin description for users",
        "tags": ["crypto", "prices", "market-data"],
        "title": "CoinGecko",
        "category": "stocks-finance"
      },
      "schemaVersion": 1
    }
  ],
  "tags": ["crypto", "search", "tools"]
}
```

### Plugin Entry Fields

| Field | Description |
|-------|-------------|
| `author` | Plugin author name |
| `createdAt` | Creation date (YYYY-MM-DD) |
| `homepage` | Project homepage URL |
| `identifier` | Unique plugin identifier |
| `manifest` | URL to plugin manifest.json |
| `meta.avatar` | Plugin icon URL or emoji |
| `meta.description` | User-facing description |
| `meta.tags` | Array of tag strings |
| `meta.title` | Display title |
| `meta.category` | Plugin category |

### Categories

| Category | Description |
|----------|-------------|
| `stocks-finance` | Financial, crypto, trading |
| `web-search` | Search engines, web crawlers |
| `tools` | Utilities, productivity |
| `media-generate` | Image, video, audio generation |
| `science-education` | Learning, research |
| `gaming-entertainment` | Games, fun |
| `lifestyle` | Travel, weather, personal |
| `social` | Social media, communication |

### Adding a Plugin to the Index

> ⚠️ **BUILD WILL FAIL** if you skip step 2. Both files are required.

1. Create plugin definition in `srcyour-plugin.json`
2. **REQUIRED:** Create `localesyour-plugin.en-US.json` with the `meta` object (title, description, tags)
3. Run `bun run format` to generate all locale translations (requires `OPENAI_API_KEY`)
4. Run `bun run build` to generate index
5. Deploy to Vercel

**Minimum required files:**
```
srcyour-plugin.json           # Plugin definition
localesyour-plugin.en-US.json  # REQUIRED - English locale
localesyour-plugin.*.json      # Auto-generated by bun run format
```

For detailed submission instructions, see [Submit Your Plugin](.SUBMIT_PLUGIN.md).

---

## 5. Development Workflow

### Template Usage

We provide plugin templates for you to quickly get started. The templates use Next.js as the development framework.

#### Template Directory Structure

```text
templates
├── basic              # Minimal starter template
├── default            # Standard plugin with UI
├── markdown           # Returns formatted Markdown
├── openapi            # Uses OpenAPI specification
├── settings           # Plugin with user settings
└── standalone         # Interactive React application
```

#### Core Template Structure

Each template follows this structure:

```text
template-name
├── public
│   └── manifest-dev.json        # Manifest file for development
├── src
│   └── pages
│       ├── api                 # Server-side API folder
│       │   ├── endpoint.ts      # Implementation of your API
│       │   └── gateway.ts       # Local plugin proxy gateway
│       └── index.tsx            # Frontend display interface
├── package.json
└── tsconfig.json
```

### Creating a Plugin from a Template

#### Step 1: Copy the Template

You can copy a template directly:

```bash
cp -r templatesdefault my-plugin
cd my-plugin
```

Or clone the repository and start from there:

```bash
git clone https:github.comsolizardkingplugin.delivery.git
cd plugin.delivery
cp -r templatesopenapi ..my-plugin
cd ..my-plugin
```

#### Step 2: Customize the Template

After copying the template, you need to customize it for your plugin:

1. **Replace the identifier**: Use a global search for `plugin-identifier` (or the template's identifier) and replace it with your unique identifier, e.g., `my-awesome-plugin`.

2. **Update the manifest**: Edit `publicmanifest-dev.json` with your:
   - Plugin identifier
   - API endpoints
   - UI configuration
   - Metadata (title, description, avatar)

3. **Modify README.md**: Replace the template README with your own content:
   - Project title and icon
   - Description of what your plugin does
   - Usage instructions
   - Feature descriptions

#### Step 3: Implement Your Logic

Replace the template's placeholder implementation with your actual functionality:

- **API endpoints**: Implement your server-side logic in `srcpagesapi`
- **Frontend UI**: Customize the UI in `srcpagesindex.tsx` (if applicable)
- **Types**: Define your TypeScript interfaces for requestresponse data

### Quick Start

```bash
# Copy a template (choose one)
cp -r templatesopenapi my-plugin     # OpenAPI-based
cp -r templatesmarkdown my-plugin    # Markdown output
cp -r templatesstandalone my-plugin  # Interactive React

cd my-plugin

# Install dependencies
npm install

# Start development server
npm run dev
```

### Project Structure

```
my-plugin
├── public
│   ├── manifest.json          # Production manifest
│   └── manifest-dev.json      # Development manifest (with gateway)
├── src
│   └── pages
│       ├── api
│       │   ├── your-endpoint.ts   # API implementation
│       │   └── gateway.ts         # Local gateway (dev only)
│       └── index.tsx              # UI component (optional)
├── package.json
└── tsconfig.json
```

### Development Manifest

For local development, use a manifest with the gateway field:

```json
{
  "identifier": "my-plugin",
  "api": [
    {
      "url": "http:localhost:3400apiyour-endpoint",
      "name": "myFunction",
      "description": "Description for the LLM",
      "parameters": {
        "type": "object",
        "properties": {
          "query": {
            "type": "string",
            "description": "Search query"
          }
        },
        "required": ["query"]
      }
    }
  ],
  "gateway": "http:localhost:3400apigateway",
  "version": "1"
}
```

### Local Testing Steps

1. Start your plugin: `npm run dev`
2. Open SperaxOS → Agent Settings → Plugins
3. Click "Add Custom Plugin"
4. Enter: `http:localhost:3400manifest-dev.json`
5. Save and test in chat

---

## 6. Server-Side Implementation

### Basic API Endpoint

```typescript
 srcpagesapiyour-endpoint.ts
import { PluginErrorType, createErrorResponse } from '@speraxplugin-sdk';

export const config = {
  runtime: 'edge',
};

interface RequestBody {
  query: string;
}

export default async (req: Request) => {
   Validate method
  if (req.method !== 'POST') {
    return createErrorResponse(PluginErrorType.MethodNotAllowed);
  }

  try {
     Parse request body
    const body: RequestBody = await req.json();
    const { query } = body;

     Your logic here
    const result = await fetchExternalData(query);

     Return JSON response
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'applicationjson' },
    });
  } catch (error) {
    return createErrorResponse(
      PluginErrorType.PluginServerError,
      (error as Error).message
    );
  }
};

async function fetchExternalData(query: string) {
   Example: Call external API
  const response = await fetch(`https:api.example.comsearch?q=${query}`);
  return response.json();
}
```

### Plugin Gateway (Local Development)

```typescript
 srcpagesapigateway.ts
import { createSperaxChatPluginGateway } from '@speraxchat-plugins-gateway';

export const config = {
  runtime: 'edge',
};

export default createSperaxChatPluginGateway();
```

### Accessing Plugin Settings

```typescript
import { getPluginSettingsFromRequest } from '@speraxplugin-sdk';

export default async (req: Request) => {
   Get user-configured settings
  const settings = getPluginSettingsFromRequest<{
    apiKey: string;
  }>(req);

  if (!settings?.apiKey) {
    return createErrorResponse(PluginErrorType.PluginSettingsInvalid);
  }

   Use settings.apiKey in your API calls
   ...
};
```

### Error Types

| Error Type | Description |
|------------|-------------|
| `MethodNotAllowed` | Invalid HTTP method |
| `PluginServerError` | Server-side error |
| `PluginSettingsInvalid` | Missinginvalid settings |
| `PluginGatewayError` | Gateway proxy error |
| `PluginApiNotFound` | API endpoint not found |
| `PluginApiParamsError` | Invalid parameters |

---

## 7. Frontend UI Implementation

### Basic UI Component

```tsx
 srcpagesindex.tsx
import { fetchPluginMessage } from '@speraxplugin-sdk';
import { memo, useEffect, useState } from 'react';

interface PluginData {
  results: Array<{ id: string; name: string }>;
}

const PluginUI = memo(() => {
  const [data, setData] = useState<PluginData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPluginMessage<PluginData>()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...<div>;
  if (!data) return <div>No data available<div>;

  return (
    <div style={{ padding: 16 }}>
      <h2>Results<h2>
      <ul>
        {data.results.map((item) => (
          <li key={item.id}>{item.name}<li>
        ))}
      <ul>
    <div>
  );
});

export default PluginUI;
```

### SDK Communication Methods

```typescript
import { speraxChat } from '@speraxplugin-sdk';

 Get plugin payload (initialization data)
const payload = await speraxChat.getPluginPayload();

 Get current message content
const message = await speraxChat.getPluginMessage();

 Update message content
speraxChat.setPluginMessage(newContent);

 Getset plugin state
const state = await speraxChat.getPluginState('myKey');
speraxChat.setPluginState('myKey', newValue);

 Getset settings
const settings = await speraxChat.getPluginSettings();
speraxChat.setPluginSettings(newSettings);

 Trigger AI response (standalone plugins)
speraxChat.triggerAIMessage(messageId);

 Create assistant message (standalone plugins)
speraxChat.createAssistantMessage('Response content');
```

---

## 8. OpenAPI Integration

SperaxOS fully supports the OpenAPI specification, allowing you to convert existing APIs into plugins.

### OpenAPI Plugin Structure

```
my-openapi-plugin
├── manifest.json       # Points to openapi.json
└── openapi.json        # OpenAPI 3.0 specification
```

### Manifest for OpenAPI

```json
{
  "api": {
    "is_user_authenticated": false,
    "type": "openapi",
    "url": "https:plugin.deliveryopenaimy-pluginopenapi.json"
  },
  "auth": {
    "type": "none"
  },
  "contact_email": "contact@example.com",
  "description_for_human": "User-visible description",
  "description_for_model": "Instructions for the LLM on how to use this plugin effectively. Be specific about when to use each endpoint.",
  "legal_info_url": "https:example.comterms",
  "logo_url": "https:example.comlogo.png",
  "name_for_human": "My Plugin",
  "name_for_model": "my_plugin",
  "schema_version": "v1"
}
```

### OpenAPI Specification Example

```json
{
  "openapi": "3.0.1",
  "info": {
    "title": "My Plugin API",
    "description": "Description of the API",
    "version": "v1"
  },
  "servers": [
    {
      "url": "https:api.example.comv1"
    }
  ],
  "paths": {
    "search": {
      "get": {
        "operationId": "searchItems",
        "summary": "Search for items",
        "description": "Detailed description for the LLM",
        "parameters": [
          {
            "in": "query",
            "name": "query",
            "schema": {
              "type": "string"
            },
            "required": true,
            "description": "Search query string"
          },
          {
            "in": "query",
            "name": "limit",
            "schema": {
              "type": "integer",
              "default": 10
            },
            "description": "Maximum results to return"
          }
        ],
        "responses": {
          "200": {
            "description": "Successful response",
            "content": {
              "applicationjson": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "results": {
                      "type": "array",
                      "items": {
                        "type": "object"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

### Example: CoinGecko OpenAPI Plugin

See `publicopenaicoingecko` for a complete working example:

```json
{
  "openapi": "3.0.1",
  "info": {
    "title": "CoinGecko Crypto Data",
    "version": "v1"
  },
  "servers": [
    { "url": "https:api.coingecko.comapiv3" }
  ],
  "paths": {
    "simpleprice": {
      "get": {
        "operationId": "getPrice",
        "summary": "Get current price for cryptocurrencies",
        "parameters": [
          {
            "in": "query",
            "name": "ids",
            "schema": { "type": "string" },
            "required": true,
            "description": "Comma-separated CoinGecko token IDs"
          }
        ]
      }
    }
  }
}
```

---

## 9. Communication Mechanism

### Server Communication Flow

```
SperaxOS Core
     │
     │ HTTP POST with PluginRequestPayload
     ▼
Plugin Gateway (plugin.delivery or custom)
     │
     │ Validates payload
     │ Retrieves manifest if needed
     │ Validates parameters
     │ Adds settings to headers
     ▼
Plugin Server
     │
     │ Processes request
     │ Returns JSON response
     ▼
Plugin Gateway
     │
     │ Formats response
     ▼
SperaxOS Core
     │
     │ Passes to LLM for processing
     ▼
User sees formatted response
```

### Frontend Communication (iframe)

Plugins use `window.postMessage` for secure cross-origin communication:

```typescript
 Plugin → SperaxOS
window.parent.postMessage({
  type: 'plugin-action',
  action: 'setMessage',
  data: { content: 'Updated content' }
}, '*');

 SperaxOS → Plugin
window.addEventListener('message', (event) => {
  if (event.data.type === 'plugin-init') {
    const { payload, settings, state } = event.data;
     Initialize plugin with data
  }
});
```

The SDK abstracts this complexity:

```typescript
import { speraxChat } from '@speraxplugin-sdk';

 Simplified API
const payload = await speraxChat.getPluginPayload();
speraxChat.setPluginMessage(newContent);
```

---

## 10. Model Compatibility

### Tools Calling Support Matrix

| Model | Tools Calling | Streaming | Parallel | Recommendation |
|-------|--------------|-----------|----------|----------------|
| **GPT-4o** | ✅ | ✅ | ✅ | ⭐ Excellent |
| **GPT-4 Turbo** | ✅ | ✅ | ✅ | ⭐ Excellent |
| **GPT-3.5 Turbo** | ✅ | ✅ | ✅ | Good |
| **Claude 3.5 Sonnet** | ✅ | ✅ | ✅ | ⭐ Excellent |
| **Claude 3 Opus** | ✅ | ✅ | ❌ | Good (verbose) |
| **Claude 3 SonnetHaiku** | ✅ | ✅ | ❌ | Limited |
| **Gemini 1.5 Pro** | ✅ | ❌ | ✅ | ⚠️ Unreliable |
| **Gemini 1.5 Flash** | ❌ | ❌ | ❌ | ❌ Not recommended |

### Best Practices by Model

**OpenAI GPT Series:**
- Full plugin support with streaming
- Supports parallel function calls
- Follows instructions well

**Anthropic Claude Series:**
- Claude 3.5 Sonnet: Best for plugins
- Older versions may output `<thinking>` tags
- May not support parallel calls

**Google Gemini:**
- Limited plugin support
- Schema compatibility issues
- Not recommended for production plugins

---

## 11. Deployment & Publishing

### Deploying to Vercel

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "🚀 Deploy plugin"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com](https:vercel.com)
   - Import your repository
   - Configure environment variables
   - Deploy

3. **Configure Domain:**
   - Set custom domain to `plugin.delivery` (or your domain)
   - Add CORS headers in `vercel.json`

### Publishing to Plugin Marketplace

1. **Create Plugin Entry:**
   ```bash
   # Create srcmy-plugin.json
   {
     "author": "Your Name",
     "createdAt": "2025-12-27",
     "homepage": "https:github.comyoumy-plugin",
     "identifier": "my-plugin",
     "manifest": "https:plugin.deliveryopenaimy-pluginmanifest.json",
     "meta": {
       "avatar": "🔌",
       "description": "My awesome plugin",
       "tags": ["utility"],
       "title": "My Plugin",
       "category": "tools"
     },
     "schemaVersion": 1
   }
   ```

2. **Create Locale Files:**
   ```bash
   # Create localesmy-plugin.en-US.json (and other locales)
   {
     "meta": {
       "title": "My Plugin",
       "description": "My awesome plugin",
       "tags": ["utility"]
     }
   }
   ```

3. **Build and Deploy:**
   ```bash
   bun run build
   git push origin main
   ```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | For i18n translation scripts |
| `SERPAPI_KEY` | Search plugin API key |
| Custom keys | Plugin-specific API keys |

---

## 12. Troubleshooting

### Common Issues

#### Plugin Not Loading

**Symptoms:** Plugin doesn't appear or shows error

**Solutions:**
1. Check manifest URL is accessible
2. Verify CORS headers are set
3. Check manifest JSON is valid
4. Ensure `identifier` is unique

#### Function Calls Not Triggering

**Symptoms:** AI doesn't call the plugin

**Solutions:**
1. Check `description` field is clear
2. Verify `parameters` schema is valid
3. Test with GPT-4 or Claude 3.5 first
4. Check system prompt includes plugin

#### Gateway Errors

**Symptoms:** "Failed to request manifest" errors

**Solutions:**
1. Verify manifest URL returns JSON
2. Check CORS headers include plugin origin
3. For local dev, ensure gateway is running
4. Check network connectivity

#### UI Not Rendering

**Symptoms:** Plugin UI shows blank or error

**Solutions:**
1. Check UI URL in manifest
2. Verify CORS for iframe embedding
3. Check browser console for errors
4. Ensure `fetchPluginMessage` is called

### Debug Tips

```typescript
 Add logging to your plugin
console.log('[Plugin] Received request:', req.body);
console.log('[Plugin] Settings:', settings);
console.log('[Plugin] Response:', result);
```

### Getting Help

- **Documentation:** This guide
- **SDK Docs:** https:plugin.deliverydocs
- **GitHub Issues:** https:github.comsolizardkingplugin.deliveryissues
- **Discord:** [SperaxOS Discord Server]

---

## 12. Build Commands

All available development and build commands.

### Core Commands

#### `bun run build`
Builds the plugin index and generates production-ready files.

```bash
bun run build
```

**What it does:**
- Reads all plugin definitions from `src*.json`
- Validates manifests
- Generates `publicindex.json` (main index)
- Generates locale-specific indexes

#### `bun run format`
Formats code and generates i18n translations (requires OPENAI_API_KEY).

```bash
export OPENAI_API_KEY=sk-xxx
bun run format
```

#### `bun run check`
Validates all plugin definitions.

```bash
bun run check
```

#### `bun run test`
Runs the test suite.

```bash
bun run test
```

### Development Workflow

1. **Add New Plugin:**
   ```bash
   touch srcmy-plugin.json
   ```

2. **Build Index:**
   ```bash
   bun run build
   ```

3. **Generate Locales:**
   ```bash
   export OPENAI_API_KEY=sk-xxx
   bun run format
   ```

4. **Verify:**
   ```bash
   bun run check
   ```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | For i18n translations | Yes (for format) |
| `OPENAI_PROXY_URL` | Custom OpenAI endpoint | No |

### Supported Locales

Translations generated for: `en-US`, `zh-CN`, `zh-TW`, `ja-JP`, `ko-KR`, `de-DE`, `fr-FR`, `es-ES`, `it-IT`, `pt-BR`, `ru-RU`, `ar`, `bg-BG`, `fa-IR`, `nl-NL`, `pl-PL`, `tr-TR`, `vi-VN`

---

## Quick Reference

### Useful Links

| Resource | URL |
|----------|-----|
| Plugin SDK | `@speraxplugin-sdk` |
| Plugin Gateway | `@speraxchat-plugins-gateway` |
| Plugin Templates | `.templates` (included in this repo) |
| OpenAPI Spec | https:swagger.iospecification |
| SperaxOS Docs | https:sperax.iodocs |
| Plugin Delivery | https:plugin.delivery |

### Cheat Sheet

```bash
# Create new plugin (choose a template)
cp -r templatesopenapi my-plugin

# Install SDK
npm install @speraxplugin-sdk

# Install Gateway (for local dev)
npm install @speraxchat-plugins-gateway

# Run locally
npm run dev

# Build index
bun run build

# Deploy
vercel --prod
```

---

*For MCP (Model Context Protocol) plugins, see the [MCP vs Plugins Guide](..SperaxOSdocsMCP_VS_PLUGINS.md).*

