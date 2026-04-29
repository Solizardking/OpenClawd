// Solana tab view — wraps the standalone <openclawd-solana-panel> custom
// element so the Lit app can mount it through the normal render pipeline.

import { html, type TemplateResult } from "lit";

// Side-effect import registers the <openclawd-solana-panel> custom element.
import "../solana-panel";

export interface SolanaViewState {
  // The panel manages its own gateway-base URL via localStorage, so the host
  // app doesn't need to wire any state in. We accept this empty-ish object
  // to keep the view signature consistent with the other render functions.
  gatewayBase?: string;
}

export function renderSolana(_state: SolanaViewState = {}): TemplateResult {
  return html`<openclawd-solana-panel></openclawd-solana-panel>`;
}
