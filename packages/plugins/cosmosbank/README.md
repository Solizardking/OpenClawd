<div align="center">
<a href="https://github.com/openclawd/openclawd">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="OpenClawd" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# CosmosBank OpenClawd Plugin
Allows you to create tools for interacting with the bank module on cosmos chains.

## Installation
```bash
npm install @openclawdsolana/plugin-cosmosbank
yarn add @openclawdsolana/plugin-cosmosbank
pnpm add @openclawdsolana/plugin-cosmosbank
```

## Usage

```typescript
import { cosmosbank } from "@openclawdsolana/plugin-cosmosbank";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
       cosmosbank()
    ]
});
```

## Working example

See the [LangChain example](https://github.com/openclawd/openclawd/tree/main/typescript/examples/by-use-case/cosmos-send-and-receive-tokens) for a working example of how to use the CosmosBank plugin.

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/openclawd/openclawd">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="OpenClawd" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
