<div align="center">
<a href="https://github.com/openclawd/openclawd">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="OpenClawd" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Mayan OpenClawd Plugin

Cross-chain token swap using [Mayan SDK](https://github.com/mayan-finance/swap-sdk) (Solana, EVM, SUI).

## Installation
```bash
npm install @openclawdsolana/plugin-mayan
yarn add @openclawdsolana/plugin-mayan
pnpm add @openclawdsolana/plugin-mayan
```

## Usage
```typescript
import { mayan } from '@openclawdsolana/plugin-mayan';

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
       mayan()
    ]
});
```

## Tools
- Swap from Solana to Solana, EVM, SUI
- Swap from EVM to EVM, Solana, SUI

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/openclawd/openclawd">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="OpenClawd" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
