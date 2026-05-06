<div align="center">
<a href="https://github.com/openclawd/openclawd">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="OpenClawd" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# OpenClawd SNS Plugin

Resolve [SNS](https://www.sns.id/) domain names to Solana addresses.

## Installation
```
npm install @openclawdsolana/plugin-sns
yarn add @openclawdsolana/plugin-sns
pnpm add @openclawdsolana/plugin-sns
```

## Usage

```typescript
import { sns } from "@openclawdsolana/plugin-sns";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
        sns(),
    ],
});
```

## Tools
- Resolve SNS domain names to Solana addresses

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/openclawd/openclawd">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="OpenClawd" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
