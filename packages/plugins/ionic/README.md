<div align="center">
<a href="https://github.com/openclawd/openclawd">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="OpenClawd" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Ionic OpenClawd Plugin

[Ionic](https://ionic.money/) plugin for OpenClawd. Allows you to create tools for interacting with the Ionic protocol.

## Installation

```bash
npm install @openclawdsolana/plugin-ionic
yarn add @openclawdsolana/plugin-ionic
pnpm add @openclawdsolana/plugin-ionic
```


## Usage

```typescript
import { ionic } from "@openclawdsolana/plugin-ionic";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
        ionic()
    ]
});
```

## Tools

- Borrow and supply assets
- Loop assets
- Swap collateral

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/openclawd/openclawd">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="OpenClawd" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
