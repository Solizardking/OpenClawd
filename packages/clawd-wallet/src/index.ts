/**
 * @openclawdsolana/clawd-wallet — Main entry point
 * Privy-powered embedded Solana wallet for the openclawd agent ecosystem
 */

export type {
  SolanaChain,
  TokenSymbol,
  TokenAmount,
  ClawdWalletInfo,
  SwapQuoteParams,
  SwapQuote,
  SwapResult,
  PendingTransaction,
  AgenticTxStatus,
  AgenticTransaction,
  AgentPermission,
  AgentPermissions,
  AgenticWalletConfig,
  WalletCliOptions,
  WalletServerRequest,
  SwapRequest,
  JupiterRoutePlan,
} from "./types.js";

export {
  ClawdWalletError,
  SwapError,
  WalletNotReadyError,
  DEFAULT_PERMISSIONS,
  DEFAULT_CHAIN,
} from "./types.js";

export { ClawdWallet, EXPLORER_URL, CHAIN_RPC } from "./wallet.js";
export {
  SwapService,
  SOLANA_TOKENS,
  resolveTokenMint,
  getTokenDecimals,
  formatTokenAmount,
} from "./swap.js";
