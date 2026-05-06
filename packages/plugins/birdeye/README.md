<div align="center">
<a href="https://github.com/openclawd/openclawd">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="OpenClawd" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Birdeye OpenClawd Plugin 🐐

Get token information from [Birdeye](https://birdeye.so/)

## Installation
```bash
npm install @openclawdsolana/plugin-birdeye
yarn add @openclawdsolana/plugin-birdeye
pnpm add @openclawdsolana/plugin-birdeye
```

## Usage

```typescript
import { birdeye } from "@openclawdsolana/plugin-birdeye";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
       birdeye({
            apiKey: process.env.BIRDEYE_API_KEY,
       })
    ]
});
```

## Tools
- Get token price
- Get token history price
- Get OHLCV price of token
- Get OHLCV price of pair
- Get token security
- Get trending tokens
- Search for a token

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/openclawd/openclawd">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="OpenClawd" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
