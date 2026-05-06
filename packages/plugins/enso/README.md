<div align="center">
<a href="https://github.com/openclawd/openclawd">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="OpenClawd" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Enso OpenClawd Plugin

Get access to 180+ protocols through [Enso](https://enso.build/) for onchain actions, such as swap, deposit, lend, borrow etc.

## Installation

```bash
npm install @openclawdsolana/plugin-enso
yarn add @openclawdsolana/plugin-enso
pnpm add @openclawdsolana/plugin-enso
```

## Usage

```typescript
import { enso } from '@openclawdsolana/plugin-enso';

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
       enso({
            apiKey: process.env.ENSO_API_KEY
       })
    ]
});
```

## Tools

- Find the most optimal route between 2 tokens and execute it

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/openclawd/openclawd">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="OpenClawd" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
