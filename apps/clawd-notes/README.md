# Clawd Notes

Hosted OpenClawd note-taking app with Obsidian-style workflows.

Features:

- Create, read, search, and edit notes.
- Markdown editor with live readable preview.
- Obsidian-style `[[wikilinks]]`.
- Backlink discovery.
- Convex backend when `VITE_CONVEX_URL` is configured.
- LocalStorage demo mode when Convex is not configured.

## Local Demo

```bash
npm install
npm run dev
```

Open http://127.0.0.1:5174.

## Convex Backend

```bash
npm run convex:dev
```

Copy the generated Convex URL into `.env.local`:

```bash
VITE_CONVEX_URL=https://your-deployment.convex.cloud
```

Then run:

```bash
npm run dev
```

## Deploy

Build the frontend:

```bash
npm run build
```

Deploy Convex:

```bash
npm run convex:deploy
```

Host the generated `dist/` directory on Vercel, Netlify, Cloudflare Pages, or any static host with `VITE_CONVEX_URL` configured.
