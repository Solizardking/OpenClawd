<div align="center">
<a href="https://github.com/openclawd/openclawd">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="OpenClawd" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Solana MagicEden Plugin

Interact with [MagicEden](https://magiceden.io/) on Solana.

## Installation
```
npm install @openclawdsolana/plugin-solana-magiceden
yarn add @openclawdsolana/plugin-solana-magiceden
pnpm add @openclawdsolana/plugin-solana-magiceden
```

## Setup
```typescript
import { magicEden } from "@openclawdsolana/plugin-solana-magiceden";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
        magicEden({
            apiKey: process.env.MAGICEDEN_API_KEY,
        }),
    ],
});
```

## Tools
- Get NFT information
- Buy NFT

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/openclawd/openclawd">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="OpenClawd" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
