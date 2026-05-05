# @openclawdsolana/pagent-theme

Brand tokens, CSS variables, and the lobster mark — shared by every OpenClawd surface (popup, side panel, options page, MV3 Browser Bridge).

## Install

```bash
npm install @openclawdsolana/pagent-theme
```

Inside the OpenClawd monorepo it's already wired via `npm run install:pagent`.

## Use

### TypeScript / JS

```ts
import theme, { tokens, color, gradient, tokensToCSS, injectThemeCSS } from '@openclawdsolana/pagent-theme'

console.log(color.solanaGreen, gradient.brand)
console.log(theme === tokens) // true — `default` re-exports tokens
```

`tokensToCSS()` returns the `:root { --oc-* }` block as a string — useful when you can't ship a stylesheet (content scripts, sandboxed iframes).

`injectThemeCSS(document)` is a one-shot:
- In MV3 — uses `chrome.runtime.getURL('theme.css')` to load the stylesheet
- Elsewhere — inlines the tokens via `<style>` (no utility classes, only variables)

### Plain CSS

The compiled stylesheet ships at `@openclawdsolana/pagent-theme/theme.css`. For Chrome extensions without a bundler, stage it next to your `manifest.json` and link it:

```html
<link rel="stylesheet" href="theme.css" />
```

That gives you both the `--oc-*` variables and the small set of utility classes:

| Class | Purpose |
|---|---|
| `.oc-glass` | Glassmorphism panel (gradient bg, blur, border, shadow) |
| `.oc-btn` / `.oc-btn--primary` / `.oc-btn--danger` | Brand button styles |
| `.oc-badge` | Pill badge with the brand gradient |
| `.oc-mono` / `.oc-muted` / `.oc-dim` | Typography helpers |
| `.oc-root` | Wrapper that resets box-sizing + applies the dark canvas |

## Tokens

Color palette:

| Token | Hex | Use |
|---|---|---|
| `solanaGreen` | `#14F195` | Primary accent, success, brand |
| `solanaPurple` | `#9945FF` | Primary accent, brand |
| `solanaPurpleDeep` | `#7053F2` | Gradient mid-stop |
| `lobsterRed` / `lobsterCoral` | `#FF4D2E` / `#FF7A3D` | Lobster character accent |
| `bg` / `bgRaised` / `bgGlass` | `#06141A` / `#0E1A24` / `rgba(20,28,38,.72)` | Surfaces |
| `text` / `textMuted` / `textDim` | `#E8F0F8` / `#7886A0` / `#4B5874` | Type ramp |
| `danger` / `warning` / `success` | `#FF5757` / `#FFB13D` / `#14F195` | State colors |

Gradients, radii, spacing, font, and shadow tokens are documented inline in [src/tokens.ts](src/tokens.ts).

## Lobster mark

`@openclawdsolana/pagent-theme/lobster.svg` — the canonical icon source. Render it to PNG at any size with `rsvg-convert -w SIZE -h SIZE -a lobster.svg -o icon.png`.
