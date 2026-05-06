<div align="center">
<a href="https://github.com/openclawd/openclawd">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="OpenClawd" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Crossmint Headless Checkout OpenClawd Plugin

Purchase any NFT with [Crossmint Checkout](https://crossmint.com/)

## Installation
```bash
npm install @openclawdsolana/plugin-crossmint-headless-checkout
yarn add @openclawdsolana/plugin-crossmint-headless-checkout
pnpm add @openclawdsolana/plugin-crossmint-headless-checkout
```

## Usage

```typescript
import { crossmintHeadlessCheckout } from "@openclawdsolana/plugin-crossmint-headless-checkout";



const tools = await getOnChainTools({
    wallet: // ...
    plugins: [crossmintHeadlessCheckout({
        apiKey: process.env.CROSSMINT_API_KEY // Get it from: https://crossmint.com/
    })]
});
```

## Tools
* Buy token

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/openclawd/openclawd">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="OpenClawd" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
