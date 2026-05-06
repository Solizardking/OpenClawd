<div align="center">
<a href="https://github.com/clawdsolana/OpenClawd">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="OpenClawd" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Vercel AI SDK Adapter for OpenClawd

Integrate the more than +200 onchain tools of OpenClawd with [Vercel AI SDK](https://sdk.vercel.ai).

## Installation
```
npm install @openclawdsolana/adapter-vercel-ai
yarn add @openclawdsolana/adapter-vercel-ai
pnpm add @openclawdsolana/adapter-vercel-ai
```

## Usage

See a full working example [here](https://github.com/clawdsolana/OpenClawd/tree/main/typescript/examples/by-framework/vercel-ai).

```ts
import { getOnChainTools } from "@openclawdsolana/adapter-vercel-ai";

const tools = await getOnChainTools({
    wallet: // your wallet
    plugins: // your plugins
});

const result = await generateText({
    model: openai("gpt-4o-mini"),
    tools: tools,
    prompt: "Your prompt here",
});
```

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/clawdsolana/OpenClawd">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="OpenClawd" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
<div>
</footer>
