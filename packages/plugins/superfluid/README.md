<div align="center">
<a href="https://github.com/openclawd/openclawd">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="OpenClawd" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Superfluid OpenClawd Plugin

Interact with the [Superfluid Protocol](https://docs.superfluid.finance/).

## Installation
```
npm install @openclawdsolana/plugin-superfluid
yarn add @openclawdsolana/plugin-superfluid
pnpm add @openclawdsolana/plugin-superfluid
```

## Setup
    
```typescript
import { superfluid } from "@openclawdsolana/plugin-superfluid";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
        superfluid(),
    ],
});
```

## Tools
- Create or Update or Delete Flow
- Get Flow Rate
- Get Units
- Update Member Units
- Get Total Flow Rate

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/openclawd/openclawd">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="OpenClawd" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
