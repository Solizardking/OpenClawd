# OpenClawd Steak Map

`steak/` is the OpenClawd Agent Staking protocol: an Anchor program and
TypeScript transaction surface for locking Metaplex Core agent assets without
custody.

## Directory Map

```text
steak/
├── programs/mpl-corenft-staking/   Anchor program source
├── cli/                            ts-node operator commands
├── lib/                            constants, IDL, transaction builders
├── tests/                          Anchor integration tests
├── Anchor.toml                     devnet/localnet program mapping
├── package.json                    build/test/deploy scripts
└── .env.example                    safe local environment template
```

## Current Devnet Mapping

```text
Program ID: D5MLxrKAnppBVLuukKQzQGTMSfEwBqWCDPGAhGhthdLP
Pool seed:  global-authority
MPL Core:   CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d
Default RPC: https://api.devnet.solana.com
```

The active program id must stay aligned across:

- `programs/mpl-corenft-staking/src/lib.rs`
- `Anchor.toml`
- `lib/constant.ts`
- `target/idl/openclawd_agent_staking.json` after build
- frontend env such as `VITE_OPENCLAWD_AGENT_STAKING_PROGRAM_ID`

## Commands

```bash
cd steak
npm install
npm run typecheck
npm run build
npm test
```

Operator commands:

```bash
npm run script:devnet -- init
npm run script:devnet -- stake --asset <core-asset> --collection <core-collection>
npm run script:devnet -- unstake --asset <core-asset> --collection <core-collection>
```

Legacy aliases remain available:

```bash
npm run script:devnet -- lock --asset <core-asset> --collection <core-collection>
npm run script:devnet -- unlock --asset <core-asset> --collection <core-collection>
```

## Safety

- Public devnet config contains no committed private RPC API keys.
- `.anchor/`, `target/`, `node_modules/`, local ledgers, and wallet keypairs
  must stay untracked.
- Mainnet scripts are blocked unless `OPENCLAWD_ENABLE_MAINNET=1` is set.
- Mainnet still requires an explicit `[programs.mainnet]` entry,
  upgrade-authority review, and admin recovery runbook.

