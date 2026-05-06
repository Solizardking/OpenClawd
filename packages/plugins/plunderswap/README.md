<div align="center">
<a href="https://github.com/openclawd/openclawd">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="OpenClawd" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# PlunderSwap OpenClawd Plugin
Swap tokens on [PlunderSwap](https://plunderswap.xyz/).

## Installation
```
npm install @openclawdsolana/plugin-plunderswap
yarn add @openclawdsolana/plugin-plunderswap
pnpm add @openclawdsolana/plugin-plunderswap
```

## Usage

```typescript
import { plunderswap } from "@openclawdsolana/plugin-plunderswap";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
        plunderswap(),
    ],
});
```

## Tools
- Get quotes
- Swap tokens
- Wrap and unwrap ZIL

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/openclawd/openclawd">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="OpenClawd" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a> 
</div>
</footer>
