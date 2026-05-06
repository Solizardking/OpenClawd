<div align="center">
<a href="https://github.com/openclawd/openclawd">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="OpenClawd" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Fuel Wallet for OpenClawd

## Installation

```
npm install @openclawdsolana/wallet-fuel
yarn add @openclawdsolana/wallet-fuel
pnpm add @openclawdsolana/wallet-fuel
```

## Usage

```typescript
import { Provider, Wallet } from "fuels";
import { fuel } from "@openclawdsolana/wallet-fuel";
import { getOnChainTools } from "@openclawdsolana/core";

const provider = await Provider.create(
    "https://mainnet.fuel.network/v1/graphql"
);

const tools = await getOnChainTools({
    wallet: fuel({
        privateKey: process.env.FUEL_WALLET_PRIVATE_KEY,
        provider,
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