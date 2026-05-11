/**
 * x402 Wallet Client
 *
 * Signs x402 payment payloads using a Solana wallet.
 * Supports:
 * 1. Raw private key signing via tweetnacl (ed25519)
 * 2. pay CLI (for account-based signing when available)
 *
 * No accounts, no API keys — just a Solana wallet.
 *
 * @package @openclawdsolana/nous-x402
 */

import { execSync } from 'node:child_process';
import * as tweetnacl from 'tweetnacl';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface WalletConfig {
  /** Private key (base58 string or JSON byte array) */
  privateKey?: string;
  /** Public key / wallet address */
  publicKey: string;
}

/**
 * Minimal payment payload used by Nous x402 flow.
 */
export interface NousPaymentPayload {
  amount: number;
  recipient: string;
  token: string;
  chainId: string;
  nonce: string;
  timestamp: number;
  endpoint: string;
}

export interface NousPaymentSignature {
  payload: NousPaymentPayload;
  signature: string;
  publicKey: string;
  signatureType: 'ed25519' | 'secp256k1' | 'secp256r1';
}

// ─── Wallet Client ───────────────────────────────────────────────────────────

export class X402WalletClient {
  private walletConfig: WalletConfig | null = null;
  private usePayCli: boolean;

  constructor(opts?: { walletConfig?: WalletConfig; usePayCli?: boolean }) {
    this.walletConfig = opts?.walletConfig ?? null;
    this.usePayCli = opts?.usePayCli ?? !opts?.walletConfig;
  }

  /**
   * Get the configured public key
   */
  getPublicKey(): string {
    if (this.walletConfig?.publicKey) {
      return this.walletConfig.publicKey;
    }
    if (this.usePayCli) {
      try {
        return this.getPayCliAddress();
      } catch {
        throw new Error(
          'No wallet configured. Set SOLANA_PRIVATE_KEY + SOLANA_PUBLIC_KEY env vars ' +
          'for direct wallet access, or configure pay CLI with "pay setup".'
        );
      }
    }
    throw new Error(
      'No wallet configured. Set SOLANA_PRIVATE_KEY env var with SOLANA_PUBLIC_KEY, ' +
      'or configure pay CLI with "pay setup".'
    );
  }

  /**
   * Sign a Nous x402 payment payload
   */
  async signPayload(payload: NousPaymentPayload): Promise<NousPaymentSignature> {
    if (this.walletConfig?.privateKey) {
      return this.signWithPrivateKey(payload);
    }
    if (this.usePayCli) {
      // Check if pay CLI has sandbox mode
      try {
        execSync('pay --sandbox --help 2>&1 | grep -q "sign"', { encoding: 'utf-8', timeout: 3_000 });
        return this.signWithPayCli(payload);
      } catch {
        // No sandbox mode - try pay send via HTTP
        throw new Error(
          'pay CLI v0.16.0 does not support sandbox signing. ' +
          'Set SOLANA_PRIVATE_KEY env var for direct wallet signing.'
        );
      }
    }
    throw new Error('No wallet signing method available');
  }

  /**
   * Sign using tweetnacl (via raw keypair bytes)
   */
  private async signWithPrivateKey(payload: NousPaymentPayload): Promise<NousPaymentSignature> {
    let seedBytes: Uint8Array;
    const pk = this.walletConfig!.privateKey!;

    if (pk.startsWith('[')) {
      seedBytes = new Uint8Array(JSON.parse(pk) as number[]);
    } else {
      // Base58 decode
      const bs58 = await import('bs58').catch(() => null);
      if (bs58) {
        seedBytes = bs58.default.decode(pk);
      } else {
        throw new Error('bs58 module required for base58 key parsing. Install bs58 or use JSON byte array format.');
      }
    }

    // Create keypair from seed via tweetnacl
    const naclKeypair = tweetnacl.sign.keyPair.fromSeed(seedBytes.slice(0, 32));

    // Determine public key
    const publicKey = this.walletConfig!.publicKey || '';

    // Serialize the message to sign
    const msg = JSON.stringify({
      amount: payload.amount,
      recipient: payload.recipient,
      token: payload.token,
      chain: payload.chainId,
      nonce: payload.nonce,
      timestamp: payload.timestamp,
      endpoint: payload.endpoint,
    });

    // Sign with Ed25519 via tweetnacl
    const messageBytes = new TextEncoder().encode(msg);
    const signatureBytes = tweetnacl.sign.detached(messageBytes, naclKeypair.secretKey);

    return {
      payload,
      signature: Buffer.from(signatureBytes).toString('base64'),
      publicKey: publicKey || Buffer.from(naclKeypair.publicKey).toString('hex'),
      signatureType: 'ed25519',
    };
  }

  /**
   * Sign using pay CLI sandbox mode (older versions)
   */
  private async signWithPayCli(payload: NousPaymentPayload): Promise<NousPaymentSignature> {
    try {
      const address = this.getPayCliAddress();

      const msg = JSON.stringify({
        amount: payload.amount,
        recipient: payload.recipient,
        token: payload.token,
        chain: payload.chainId,
        nonce: payload.nonce,
        timestamp: payload.timestamp,
        endpoint: payload.endpoint,
      });

      const result = execSync(
        `pay --sandbox sign "${Buffer.from(msg).toString('base64')}"`,
        { encoding: 'utf-8', timeout: 10_000 }
      ).trim();

      const parsed = JSON.parse(result);

      return {
        payload,
        signature: parsed.signature,
        publicKey: parsed.publicKey ?? address,
        signatureType: 'ed25519',
      };
    } catch (err) {
      throw new Error(
        `Pay CLI signing failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }

  /**
   * Get wallet address from pay CLI
   */
  private getPayCliAddress(): string {
    try {
      const result = execSync('pay --sandbox address', {
        encoding: 'utf-8',
        timeout: 5_000,
      }).trim();
      return result;
    } catch {
      throw new Error(
        'pay CLI sandbox mode not available in this version. ' +
        'Set SOLANA_PRIVATE_KEY env var for direct wallet access.'
      );
    }
  }

  /**
   * Check SOL balance
   */
  async getBalance(): Promise<{ sol: number }> {
    const publicKey = this.getPublicKey();
    const heliusKey = process.env.HELIUS_API_KEY ?? '';
    const rpcUrl = heliusKey
      ? `https://mainnet.helius-rpc.com/?api-key=${heliusKey}`
      : 'https://api.mainnet-beta.solana.com';

    try {
      const res = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getBalance', params: [publicKey] }),
      });
      const data = (await res.json()) as any;
      return { sol: (data?.result?.value ?? 0) / 1e9 };
    } catch {
      return { sol: 0 };
    }
  }
}

// ─── Convenience ─────────────────────────────────────────────────────────────

/**
 * Create a signer function for NousApiClient.sendWithX402()
 */
export function createNousX402Signer(client: X402WalletClient) {
  return async (payload: NousPaymentPayload): Promise<NousPaymentSignature> => {
    return client.signPayload(payload);
  };
}
