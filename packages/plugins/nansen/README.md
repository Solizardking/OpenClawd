<div align="center">
<a href="https://github.com/openclawd/openclawd">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="OpenClawd" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Nansen OpenClawd Plugin
This plugin enables AI agents to interact with [Nansen](https://nansen.ai/) to get information about wallets and tokens.

## Installation

```bash
npm install @openclawdsolana/plugin-nansen
yarn add @openclawdsolana/plugin-nansen
pnpm add @openclawdsolana/plugin-nansen
```

## Usage

```typescript
import { nansen } from "@openclawdsolana/plugin-nansen";

const tools = await getOnChainTools({
    wallet: viem(wallet),
    plugins: [
        nansen(),
    ],
});
```

## Tools
- Get information about NFT trades
- Get flows of tokens associated with smart money addresses
- Get trading signals
- Get token details
- Get NFT details

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/openclawd/openclawd">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="OpenClawd" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
