# OpenClawd Agent Staking Protocol

OpenClawd Agent Staking is an Anchor program for staking and unstaking Metaplex Core agent assets on Solana. It is built for OpenClawd's agent economy: agents can be represented as Core assets, locked into a protocol-owned staking state, and later unlocked by the owner or the configured admin.

The program targets Solana mainnet-beta, but should always be built, tested, and rehearsed on localnet/devnet before a mainnet deployment.

## What It Does

- Initializes a global staking pool PDA with an admin authority.
- Stakes a Metaplex Core asset by adding a frozen `FreezeDelegate` plugin.
- Unstakes the asset by unfreezing it and removing the `FreezeDelegate` plugin.
- Tracks total staked Core agent assets in the global pool.
- Provides a TypeScript CLI for init, lock, and unlock flows.

## Project Layout

- `programs/mpl-corenft-staking/` - Anchor Rust program.
- `cli/` - command-line entrypoint for init, stake, and unstake operations.
- `lib/` - transaction builders and Solana/Metaplex helper code.
- `tests/` - Anchor integration tests.
- `Anchor.toml` - cluster, wallet, and program-id configuration.

## Mainnet Environment

Set these before interacting with mainnet:

```bash
export SOLANA_RPC_URL="https://your-mainnet-rpc.example"
export ANCHOR_WALLET="$HOME/.config/solana/openclawd-mainnet-deployer.json"
export OPENCLAWD_AGENT_STAKING_PROGRAM_ID="<deployed-program-id>"
export OPENCLAWD_AGENT_COLLECTION="<metaplex-core-collection-address>"
```

Do not commit deployer keypairs, populated env files, or wallet JSON files.

## Devnet Environment

The devnet default RPC is:

```bash
export SOLANA_RPC_URL="https://devnet.helius-rpc.com/?api-key=2b52295c-5873-465e-8d71-91f28dc0053d"
```

If Yarn fails with `Failed to replace env in config: ${NPM_TOKEN}`, define a
placeholder token before invoking Yarn. This is needed because Yarn reads npm
config before it runs package scripts:

```bash
export NPM_TOKEN="${NPM_TOKEN:-unused}"
```

## Install

```bash
npm install
```

## Build

```bash
npm run build
```

Anchor writes the program binary and IDL into `target/`. The active program id must match:

- `declare_id!()` in `programs/mpl-corenft-staking/src/lib.rs`
- `Anchor.toml`
- `OPENCLAWD_AGENT_STAKING_PROGRAM_ID`
- `lib/constant.ts`

For a real mainnet deployment, generate or reuse a dedicated program keypair first, then update all four places to the resulting public key.

## Test

```bash
npm test
```

Run localnet/devnet tests before mainnet. The provided test initializes the global pool; expand it with collection-specific stake/unstake fixtures before production launch.

## Deploy

### Devnet rehearsal

```bash
solana config set --url "$SOLANA_RPC_URL"
solana config set --keypair "$ANCHOR_WALLET"
npm run deploy:devnet
```

### Mainnet deployment

Mainnet deployment should only happen after a clean build, a devnet rehearsal, and an explicit program id check.

```bash
solana config set --url "$SOLANA_RPC_URL"
solana config set --keypair "$ANCHOR_WALLET"
solana balance
npm run deploy:mainnet
```

After deployment, initialize the global pool:

```bash
npm run script:devnet -- init
```

## Stake An Agent Asset

```bash
yarn script:devnet lock \
  --asset <agent-core-asset-address> \
  --collection "$OPENCLAWD_AGENT_COLLECTION"
```

The asset must be a Metaplex Core asset whose update authority is the configured collection.

## Unstake An Agent Asset

```bash
yarn script:devnet unlock \
  --asset <agent-core-asset-address> \
  --collection "$OPENCLAWD_AGENT_COLLECTION"
```

The unlock flow unfreezes the asset and removes the `FreezeDelegate` plugin.

## Safety Notes

- The current program does not issue token rewards. It is a staking lock/unlock primitive.
- The global admin can unlock assets when authorized by program constraints.
- Use a dedicated deployer and program authority. Do not deploy from a hot trading wallet.
- Use a paid, rate-limited mainnet RPC for production. Public RPC is not reliable enough for launch operations.
- Run `anchor keys sync` after changing the program keypair.

## OpenClawd Integration

This protocol is intended to sit under OpenClawd's Solana-native financial agent stack. A typical production deployment pairs it with:

- agent minting via Metaplex Core
- policy checks in the OpenClawd backend
- staking status indexing
- wallet-gated agent actions
- admin runbooks for emergency unlocks

## License

MIT
