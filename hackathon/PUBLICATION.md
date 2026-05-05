# Publication Guide

The `hackathon/` directory is designed to be published as-is.

## Recommended Public URLs

- GitHub directory: `https://github.com/clawdsolana/OpenClawd/tree/main/hackathon`
- Static site: GitHub Pages, Vercel, Netlify, or any static file host pointed at `hackathon/one-page-site`
- Slide deck: publish `hackathon/presentation/pitch-deck.html`

## GitHub Pages

Use one of these approaches:

1. Publish the whole repo through GitHub Pages and link to `/hackathon/one-page-site/`.
2. Copy `hackathon/one-page-site/index.html` to a Pages branch or static host root.
3. Use a Pages workflow that uploads `hackathon/one-page-site` as the artifact.

## Vercel or Netlify

Settings:

```text
Root directory: hackathon/one-page-site
Build command: none
Output directory: .
```

## Public Checklist

- `hackathon/LICENSE.md` present.
- `hackathon/CONTRIBUTING.md` present.
- `hackathon/SECURITY.md` present.
- No secrets or private keys.
- Offline demo works with `node`.
- Site opens directly from disk.

