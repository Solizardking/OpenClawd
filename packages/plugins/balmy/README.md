<div align="center">
<a href="https://github.com/openclawd/openclawd">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="OpenClawd" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Balmy OpenClawd Plugin 🐐

Allows you to create tools for interacting with the [Balmy](https://balmy.xyz/) protocol - a state-of-the-art DCA (Dollar Cost Average) protocol that enables users to DCA any ERC20 into any ERC20 with their preferred period frequency.

## Installation
```bash
npm install @openclawdsolana/plugin-balmy
yarn add @openclawdsolana/plugin-balmy
pnpm add @openclawdsolana/plugin-balmy
```

## Usage

```typescript
import { balmy } from "@openclawdsolana/plugin-balmy";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
       balmy()
    ]
});
```

## Tools
- Get quote
- Execute swap

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/openclawd/openclawd">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="OpenClawd" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
