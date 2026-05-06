/**
 * Solana Settlement
 * Handles SOL and SPL token transfers
 */

import type { PaymentSignature } from '@autonomy/x402-core';
import { X402Error, X402ErrorCode } from '@autonomy/x402-core';

export interface SolanaSettlementResult {
  txHash: string;
  explorerUrl: string;
}

export class SolanaSettlement {
  constructor(
    private rpcUrl: string,
    private treasuryWallet: string
  ) {}

  /**
   * Settle payment on Solana
   */
  async settle(signature: PaymentSignature): Promise<SolanaSettlementResult> {
    const { payload } = signature;

    try {
      // Build transaction
      const transaction = await this.buildTransaction(signature);

      // Submit transaction
      const txHash = await this.submitTransaction(transaction);

      // Wait for confirmation
      await this.confirmTransaction(txHash);

      const explorerUrl = this.getExplorerUrl(txHash);

      return {
        txHash,
        explorerUrl
      };
    } catch (error) {
      throw new X402Error(
        X402ErrorCode.SETTLEMENT_FAILED,
        `Solana settlement failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Build Solana transaction
   */
  private async buildTransaction(signature: PaymentSignature): Promise<string> {
    const { payload } = signature;

    // Fetch recent blockhash
    const response = await fetch(this.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getLatestBlockhash',
        params: [{ commitment: 'finalized' }]
      })
    });

    const { result } = await response.json();
    const blockhash = result.value.blockhash;

    // Determine if SOL or SPL token transfer
    const isSol = payload.token.symbol === 'SOL';

    if (isSol) {
      // Build SOL transfer transaction
      return this.buildSolTransfer(
        payload.recipient,
        this.treasuryWallet,
        payload.amount,
        blockhash
      );
    } else {
      // Build SPL token transfer transaction
      return this.buildSplTransfer(
        payload.recipient,
        this.treasuryWallet,
        payload.token.mint || '',
        payload.amount,
        blockhash
      );
    }
  }

  /**
   * Build SOL transfer transaction
   */
  private buildSolTransfer(
    from: string,
    to: string,
    lamports: number,
    blockhash: string
  ): string {
    // This would use @solana/web3.js Transaction builder
    // For now, return placeholder
    // In production, you'd construct the actual transaction here

    const transaction = {
      recentBlockhash: blockhash,
      feePayer: from,
      instructions: [
        {
          programId: '11111111111111111111111111111111', // System Program
          keys: [
            { pubkey: from, isSigner: true, isWritable: true },
            { pubkey: to, isSigner: false, isWritable: true }
          ],
          data: Buffer.from([2, 0, 0, 0, ...this.u64ToBytes(lamports)])
        }
      ]
    };

    // Serialize transaction
    return Buffer.from(JSON.stringify(transaction)).toString('base64');
  }

  /**
   * Build SPL token transfer transaction
   */
  private buildSplTransfer(
    from: string,
    to: string,
    mint: string,
    amount: number,
    blockhash: string
  ): string {
    // This would use @solana/spl-token Transfer builder
    // For now, return placeholder

    const transaction = {
      recentBlockhash: blockhash,
      feePayer: from,
      instructions: [
        {
          programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', // Token Program
          keys: [
            { pubkey: from, isSigner: true, isWritable: true },
            { pubkey: mint, isSigner: false, isWritable: false },
            { pubkey: to, isSigner: false, isWritable: true }
          ],
          data: Buffer.from([3, ...this.u64ToBytes(amount)])
        }
      ]
    };

    return Buffer.from(JSON.stringify(transaction)).toString('base64');
  }

  /**
   * Submit transaction to Solana
   */
  private async submitTransaction(transaction: string): Promise<string> {
    const response = await fetch(this.rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'sendTransaction',
        params: [transaction, { encoding: 'base64' }]
      })
    });

    const { result, error } = await response.json();

    if (error) {
      throw new Error(`Transaction submission failed: ${error.message}`);
    }

    return result;
  }

  /**
   * Confirm transaction
   */
  private async confirmTransaction(signature: string): Promise<void> {
    // Poll for confirmation
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds max

    while (attempts < maxAttempts) {
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getSignatureStatuses',
          params: [[signature]]
        })
      });

      const { result } = await response.json();
      const status = result.value[0];

      if (status && status.confirmationStatus === 'finalized') {
        return;
      }

      if (status && status.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(status.err)}`);
      }

      // Wait 1 second before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }

    throw new Error('Transaction confirmation timeout');
  }

  /**
   * Get explorer URL
   */
  private getExplorerUrl(signature: string): string {
    const cluster = this.rpcUrl.includes('devnet') ? '?cluster=devnet' : '';
    return `https://explorer.solana.com/tx/${signature}${cluster}`;
  }

  /**
   * Convert number to u64 bytes (little-endian)
   */
  private u64ToBytes(value: number): number[] {
    const bytes: number[] = [];
    for (let i = 0; i < 8; i++) {
      bytes.push(value & 0xff);
      value = Math.floor(value / 256);
    }
    return bytes;
  }
}
