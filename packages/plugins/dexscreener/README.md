<div align="center">
<a href="https://github.com/openclawd/openclawd">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="OpenClawd" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# DexScreener OpenClawd Plugin

[DexScreener](https://dexscreener.com/) plugin for OpenClawd. Allows you to create tools for interacting with the DexScreener API.

## Installation
```bash
npm install @openclawdsolana/plugin-dexscreener
yarn add @openclawdsolana/plugin-dexscreener
pnpm add @openclawdsolana/plugin-dexscreener
```

## Usage
```typescript
import { dexscreener } from "@openclawdsolana/plugin-dexscreener";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
        dexscreener()
    ]
});
```

## Tools
1. Get pairs by chain and pairId
2. Search pairs
3. Get token pairs by token address

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/openclawd/openclawd">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="OpenClawd" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
