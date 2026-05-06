<div align="center">
<a href="https://github.com/openclawd/openclawd">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="OpenClawd" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Kim OpenClawd Plugin

Swap and manage liquidity positions on [Kim](https://kim.exchange/).

## Installation

```bash
npm install @openclawdsolana/plugin-kim
yarn add @openclawdsolana/plugin-kim
pnpm add @openclawdsolana/plugin-kim
```


## Usage

```typescript
import { kim } from "@openclawdsolana/plugin-kim";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
        kim()
    ]
});
```

## Tools
- Swap in a single or multiple hops
- Create liquidity positions and manage them

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/openclawd/openclawd">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="OpenClawd" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
