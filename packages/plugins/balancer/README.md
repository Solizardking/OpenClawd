<div align="center">
<a href="https://github.com/openclawd/openclawd">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="OpenClawd" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Balancer OpenClawd Plugin

Get quotes and swap on [Balancer](https://balancer.fi/)

## Installation
```bash
npm install @openclawdsolana/plugin-balancer
yarn add @openclawdsolana/plugin-balancer
pnpm add @openclawdsolana/plugin-balancer
```

## Usage
```typescript
import { balancer } from '@openclawdsolana/plugin-balancer';

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
       balancer({
            rpcUrl: process.env.RPC_URL,
       })
    ]
});
```

## Tools
* Swap tokens
* Add liquidity
* Remove liquidity

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/openclawd/openclawd">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="OpenClawd" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
