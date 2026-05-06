/**
 * EVM Settlement
 * Handles ETH and ERC-20 token transfers on Base, Ethereum, Arbitrum, etc.
 */

import type { PaymentSignature } from '@autonomy/x402-core';
import { X402Error, X402ErrorCode } from '@autonomy/x402-core';

export interface EvmSettlementResult {
  txHash: string;
  explorerUrl: string;
}

export class EvmSettlement {
  constructor(
    private rpcUrl: string,
    private treasuryWallet: string
  ) {}

  /**
   * Settle payment on EVM chain
   */
  async settle(signature: PaymentSignature): Promise<EvmSettlementResult> {
    const { payload } = signature;

    try {
      // TODO: Implement actual EVM settlement
      // This would use ethers.js or viem to:
      // 1. Build transaction (ETH transfer or ERC-20 transfer)
      // 2. Submit transaction
      // 3. Wait for confirmations

      // Placeholder implementation
      const txHash = `0x${Math.random().toString(16).substring(2)}`;
      const explorerUrl = this.getExplorerUrl(txHash, payload.chainId);

      return {
        txHash,
        explorerUrl
      };
    } catch (error) {
      throw new X402Error(
        X402ErrorCode.SETTLEMENT_FAILED,
        `EVM settlement failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Get explorer URL based on chain
   */
  private getExplorerUrl(txHash: string, chainId: string): string {
    // Base
    if (chainId.includes('8453')) {
      return `https://basescan.org/tx/${txHash}`;
    }

    // Ethereum mainnet
    if (chainId.includes(':1')) {
      return `https://etherscan.io/tx/${txHash}`;
    }

    // Arbitrum
    if (chainId.includes('42161')) {
      return `https://arbiscan.io/tx/${txHash}`;
    }

    return `https://etherscan.io/tx/${txHash}`;
  }
}
