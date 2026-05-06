<div align="center">
<a href="https://github.com/openclawd/openclawd">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="OpenClawd" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Uniswap OpenClawd Plugin
Swap tokens on [Uniswap](https://uniswap.org/).

## Installation
```
npm install @openclawdsolana/plugin-uniswap
yarn add @openclawdsolana/plugin-uniswap
pnpm add @openclawdsolana/plugin-uniswap
```

## Usage
You can get your Uniswap API key [here](https://hub.uniswap.org/).

For testing purposes, you can use the following base URL and API key:

```typescript
UNISWAP_BASE_URL="https://trade-api.gateway.uniswap.org/v1"
UNISWAP_API_KEY="kHEhfIPvCE3PO5PeT0rNb1CA3JJcnQ8r7kJDXN5X"
```

Use the plugin in your code:
```typescript
import { uniswap } from "@openclawdsolana/plugin-uniswap";


const plugin = uniswap({
    baseUrl: process.env.UNISWAP_BASE_URL as string,
    apiKey: process.env.UNISWAP_API_KEY as string,
});
```

## Tools
- Get quote
- Swap tokens

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/openclawd/openclawd">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="OpenClawd" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
