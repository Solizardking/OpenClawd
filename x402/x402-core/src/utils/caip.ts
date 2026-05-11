/**
 * CAIP (Chain Agnostic Improvement Proposals) Utilities
 * https://github.com/ChainAgnostic/CAIPs
 */

import type { ChainId, ChainNamespace, ParsedChainId } from '../types/chains';

/**
 * Parse CAIP-2 chain ID
 * Format: namespace:reference
 * Example: solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp
 */
export function parseChainId(chainId: ChainId): ParsedChainId {
  const parts = chainId.split(':');

  if (parts.length !== 2) {
    throw new Error(`Invalid CAIP-2 chain ID: ${chainId}`);
  }

  const [namespace, reference] = parts;

  if (!['solana', 'eip155', 'bip122'].includes(namespace)) {
    throw new Error(`Unsupported chain namespace: ${namespace}`);
  }

  return {
    namespace: namespace as ChainNamespace,
    reference
  };
}

/**
 * Format CAIP-2 chain ID
 */
export function formatChainId(namespace: ChainNamespace, reference: string): ChainId {
  return `${namespace}:${reference}` as ChainId;
}

/**
 * Parse CAIP-10 account ID
 * Format: chain_id:account_address
 * Example: solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp:9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM
 */
export interface ParsedAccountId {
  chainId: ChainId;
  address: string;
}

export function parseAccountId(accountId: string): ParsedAccountId {
  const lastColonIndex = accountId.lastIndexOf(':');

  if (lastColonIndex === -1) {
    throw new Error(`Invalid CAIP-10 account ID: ${accountId}`);
  }

  const chainId = accountId.substring(0, lastColonIndex) as ChainId;
  const address = accountId.substring(lastColonIndex + 1);

  return { chainId, address };
}

/**
 * Format CAIP-10 account ID
 */
export function formatAccountId(chainId: ChainId, address: string): string {
  return `${chainId}:${address}`;
}

/**
 * Check if chain ID matches pattern
 * Supports wildcards: solana:* matches all Solana chains
 */
export function matchesChainPattern(chainId: ChainId, pattern: string): boolean {
  if (pattern === '*') return true;
  if (pattern === chainId) return true;

  const [patternNamespace, patternReference] = pattern.split(':');
  const { namespace } = parseChainId(chainId);

  if (patternReference === '*') {
    return namespace === patternNamespace;
  }

  return false;
}

/**
 * Get chain namespace from chain ID
 */
export function getChainNamespace(chainId: ChainId): ChainNamespace {
  const { namespace } = parseChainId(chainId);
  return namespace;
}

/**
 * Check if chain ID is Solana
 */
export function isSolanaChain(chainId: ChainId): boolean {
  return getChainNamespace(chainId) === 'solana';
}

/**
 * Check if chain ID is EVM
 */
export function isEvmChain(chainId: ChainId): boolean {
  return getChainNamespace(chainId) === 'eip155';
}

/**
 * Check if chain ID is Bitcoin
 */
export function isBitcoinChain(chainId: ChainId): boolean {
  return getChainNamespace(chainId) === 'bip122';
}

/**
 * Validate chain ID format
 */
export function isValidChainId(chainId: string): chainId is ChainId {
  try {
    parseChainId(chainId as ChainId);
    return true;
  } catch {
    return false;
  }
}

/**
 * Normalize address format for chain
 */
export function normalizeAddress(address: string, chainId: ChainId): string {
  const namespace = getChainNamespace(chainId);

  switch (namespace) {
    case 'solana':
      // Solana addresses are base58, already normalized
      return address;

    case 'eip155':
      // EVM addresses should be checksummed
      return address.toLowerCase().startsWith('0x')
        ? address
        : `0x${address}`;

    case 'bip122':
      // Bitcoin addresses - various formats supported
      return address;

    default:
      return address;
  }
}
