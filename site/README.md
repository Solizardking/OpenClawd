# OpenClawd debut site

A single-page static debut site for `@openclawdsolana/clawd-tui@0.2` and the wider OpenClawd stack. No build step, no dependencies — one self-contained `index.html`.

## Preview locally

```bash
# Pick whichever you prefer
python3 -m http.server 8080 -d site/
# or
npx -y serve site/ -l 8080
```

Then open <http://localhost:8080>.

## Deploy

The whole site is one file. Drop it on:

- **Cloudflare Pages** — `npx wrangler pages deploy site/`
- **Vercel** — `vercel site/ --prod`
- **GitHub Pages** — push `site/` to a `gh-pages` branch
- **Cloudflare Workers** — extend `workers/install-worker/` to serve `index.html` at a new route
- **S3 / any static host** — upload `site/index.html` to the root

## Edit checklist

When versions change, update these spots inside `site/index.html`:

- The `Install` section commands
- The `Packages` section table — version pills + descriptions
- The hero badge text (`v0.2 live on npm`)
- The "What's new" section copy

That's it. No JS, no framework — keep it that way.
