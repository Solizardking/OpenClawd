<div align="center">
<a href="https://github.com/openclawd/openclawd">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="OpenClawd" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Renzo OpenClawd Plugin

Restake tokens on [Renzo](https://www.renzoprotocol.com/).

## Installation
```
npm install @openclawdsolana/plugin-renzo
yarn add @openclawdsolana/plugin-renzo
pnpm add @openclawdsolana/plugin-renzo
```

## Setup
```typescript
import { renzo } from "@openclawdsolana/plugin-renzo";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
        renzo(),
    ],
});
```

## Tools
- Deposit ERC20 tokens
- Deposit ETH
- Get Renzo deposit address

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/openclawd/openclawd">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="OpenClawd" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
