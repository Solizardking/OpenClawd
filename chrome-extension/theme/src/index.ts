/**
 * @openclawdsolana/pagent-theme — OpenClawd brand tokens, CSS, and lobster mark.
 *
 *   import { tokens, color, gradient, tokensToCSS } from '@openclawdsolana/pagent-theme'
 *   import '@openclawdsolana/pagent-theme/theme.css'
 *
 * The CSS file emits `--oc-*` custom properties on `:root` and a small set of
 * .oc-* utility classes (.oc-glass, .oc-btn, .oc-badge, .oc-mono).
 */

import { tokens, tokensToCSS } from './tokens.js'

export * from './tokens.js'
export default tokens

/** Inject the shared theme CSS into a document at runtime. Returns the inserted node. */
export function injectThemeCSS(doc: Document = document, id = 'oc-theme'): HTMLLinkElement | HTMLStyleElement {
  const existing = doc.getElementById(id)
  if (existing) return existing as HTMLStyleElement

  const url = (globalThis as { chrome?: { runtime?: { getURL?: (p: string) => string } } })
    .chrome?.runtime?.getURL?.('theme.css')
  if (url) {
    const link = doc.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = url
    doc.head.appendChild(link)
    return link
  }

  const style = doc.createElement('style')
  style.id = id
  style.textContent = tokensToCSS()
  doc.head.appendChild(style)
  return style
}
