/**
 * Cryptographic Utilities for X402
 * Signature generation and verification
 */

import type { PaymentSignaturePayload } from '../types/payment';
import type { ChainId } from '../types/chains';
import { getChainNamespace } from './caip';

/**
 * Signature type
 */
export type SignatureType = 'ed25519' | 'secp256k1' | 'secp256r1';

/**
 * Get signature type for chain
 */
export function getSignatureTypeForChain(chainId: ChainId): SignatureType {
  const namespace = getChainNamespace(chainId);

  switch (namespace) {
    case 'solana':
      return 'ed25519';
    case 'eip155':
      return 'secp256k1';
    case 'bip122':
      return 'secp256k1';
    default:
      throw new Error(`Unsupported chain namespace: ${namespace}`);
  }
}

/**
 * Create payment signature payload
 */
export function createPaymentPayload(
  amount: number,
  recipient: string,
  chainId: ChainId,
  endpoint: string,
  tokenSymbol: string,
  tokenMint?: string
): PaymentSignaturePayload {
  return {
    amount,
    recipient,
    token: {
      symbol: tokenSymbol,
      mint: tokenMint,
      decimals: getTokenDecimals(tokenSymbol, chainId),
      chainId
    },
    chainId,
    nonce: generateNonce(),
    timestamp: Math.floor(Date.now() / 1000),
    endpoint
  };
}

/**
 * Generate unique nonce
 */
export function generateNonce(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2)}`;
}

/**
 * Serialize payment payload for signing
 */
export function serializePaymentPayload(payload: PaymentSignaturePayload): string {
  // Canonical JSON serialization
  return JSON.stringify({
    amount: payload.amount,
    recipient: payload.recipient,
    token: payload.token.symbol,
    chain: payload.chainId,
    nonce: payload.nonce,
    timestamp: payload.timestamp,
    endpoint: payload.endpoint
  });
}

/**
 * Hash message for signing (SHA-256)
 */
export async function hashMessage(message: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return new Uint8Array(hashBuffer);
}

/**
 * Verify Ed25519 signature
 * Used for Solana signatures
 */
export async function verifyEd25519Signature(
  message: string,
  signature: Uint8Array,
  publicKey: Uint8Array
): Promise<boolean> {
  try {
    const messageHash = await hashMessage(message);

    // Import public key
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      publicKey as unknown as ArrayBuffer,
      {
        name: 'Ed25519',
        namedCurve: 'Ed25519'
      } as EcKeyImportParams,
      false,
      ['verify']
    );

    // Verify signature
    return await crypto.subtle.verify(
      'Ed25519',
      cryptoKey,
      signature as unknown as ArrayBuffer,
      messageHash as unknown as ArrayBuffer
    );
  } catch (error) {
    console.error('Ed25519 verification failed:', error);
    return false;
  }
}

/**
 * Verify secp256k1 signature
 * Used for EVM and Bitcoin signatures
 */
export async function verifySecp256k1Signature(
  message: string,
  signature: Uint8Array,
  publicKey: Uint8Array
): Promise<boolean> {
  try {
    const messageHash = await hashMessage(message);

    // Import public key
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      publicKey as unknown as ArrayBuffer,
      {
        name: 'ECDSA',
        namedCurve: 'secp256k1'
      } as EcKeyImportParams,
      false,
      ['verify']
    );

    // Verify signature
    return await crypto.subtle.verify(
      {
        name: 'ECDSA',
        hash: { name: 'SHA-256' }
      },
      cryptoKey,
      signature as unknown as ArrayBuffer,
      messageHash as unknown as ArrayBuffer
    );
  } catch (error) {
    console.error('secp256k1 verification failed:', error);
    return false;
  }
}

/**
 * Verify payment signature
 */
export async function verifyPaymentSignature(
  payload: PaymentSignaturePayload,
  signature: string,
  publicKey: string,
  signatureType: SignatureType
): Promise<boolean> {
  const message = serializePaymentPayload(payload);
  const signatureBytes = base64ToUint8Array(signature);
  const publicKeyBytes = base64ToUint8Array(publicKey);

  switch (signatureType) {
    case 'ed25519':
      return verifyEd25519Signature(message, signatureBytes, publicKeyBytes);

    case 'secp256k1':
      return verifySecp256k1Signature(message, signatureBytes, publicKeyBytes);

    case 'secp256r1':
      // TODO: Implement secp256r1 verification
      throw new Error('secp256r1 verification not yet implemented');

    default:
      throw new Error(`Unsupported signature type: ${signatureType}`);
  }
}

/**
 * Base64 to Uint8Array
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Uint8Array to Base64
 */
export function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Get token decimals for common tokens
 */
export function getTokenDecimals(symbol: string, chainId: ChainId): number {
  const namespace = getChainNamespace(chainId);

  // Common token decimals
  const decimalsMap: Record<string, Record<string, number>> = {
    solana: {
      SOL: 9,
      USDC: 6,
      USDT: 6
    },
    eip155: {
      ETH: 18,
      USDC: 6,
      USDT: 6,
      DAI: 18
    },
    bip122: {
      BTC: 8
    }
  };

  return decimalsMap[namespace]?.[symbol] ?? 18; // Default to 18 decimals
}

/**
 * Format amount with token decimals
 */
export function formatTokenAmount(amount: number, decimals: number): string {
  return (amount / Math.pow(10, decimals)).toFixed(decimals);
}

/**
 * Parse amount to base units
 */
export function parseTokenAmount(amount: string | number, decimals: number): number {
  const amountNum = typeof amount === 'string' ? parseFloat(amount) : amount;
  return Math.floor(amountNum * Math.pow(10, decimals));
}
