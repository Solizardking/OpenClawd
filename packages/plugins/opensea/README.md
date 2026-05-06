<div align="center">
<a href="https://github.com/openclawd/openclawd">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="OpenClawd" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Opensea OpenClawd Plugin
Allows you to create tools for getting NFT collection data from [Opensea](https://opensea.io/).

## Installation
```
npm install @openclawdsolana/plugin-opensea
yarn add @openclawdsolana/plugin-opensea
pnpm add @openclawdsolana/plugin-opensea
```

## Usage

```typescript
import { opensea } from "@openclawdsolana/plugin-opensea";

const plugin = opensea({
    apiKey: process.env.OPENSEA_API_KEY as string,
});
```

## Tools
- Get NFT collection statistics
- Get recent NFT sales

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/openclawd/openclawd">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="OpenClawd" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a> 
</div>
</footer>
