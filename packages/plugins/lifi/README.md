<div align="center">
<a href="https://github.com/openclawd/openclawd">
<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="OpenClawd" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# LiFi OpenClawd Plugin

Bridge tokens across chains using [LiFi](https://li.fi/).

## Installation

```bash
npm install @openclawdsolana/plugin-lifi
yarn add @openclawdsolana/plugin-lifi
pnpm add @openclawdsolana/plugin-lifi
```

## Usage

```typescript
import { lifi } from "@openclawdsolana/plugin-lifi";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
        lifi({
            apiKey: "your-lifi-api-key" // optional
        })
    ]
});
```

## Tools

- Get bridge quotes
- Execute cross-chain token transfers

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/openclawd/openclawd">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="OpenClawd" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
