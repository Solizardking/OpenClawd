<div align="center">
<a href="https://github.com/openclawd/openclawd">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="OpenClawd" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# ENS OpenClawd Plugin

Resolve [ENS](https://ens.domains/) names to addresses.

## Installation
```bash
npm install @openclawdsolana/plugin-ens
yarn add @openclawdsolana/plugin-ens
pnpm add @openclawdsolana/plugin-ens
```

## Usage
```typescript
import { ens } from "@openclawdsolana/plugin-ens";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
        ens({
            provider: // Your provider url
        })
    ]
});
```

## Tools
1. Get address from ENS name

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/openclawd/openclawd">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="OpenClawd" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
