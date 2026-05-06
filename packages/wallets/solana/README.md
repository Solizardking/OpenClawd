<div align="center">
<a href="https://github.com/openclawd/openclawd">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="OpenClawd" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Solana Wallet for OpenClawd

## Installation
```
npm install @openclawdsolana/wallet-solana
yarn add @openclawdsolana/wallet-solana
pnpm add @openclawdsolana/wallet-solana
```

## Usage
```typescript
import { getOnChainTools } from "@openclawdsolana/adapter-vercel-ai";
import { solana } from "@openclawdsolana/wallet-solana";

import { Connection, Keypair } from "@solana/web3.js";
import * as bip39 from "bip39";

const connection = new Connection(
    "https://api.mainnet-beta.solana.com",
    "confirmed"
);

const mnemonic = process.env.WALLET_MNEMONIC;

const seed = bip39.mnemonicToSeedSync(mnemonic);
const keypair = Keypair.fromSeed(Uint8Array.from(seed).subarray(0, 32));

const tools = await getOnChainTools({
    wallet: solana({
        keypair,
        connection,
    }),
});
```

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/openclawd/openclawd">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="OpenClawd" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
