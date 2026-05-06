# OpenClawd static site

Static public pages for the OpenClawd stack, agent gallery, and adapted secondary skill deck. No build step, no dependencies.

## Files

- `index.html` — main OpenClawd landing page with the Solana terminal, stack, packages, token, and secondary skills overview.
- `agents/index.html` — agent gallery backed by `solanaclawd.com/api/agents/catalog`, with local fallback behavior and secondary skill deck framing.
- `../secondary_skills/` — local operator skill catalog. Every `SKILL.md` has an OpenClawd Operator adaptation block while preserving its original domain-specific workflow and disclaimers.

## Preview locally

```bash
# Pick whichever you prefer
python3 -m http.server 8080 -d site/
# or
npx -y serve site/ -l 8080
```

Then open <http://localhost:8080>.

## Deploy

Drop the `site/` directory on:

- **Cloudflare Pages** — `npx wrangler pages deploy site/`
- **Vercel** — `vercel site/ --prod`
- **GitHub Pages** — push `site/` to a `gh-pages` branch
- **Cloudflare Workers** — extend `workers/install-worker/` to serve `index.html` at a new route
- **S3 / any static host** — upload `site/index.html` to the root

## Edit checklist

When versions or catalog framing change, update these spots:

- The `Install` section commands
- The `Packages` section table — version pills + descriptions
- The hero badge text (`v0.2 live on npm`)
- The "What's new" section copy
- The `Skills` section if the secondary skill catalog changes materially
- The `agents/index.html` secondary skill deck strip if the gallery capability framing changes

That's it. No framework or build step. Keep the landing page self-contained, and keep gallery JavaScript plain browser JavaScript.
