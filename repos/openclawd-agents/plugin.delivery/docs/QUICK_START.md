# Quick Start Guide

Build and deploy your first SperaxOS plugin in under 10 minutes.

## Prerequisites

- [Bun](https:bun.sh) or Node.js 18+
- A code editor (VS Code recommended)
- Basic TypeScript knowledge

---

## Step 1: Choose Your Plugin Type

| I want to... | Use this type | Template |
|--------------|---------------|----------|
| Return data for AI to explain | **Default** | `templatesdefault` |
| Show formatted texttables | **Markdown** | `templatesmarkdown` |
| Build interactive UI | **Standalone** | `templatesstandalone` |
| Use existing OpenAPI spec | **OpenAPI** | `templatesopenapi` |

---

## Step 2: Create Your Plugin

### Option A: Using a Template (Recommended)

```bash
# Clone the plugins repo
git clone https:github.comsolizardkingplugin.delivery.git
cd plugins

# Copy a template
cp -r templatesdefault my-plugin
cd my-plugin

# Install dependencies
bun install
```

### Option B: From Scratch

```bash
mkdir my-plugin && cd my-plugin
bun init -y
bun add @speraxplugin-sdk
```

---

## Step 3: Create Your Manifest

Every plugin needs a `manifest.json`:

```json
{
  "$schema": "https:plugin.deliveryschema.json",
  "identifier": "my-plugin",
  "api": [
    {
      "name": "myFunction",
      "description": "What this function does - be descriptive for the AI",
      "url": "https:my-plugin.vercel.appapiendpoint",
      "parameters": {
        "type": "object",
        "properties": {
          "param1": {
            "type": "string",
            "description": "Description of param1"
          }
        },
        "required": ["param1"]
      }
    }
  ],
  "meta": {
    "title": "My Plugin",
    "description": "A brief description shown in the plugin store",
    "avatar": "🔌",
    "tags": ["utility"]
  }
}
```

### Key Fields Explained

| Field | Purpose |
|-------|---------|
| `identifier` | Unique plugin ID (lowercase, hyphens allowed) |
| `api[].name` | Function name the AI will call |
| `api[].description` | **Critical** - AI uses this to decide when to call |
| `api[].url` | Your API endpoint URL |
| `api[].parameters` | JSON Schema for function arguments |
| `meta.title` | Display name in plugin store |
| `meta.description` | Short description (under 200 chars) |

---

## Step 4: Implement Your API

Create `apiendpoint.ts`:

```typescript
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
   Parse the request body
  const body = await req.json();
  const { param1 } = body;

   Your logic here
  const result = await doSomething(param1);

   Return JSON response
  return Response.json({
    success: true,
    data: result,
  });
}

async function doSomething(input: string) {
   Your implementation
  return `Processed: ${input}`;
}
```

### Response Format

For **Default** plugins, return JSON that the AI will summarize:

```json
{
  "price": 3450.00,
  "change24h": "+2.5%",
  "volume": "1.2B"
}
```

For **Markdown** plugins, return formatted text:

```json
{
  "markdown": "## Results\n\n| Token | Price |\n|-------|-------|\n| ETH | $3,450 |"
}
```

---

## Step 5: Test Locally

### Start Development Server

```bash
bun dev
# Server runs at http:localhost:3400
```

### Test Your Endpoint

```bash
curl -X POST http:localhost:3400apiendpoint \
  -H "Content-Type: applicationjson" \
  -d '{"param1": "test"}'
```

### Test in SperaxOS

1. Open SperaxOS
2. Go to **Plugin Settings** → **Add Custom Plugin**
3. Enter: `http:localhost:3400manifest.json`
4. Enable the plugin
5. Chat: "Use my-plugin to..." 

---

## Step 6: Deploy

### Deploy to Vercel (Free)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Update Your Manifest

After deployment, update `manifest.json` with production URLs:

```json
{
  "api": [
    {
      "url": "https:my-plugin.vercel.appapiendpoint"
    }
  ]
}
```

---

## Step 7: Publish to Plugin Delivery

### Option A: Submit via GitHub Issue

1. Go to [github.comsolizardkingplugin.deliveryissues](https:github.comsolizardkingplugin.deliveryissues)
2. Click "New Issue" → "Plugin Submission"
3. Fill in your plugin details

### Option B: Submit via Pull Request

1. Fork [github.comsolizardkingplugin.delivery](https:github.comsolizardkingplugin.delivery)

2. Add your plugin to `srcmy-plugin.json`:

```json
{
  "identifier": "my-plugin",
  "author": "your-github-username",
  "createdAt": "2025-01-01",
  "manifest": "https:my-plugin.vercel.appmanifest.json",
  "meta": {
    "avatar": "🔌",
    "title": "My Plugin",
    "description": "What it does",
    "tags": ["utility"],
    "category": "tools"
  }
}
```

3. **⚠️ REQUIRED: Create locale file** `localesmy-plugin.en-US.json`:

```json
{
  "meta": {
    "title": "My Plugin",
    "description": "What it does",
    "tags": ["utility"]
  }
}
```

4. Run `bun run format` to generate all translations (requires `OPENAI_API_KEY`)

5. Submit PR with both `srcmy-plugin.json` and `localesmy-plugin.*.json` files

---

## Examples

### Crypto Price Plugin

```typescript
 apiprice.ts
export default async function handler(req: Request) {
  const { coin } = await req.json();
  
  const res = await fetch(
    `https:api.coingecko.comapiv3simpleprice?ids=${coin}&vs_currencies=usd&include_24hr_change=true`
  );
  const data = await res.json();
  
  return Response.json({
    coin,
    price: data[coin]?.usd,
    change24h: data[coin]?.usd_24h_change?.toFixed(2) + '%',
  });
}
```

### Weather Plugin (Markdown)

```typescript
 apiweather.ts
export default async function handler(req: Request) {
  const { city } = await req.json();
  
  const weather = await getWeather(city);
  
  return Response.json({
    markdown: `
## Weather in ${city}

🌡️ **Temperature:** ${weather.temp}°C
💨 **Wind:** ${weather.wind} kmh
💧 **Humidity:** ${weather.humidity}%
    `.trim()
  });
}
```

---

## Common Issues

### "Plugin not showing in store"

- Check manifest URL is accessible (try opening in browser)
- Verify JSON is valid (use jsonlint.com)
- Ensure `identifier` is unique

### "Function not being called"

- Improve `api[].description` - be specific about when to use
- Check parameter descriptions
- Test endpoint directly with curl

### "CORS errors"

Add to your API:

```typescript
export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }
  
   ... rest of handler
  
  return Response.json(data, {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });
}
```

---

## Next Steps

- 📖 [Full Plugin Development Guide](.PLUGIN_DEVELOPMENT_GUIDE.md)
- 🎨 [Plugin Types Deep Dive](.PLUGIN_TYPES.md)
- 📋 [Manifest Reference](.PLUGIN_MANIFEST.md)
- 💬 [Communication Guide](.COMMUNICATION_GUIDE.md) (for Standalone plugins)

---

## Need Help?

- GitHub Issues: [github.comsolizardkingplugin.deliveryissues](https:github.comsolizardkingplugin.deliveryissues)
- TwitterX: [@nichxbt](https:x.comnichxbt)

---

## Reference Projects

In addition to the templates provided in this repository, you can learn about plugin development based on these reference implementations:

### Official Templates

| Template | Type | Description | Location |
|----------|------|-------------|----------|
| **Default** | `default` | Standard plugin with backend API | `templatesdefault` |
| **Markdown** | `markdown` | Returns formatted Markdown | `templatesmarkdown` |
| **Standalone** | `standalone` | Interactive React application | `templatesstandalone` |
| **OpenAPI** | `default` | Uses OpenAPI specification | `templatesopenapi` |
| **Basic** | `default` | Minimal starter template | `templatesbasic` |
| **Settings** | `default` | Plugin with user settings | `templatessettings` |

### Example Plugins

| Plugin | Type | Description | Location |
|--------|------|-------------|----------|
| **CoinGecko** | OpenAPI | Cryptocurrency price data | `publicopenaicoingecko` |
| **DeFiLlama** | OpenAPI | DeFi protocol analytics | `publicdefillama` |

### Framework Examples

The plugin system supports any frontend framework. Here are examples using different approaches:

**Vercel Edge Runtime (Recommended):**
- Fast, global edge network
- TypeScript support
- See: `templatesopenapi`

**Vercel Node.js Runtime:**
- Full Node.js APIs available
- Useful for complex server-side logic
- See: `api` folder examples

**Next.js Pages Router:**
- Full React framework
- SSR and API routes
- See: `templatesstandalone`

**Pure Frontend (Standalone):**
- No backend required
- Client-side only
- See: `templatesstandalone`

### Contributing Templates

We welcome contributions of plugin templates for more frameworks and languages:

- **PythonFlask** - FastAPI or Flask server template
- **Go** - Gin or Echo server template
- **Rust** - Actix or Axum server template
- **Vue.js** - Vue-based standalone plugin
- **Svelte** - Svelte-based standalone plugin

To contribute:
1. Create your template in `templatesyour-framework`
2. Include a README.md with setup instructions
3. Submit a pull request

---

## What's Next?

After completing this quick start, explore these guides for more advanced topics:

- 📖 [Full Plugin Development Guide](.PLUGIN_DEVELOPMENT_GUIDE.md) - Comprehensive development documentation
- 🎨 [Plugin Types Deep Dive](.PLUGIN_TYPES.md) - When to use each plugin type
- 📋 [Manifest Reference](.PLUGIN_MANIFEST.md) - Complete manifest field documentation
- 💬 [Communication Guide](.COMMUNICATION_GUIDE.md) - Frontendbackend communication patterns
- 🔌 [SDK API Reference](.SDK_API_REFERENCE.md) - Full SDK documentation
- 📤 [Submit Your Plugin](.SUBMIT_PLUGIN.md) - Get listed in the marketplace

