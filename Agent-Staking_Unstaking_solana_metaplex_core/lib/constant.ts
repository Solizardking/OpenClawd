import { PublicKey } from '@solana/web3.js';

export const GLOBAL_AUTHORITY_SEED = 'global-authority';

export const PROGRAM_ID = new PublicKey(
  process.env.OPENCLAWD_AGENT_STAKING_PROGRAM_ID ??
    'Fg6PaFpoGXkYsidMpWxTWqz4iyToFhRmD31x9WfP3YpR'
);

export const CORE_COLLECTION_ADDRESS = new PublicKey(
  process.env.OPENCLAWD_AGENT_COLLECTION ??
    '11111111111111111111111111111111'
);

export const DEFAULT_DEVNET_RPC =
  process.env.SOLANA_RPC_URL ??
  'https://devnet.helius-rpc.com/?api-key=2b52295c-5873-465e-8d71-91f28dc0053d';
