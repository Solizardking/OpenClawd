<div align="center">
<a href="https://github.com/openclawd/openclawd">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="OpenClawd" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# RugCheck OpenClawd Plugin

Check if a token is a rug pull on [RugCheck](https://rugcheck.xyz/).

## Installation
``` 
npm install @openclawdsolana/plugin-rugcheck
yarn add @openclawdsolana/plugin-rugcheck
pnpm add @openclawdsolana/plugin-rugcheck
```

## Setup
```typescript
import { rugcheck } from "@openclawdsolana/plugin-rugcheck";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
        rugcheck(),
    ],
});
```

## Tools
- Get recently detected tokens
- Get trending tokens in the last 24h
- Get tokens with the most votes in the last 24h
- Get recently verified tokens
- Generate a report summary for the given token mint

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/openclawd/openclawd">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="OpenClawd" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
