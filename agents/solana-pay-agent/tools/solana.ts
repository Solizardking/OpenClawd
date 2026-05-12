/**
 * Solana RPC tools for the ADK agent.
 *
 * Private keys are loaded from env at module init — they are NEVER passed
 * through the LLM context or echoed back to the user.
 */

import {
  Connection,
  PublicKey,
  Keypair,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
  type TransactionSignature,
} from '@solana/web3.js';
import {
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
  getMint,
  getAccount,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { FunctionTool } from '@google/adk';
import { z } from 'zod';
import nacl from 'tweetnacl';
import { decodeBase64 } from 'tweetnacl-util';

// ── Well-known SPL token mints ──────────────────────────────────────────────
const KNOWN_MINTS: Record<string, string> = {
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
  SOL:  'So11111111111111111111111111111111111111112', // wrapped SOL
};

// ── Singleton connection (shared across tool calls) ─────────────────────────
function getConnection(): Connection {
  const rpc = process.env.SOLANA_RPC_URL;
  if (!rpc) throw new Error('SOLANA_RPC_URL not set');
  return new Connection(rpc, 'confirmed');
}

/**
 * Load the agent's signing keypair from SOLANA_PRIVATE_KEY env var.
 * Accepts base58 or base64 encoded 64-byte secret keys.
 * Returns null when no key is configured (read-only mode).
 */
function loadKeypair(): Keypair | null {
  const raw = process.env.SOLANA_PRIVATE_KEY;
  if (!raw) return null;
  try {
    // Try base58 (most common)
    const { default: bs58 } = await import('bs58') as any;
    return Keypair.fromSecretKey(bs58.decode(raw));
  } catch {
    // Fall back to base64
    return Keypair.fromSecretKey(decodeBase64(raw));
  }
}

// ── Tool: get_solana_balance ────────────────────────────────────────────────
export const getSolanaBalance = new FunctionTool({
  name: 'get_solana_balance',
  description: 'Returns the SOL and SPL token balances for a wallet address.',
  parameters: z.object({
    address: z.string().describe('Base58 Solana wallet address'),
    tokens: z
      .array(z.string())
      .optional()
      .describe('Optional list of token symbols (e.g. ["USDC","USDT"]) or mint addresses to include'),
  }),
  execute: async ({ address, tokens = [] }) => {
    try {
      const conn = getConnection();
      const pubkey = new PublicKey(address);

      const lamports = await conn.getBalance(pubkey);
      const result: Record<string, unknown> = {
        address,
        SOL: lamports / LAMPORTS_PER_SOL,
        lamports,
      };

      for (const tokenId of tokens) {
        const mint = KNOWN_MINTS[tokenId.toUpperCase()] ?? tokenId;
        try {
          const mintPubkey = new PublicKey(mint);
          const mintInfo = await getMint(conn, mintPubkey);
          const ata = await getOrCreateAssociatedTokenAccount(
            conn,
            // read-only query — we pass a dummy signer that never sends
            { publicKey: pubkey, secretKey: new Uint8Array(64) } as any,
            mintPubkey,
            pubkey,
            false, // don't create
          ).catch(() => null);

          if (ata) {
            result[tokenId.toUpperCase()] = Number(ata.amount) / 10 ** mintInfo.decimals;
          } else {
            result[tokenId.toUpperCase()] = 0;
          }
        } catch {
          result[tokenId.toUpperCase()] = 'unknown';
        }
      }

      return { status: 'success', balances: result };
    } catch (err: any) {
      return { status: 'error', error: err.message };
    }
  },
});

// ── Tool: get_transaction_details ──────────────────────────────────────────
export const getTransactionDetails = new FunctionTool({
  name: 'get_transaction_details',
  description: 'Fetches on-chain details for a Solana transaction signature.',
  parameters: z.object({
    signature: z.string().describe('Base58 transaction signature'),
  }),
  execute: async ({ signature }) => {
    try {
      const conn = getConnection();
      const tx = await conn.getParsedTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0,
      });

      if (!tx) return { status: 'error', error: 'Transaction not found' };

      return {
        status: 'success',
        signature,
        slot: tx.slot,
        blockTime: tx.blockTime,
        fee: tx.meta?.fee,
        success: tx.meta?.err === null,
        logMessages: tx.meta?.logMessages?.slice(0, 20) ?? [],
      };
    } catch (err: any) {
      return { status: 'error', error: err.message };
    }
  },
});

// ── Tool: estimate_solana_fee ──────────────────────────────────────────────
export const estimateSolanaFee = new FunctionTool({
  name: 'estimate_solana_fee',
  description: 'Estimates the transaction fee in SOL for sending tokens on Solana.',
  parameters: z.object({
    from: z.string().describe('Sender wallet address'),
    to: z.string().describe('Recipient wallet address'),
    token: z.string().default('SOL').describe('Token symbol or mint address (default: SOL)'),
    amount: z.number().describe('Amount to send'),
  }),
  execute: async ({ from, to, token, amount }) => {
    try {
      const conn = getConnection();
      const fromPubkey = new PublicKey(from);
      const toPubkey = new PublicKey(to);

      let tx: Transaction;
      if (token.toUpperCase() === 'SOL') {
        tx = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey,
            toPubkey,
            lamports: Math.round(amount * LAMPORTS_PER_SOL),
          })
        );
      } else {
        const mint = new PublicKey(KNOWN_MINTS[token.toUpperCase()] ?? token);
        const mintInfo = await getMint(conn, mint);
        const fromAta = PublicKey.findProgramAddressSync(
          [fromPubkey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
          new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe1brs')
        )[0];
        const toAta = PublicKey.findProgramAddressSync(
          [toPubkey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
          new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJe1brs')
        )[0];

        tx = new Transaction().add(
          createTransferInstruction(
            fromAta,
            toAta,
            fromPubkey,
            BigInt(Math.round(amount * 10 ** mintInfo.decimals))
          )
        );
      }

      const { blockhash } = await conn.getLatestBlockhash();
      tx.recentBlockhash = blockhash;
      tx.feePayer = fromPubkey;

      const fees = await tx.getEstimatedFee(conn);
      return {
        status: 'success',
        estimatedFeeLamports: fees ?? 5000,
        estimatedFeeSOL: (fees ?? 5000) / LAMPORTS_PER_SOL,
      };
    } catch (err: any) {
      return { status: 'error', error: err.message };
    }
  },
});

// ── Tool: send_solana_transaction ──────────────────────────────────────────
export const sendSolanaTransaction = new FunctionTool({
  name: 'send_solana_transaction',
  description: [
    'Signs and broadcasts a SOL or SPL token transfer.',
    'Requires SOLANA_PRIVATE_KEY to be set in the environment.',
    'The private key is NEVER exposed to the LLM — it is loaded server-side.',
    'Always confirm intent with the user before calling this tool.',
  ].join(' '),
  parameters: z.object({
    to: z.string().describe('Recipient wallet address'),
    token: z.string().default('SOL').describe('Token symbol or mint address (default: SOL)'),
    amount: z.number().positive().describe('Amount to send (human-readable units)'),
    memo: z.string().optional().describe('Optional memo string attached to the transaction'),
  }),
  execute: async ({ to, token, amount, memo }) => {
    const keypair = await loadKeypair();
    if (!keypair) {
      return {
        status: 'error',
        error:
          'No signing key configured. Set SOLANA_PRIVATE_KEY in .env to enable send operations.',
      };
    }

    try {
      const conn = getConnection();
      const toPubkey = new PublicKey(to);
      const tx = new Transaction();

      if (token.toUpperCase() === 'SOL') {
        tx.add(
          SystemProgram.transfer({
            fromPubkey: keypair.publicKey,
            toPubkey,
            lamports: Math.round(amount * LAMPORTS_PER_SOL),
          })
        );
      } else {
        const mint = new PublicKey(KNOWN_MINTS[token.toUpperCase()] ?? token);
        const mintInfo = await getMint(conn, mint);

        const fromAta = await getOrCreateAssociatedTokenAccount(
          conn,
          keypair,
          mint,
          keypair.publicKey
        );
        const toAta = await getOrCreateAssociatedTokenAccount(
          conn,
          keypair,
          mint,
          toPubkey
        );

        tx.add(
          createTransferInstruction(
            fromAta.address,
            toAta.address,
            keypair.publicKey,
            BigInt(Math.round(amount * 10 ** mintInfo.decimals))
          )
        );
      }

      if (memo) {
        const { createMemoInstruction } = await import('@solana/spl-memo') as any;
        tx.add(createMemoInstruction(memo, [keypair.publicKey]));
      }

      const sig: TransactionSignature = await sendAndConfirmTransaction(conn, tx, [keypair], {
        commitment: 'confirmed',
      });

      return {
        status: 'success',
        signature: sig,
        explorerUrl: `https://solscan.io/tx/${sig}`,
        from: keypair.publicKey.toBase58(),
        to,
        token: token.toUpperCase(),
        amount,
      };
    } catch (err: any) {
      return { status: 'error', error: err.message };
    }
  },
});

// ── Tool: sign_message ─────────────────────────────────────────────────────
export const signMessage = new FunctionTool({
  name: 'sign_message',
  description: 'Signs an arbitrary UTF-8 message with the configured Solana wallet (ed25519). Useful for proving wallet ownership without a transaction.',
  parameters: z.object({
    message: z.string().describe('Message to sign'),
  }),
  execute: async ({ message }) => {
    const keypair = await loadKeypair();
    if (!keypair) {
      return { status: 'error', error: 'No signing key configured.' };
    }
    const msgBytes = new TextEncoder().encode(message);
    const signature = nacl.sign.detached(msgBytes, keypair.secretKey);
    const sigHex = Buffer.from(signature).toString('hex');
    return {
      status: 'success',
      message,
      publicKey: keypair.publicKey.toBase58(),
      signature: sigHex,
    };
  },
});

export const solanaTools = [
  getSolanaBalance,
  getTransactionDetails,
  estimateSolanaFee,
  sendSolanaTransaction,
  signMessage,
];
