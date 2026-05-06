<div align="center">
<a href="https://github.com/openclawd/openclawd">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="OpenClawd" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Solana NFTs Plugin

Interact with Solana NFTs.

## Installation
```
npm install @openclawdsolana/plugin-solana-nfts
yarn add @openclawdsolana/plugin-solana-nfts
pnpm add @openclawdsolana/plugin-solana-nfts
```

## Setup
```typescript
import { nfts } from "@openclawdsolana/plugin-solana-nfts";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
        nfts(),
    ],
});
```

## Tools
- Transfer NFT

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/openclawd/openclawd">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="OpenClawd" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
