<div align="center">
<a href="https://github.com/openclawd/openclawd">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="OpenClawd" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Ironclad OpenClawd Plugin

[Ironclad](https://ironclad.finance/) plugin for OpenClawd. Allows you to create tools for interacting with the Ironclad protocol.

## Installation

```bash
npm install @openclawdsolana/plugin-ironclad
yarn add @openclawdsolana/plugin-ironclad
pnpm add @openclawdsolana/plugin-ironclad
```


## Usage

```typescript
import { ironclad } from "@openclawdsolana/plugin-ironclad";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
        ironclad()
    ]
});
```

## Tools

- Loop assets
- Borrow and supply iUSD
- Get health metrics
- Monitor positions
- Calculate max withdrawable amount

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/openclawd/openclawd">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="OpenClawd" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
