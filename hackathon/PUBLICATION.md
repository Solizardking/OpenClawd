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
- `hackathon/SUBMISSION.md` present and links to the hardware, GR00T, Pay.sh,
  and DePIN physical-AI pieces.
- `hackathon/presentation/pitch-deck.html` opens directly from disk.
- `hackathon/presentation/speaker-notes.md` contains the five-minute talk track.
- `hackathon/docs/depin-physical-ai.md` explains the Robot AI / DePIN data
  flywheel, receipt schema, validator checks, and market constraints.
- `hackathon/robotics/README.md` points to OCASV1 / `OPENCLAWDASV1`, GR00T, and
  the hardware-side Go binary.
- No secrets or private keys.
- Offline demo works with `node`.
- Site opens directly from disk.

## Final Local Smoke Test

```bash
node hackathon/demos/robot-command-demo.mjs
node -e "const fs=require('fs'); for (const f of ['hackathon/one-page-site/index.html','hackathon/presentation/pitch-deck.html']) { const s=fs.readFileSync(f,'utf8'); if(!s.includes('<!doctype html>') || !s.includes('</html>')) throw new Error(f); }"
./cmd/openclawd-go/openclawd-go gr00t plan --robot-id OPENCLAWDASV1
```
