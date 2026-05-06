<div align="center">
<a href="https://github.com/openclawd/openclawd">
<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="OpenClawd" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# OpenGradient OpenClawd Plugin

This plugin integrates the OpenGradient service with the OpenClawd, providing on-chain ML model inference and LLM interactions.

## Installation
```bash
npm install @openclawdsolana/plugin-opengradient
yarn add @openclawdsolana/plugin-opengradient
pnpm add @openclawdsolana/plugin-opengradient
```

## Usage
```typescript
import { opengradient } from "@openclawdsolana/plugin-opengradient";

const tools = await getOnChainTools({
    wallet: viem(wallet),
    plugins: [
        opengradient(),
    ],
});
```

## Tools
* `opengradient_model_inference` - Run inference on machine learning models using OpenGradient
* `opengradient_llm_completion` - Generate text completions using LLMs through OpenGradient
* `opengradient_llm_chat` - Interact with LLMs using a chat interface through OpenGradient


<footer>
<br/>
<br/>
<div>
<a href="https://github.com/openclawd/openclawd">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="OpenClawd" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
