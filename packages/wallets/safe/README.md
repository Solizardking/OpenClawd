<div align="center">
<a href="https://github.com/openclawd/openclawd">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="OpenClawd" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Safe Wallet for OpenClawd

## Installation
```
npm install @openclawdsolana/wallet-safe
yarn add @openclawdsolana/wallet-safe
pnpm add @openclawdsolana/wallet-safe
```

## Usage
```typescript
import type { ChatPromptTemplate } from "@langchain/core/prompts";
import { Ollama } from "@langchain/ollama";
import { AgentExecutor, createStructuredChatAgent } from "langchain/agents";
import { pull } from "langchain/hub";

import { baseSepolia } from "viem/chains";

import { getOnChainTools } from "@openclawdsolana/adapter-langchain";

import { sendETH } from "@openclawdsolana/wallet-evm";
import { safe } from "@openclawdsolana/wallet-safe";

require("dotenv").config();

const pk = process.env.WALLET_PRIVATE_KEY as `0x${string}`;

const llm = new Ollama({
    model: "llama3.2:latest",
});

(async (): Promise<void> => {
    const prompt = await pull<ChatPromptTemplate>("hwchase17/structured-chat-agent");

    const tools = await getOnChainTools({
        // The wallet will be deployed on chain and requires eth beforehand.
        wallet: await safe(pk, baseSepolia),
        plugins: [sendETH()],
    });

    const agent = await createStructuredChatAgent({
        llm,
        tools,
        prompt,
    });

    const agentExecutor = new AgentExecutor({
        agent,
        tools,
    });

    const response = await agentExecutor.invoke({
        input: "Send 0.00001 eth to 0xBd33b475626b81A77d7b687AeCc9D547312691ac",
    });

    console.log(response);
})();

```

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/openclawd/openclawd">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="OpenClawd" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>