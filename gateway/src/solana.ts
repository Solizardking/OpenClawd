/**
 * Solana RPC Service
 * Blockchain interactions, wallet queries, transaction handling
 */

import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

export interface WalletBalances {
  sol: number;
  usdc: number;
  clawd: number;
}

export interface TransactionResult {
  signature: string;
  success: boolean;
  error?: string;
}

export class SolanaService {
  private connection: Connection;

  // Common token mints
  private USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
  private CLAWD_MINT = new PublicKey('8cHzQHUS2s2h8TzCmfqPKYiM4dSt4roa3n7MyRLApump');

  constructor(rpcUrl: string) {
    this.connection = new Connection(rpcUrl, 'confirmed');
  }

  async getBalances(address: string): Promise<WalletBalances> {
    try {
      const pubkey = new PublicKey(address);
      
      // Get SOL balance
      const solBalance = await this.connection.getBalance(pubkey);
      
      // Get token balances (simplified - real impl would use getTokenAccounts)
      const balances: WalletBalances = {
        sol: solBalance / LAMPORTS_PER_SOL,
        usdc: 0,
        clawd: 0,
      };
      
      return balances;
    } catch (error) {
      console.error('Failed to get balances:', error);
      return { sol: 0, usdc: 0, clawd: 0 };
    }
  }

  async getRecentTransactions(address: string, limit = 10): Promise<any[]> {
    try {
      const pubkey = new PublicKey(address);
      const signatures = await this.connection.getSignaturesForAddress(pubkey, { limit });
      
      return signatures.map(sig => ({
        signature: sig.signature,
        slot: sig.slot,
        blockTime: sig.blockTime,
        status: sig.err ? 'failed' : 'success',
      }));
    } catch (error) {
      console.error('Failed to get transactions:', error);
      return [];
    }
  }

  async sendTransaction(signedTransaction: Buffer): Promise<TransactionResult> {
    try {
      const signature = await this.connection.sendRawTransaction(signedTransaction);
      await this.connection.confirmTransaction(signature);
      
      return { signature, success: true };
    } catch (error: any) {
      return { 
        signature: '', 
        success: false, 
        error: error.message || 'Transaction failed' 
      };
    }
  }

  async getSlot(): Promise<number> {
    return this.connection.getSlot();
  }

  async getLatestBlockhash(): Promise<{ blockhash: string; lastValidBlockHeight: number }> {
    return this.connection.getLatestBlockhash();
  }
}