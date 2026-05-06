/**
 * CAIP-2 Chain Identifiers
 * https://github.com/ChainAgnostic/CAIPs/blob/master/CAIPs/caip-2.md
 */

export const CHAINS = {
  // Solana
  SOLANA_MAINNET: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
  SOLANA_DEVNET: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
  SOLANA_TESTNET: 'solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z',

  // Ethereum & L2s
  ETHEREUM_MAINNET: 'eip155:1',
  ETHEREUM_SEPOLIA: 'eip155:11155111',
  BASE_MAINNET: 'eip155:8453',
  BASE_SEPOLIA: 'eip155:84532',
  ARBITRUM_ONE: 'eip155:42161',
  ARBITRUM_SEPOLIA: 'eip155:421614',
  OPTIMISM_MAINNET: 'eip155:10',
  POLYGON_MAINNET: 'eip155:137',

  // Bitcoin
  BITCOIN_MAINNET: 'bip122:000000000019d6689c085ae165831e93',
  BITCOIN_TESTNET: 'bip122:000000000933ea01ad0ee984209779ba',
} as const;

export type ChainId = typeof CHAINS[keyof typeof CHAINS];

/**
 * Chain namespace types
 */
export type ChainNamespace = 'solana' | 'eip155' | 'bip122';

/**
 * Parse CAIP-2 chain ID
 */
export interface ParsedChainId {
  namespace: ChainNamespace;
  reference: string;
}

/**
 * Chain metadata
 */
export interface ChainMetadata {
  id: ChainId;
  name: string;
  namespace: ChainNamespace;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls: string[];
  testnet: boolean;
}

/**
 * Supported chain metadata
 */
export const CHAIN_METADATA: Record<string, ChainMetadata> = {
  [CHAINS.SOLANA_MAINNET]: {
    id: CHAINS.SOLANA_MAINNET,
    name: 'Solana Mainnet',
    namespace: 'solana',
    nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 },
    rpcUrls: ['https://api.mainnet-beta.solana.com'],
    blockExplorerUrls: ['https://explorer.solana.com'],
    testnet: false
  },
  [CHAINS.SOLANA_DEVNET]: {
    id: CHAINS.SOLANA_DEVNET,
    name: 'Solana Devnet',
    namespace: 'solana',
    nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 },
    rpcUrls: ['https://api.devnet.solana.com'],
    blockExplorerUrls: ['https://explorer.solana.com?cluster=devnet'],
    testnet: true
  },
  [CHAINS.BASE_MAINNET]: {
    id: CHAINS.BASE_MAINNET,
    name: 'Base',
    namespace: 'eip155',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.base.org'],
    blockExplorerUrls: ['https://basescan.org'],
    testnet: false
  },
  [CHAINS.ETHEREUM_MAINNET]: {
    id: CHAINS.ETHEREUM_MAINNET,
    name: 'Ethereum',
    namespace: 'eip155',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://eth.llamarpc.com'],
    blockExplorerUrls: ['https://etherscan.io'],
    testnet: false
  },
  [CHAINS.BITCOIN_MAINNET]: {
    id: CHAINS.BITCOIN_MAINNET,
    name: 'Bitcoin',
    namespace: 'bip122',
    nativeCurrency: { name: 'Bitcoin', symbol: 'BTC', decimals: 8 },
    rpcUrls: [],
    blockExplorerUrls: ['https://mempool.space'],
    testnet: false
  }
};
