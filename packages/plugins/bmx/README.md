<div align="center">
<a href="https://github.com/openclawd/openclawd">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="OpenClawd" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# BMX OpenClawd Plugin

Get token information from [BMX](https://www.bmx.trade/)

## Installation
```bash
npm install @openclawdsolana/plugin-bmx
yarn add @openclawdsolana/plugin-bmx
pnpm add @openclawdsolana/plugin-bmx
```

## Usage

```typescript
import { bmx } from "@openclawdsolana/plugin-bmx";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
       bmx()
    ]
});
```

## Tools
- Open positions
- Closed positions
- Get position details

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/openclawd/openclawd">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="OpenClawd" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
