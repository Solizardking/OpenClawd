# OpenClawd Steak Map

`steak/` is the OpenClawd Agent Staking protocol: an Anchor program and
TypeScript transaction surface for locking Metaplex Core agent assets without
custody. It maps to the public hub route `/staking`.

## Directory Map

```text
steak/
├── programs/mpl-corenft-staking/   Anchor Rust program source
├── cli/                            ts-node operator commands
├── lib/                            constants, IDL, transaction builders
├── tests/                          Anchor integration tests
├── Anchor.toml                     devnet/localnet program mapping
├── Cargo.toml                      Rust workspace
├── package.json                    build/test/deploy scripts
└── .env.example                    safe local environment template, if present
```

Generated/local-only paths:

```text
steak/.anchor/
steak/target/
steak/node_modules/
```

These stay ignored and should not be committed. They contain local ledger data,
build artifacts, and installed dependencies.

## Current Devnet Mapping

```text
Program ID:      D5MLxrKAnppBVLuukKQzQGTMSfEwBqWCDPGAhGhthdLP
Global pool PDA: EyDhP1HU3yqCmqCpKkQHFuX3wMD6sJF1kK8eeRwmTr1K
Pool seed:       global-authority
MPL Core:        CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d
Default RPC:     https://api.devnet.solana.com
Default route:   /staking
```

The active program id must stay aligned across:

- `programs/mpl-corenft-staking/src/lib.rs`
- `Anchor.toml`
- `lib/constant.ts`
- `target/idl/openclawd_agent_staking.json` after build
- frontend env such as `VITE_OPENCLAWD_AGENT_STAKING_PROGRAM_ID`

## Root Commands

```bash
npm run install:steak
npm run steak:devnet -- init
npm run steak:devnet -- stake --asset <CORE_ASSET> --collection <CORE_COLLECTION>
npm run steak:devnet -- unstake --asset <CORE_ASSET> --collection <CORE_COLLECTION>
npm run build:steak
npm run test:steak
```

Legacy aliases remain available:

```bash
npm run steak:devnet -- lock --asset <CORE_ASSET> --collection <CORE_COLLECTION>
npm run steak:devnet -- unlock --asset <CORE_ASSET> --collection <CORE_COLLECTION>
```

## Safety

Use `SOLANA_RPC_URL` or `ANCHOR_PROVIDER_URL` for private RPC endpoints. Do not
commit populated RPC keys, deployer keypairs, wallet JSON, or `.env` files.

- `.anchor/`, `target/`, `node_modules/`, local ledgers, and wallet keypairs
  must stay untracked.
- Mainnet scripts are blocked unless `OPENCLAWD_ENABLE_MAINNET=1` is set.
- Mainnet still requires an explicit `[programs.mainnet]` entry,
  upgrade-authority review, and admin recovery runbook.
