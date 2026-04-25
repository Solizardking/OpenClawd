# OpenClawd UI

The web UI for Clawd is at `ui/` and can be run alongside the agent runtime.

## Structure

```
ui/
├── src/
│   ├── main.ts       # Entry point
│   ├── styles/       # CSS files
│   └── ui/          # UI components
├── public/           # Static assets
├── index.html        # HTML template
├── package.json      # Dependencies
├── tsconfig.json     # TypeScript config
└── vite.config.ts    # Vite config
```

## Running the UI

```bash
cd ui
npm install
npm run dev
```

## Build

```bash
npm run build
```

The built output goes to `dist/` and can be served statically.