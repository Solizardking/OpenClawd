<div align="center">
<a href="https://github.com/openclawd/openclawd">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="OpenClawd" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# 0x OpenClawd Plugin

Get quotes and swap on [0x](https://0x.org/)

## Installation
```bash
npm install @openclawdsolana/plugin-0x
yarn add @openclawdsolana/plugin-0x
pnpm add @openclawdsolana/plugin-0x
```

## Usage
```typescript
import { zeroEx } from '@openclawdsolana/plugin-0x';

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
       zeroEx({
            apiKey: process.env.ZEROEX_API_KEY // Get it from: https://dashboard.0x.org/
       })
    ]
});
```

## Tools
* Get quote
* Swap tokens

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/openclawd/openclawd">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="OpenClawd" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
