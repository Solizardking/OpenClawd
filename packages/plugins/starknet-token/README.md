<div align="center">
<a href="https://github.com/openclawd/openclawd">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="OpenClawd" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Starknet Token OpenClawd Plugin

Interact with tokens on the [Starknet](https://www.starknet.io/) blockchain.


## Installation

```bash
npm install @openclawdsolana/plugin-starknet-token
yarn add @openclawdsolana/plugin-starknet-token
pnpm add @openclawdsolana/plugin-starknet-token
```

## Usage
```typescript
import { starknetToken, STARKNET_TOKENS } from "@openclawdsolana/plugin-starknet-token";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
        starknetToken({ tokens: STARKNET_TOKENS }),
    ],
});
```

## Tools
- Get token info by symbol
- Transfer token
- Get the balance of token

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/openclawd/openclawd">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="OpenClawd" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
