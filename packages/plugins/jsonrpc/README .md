# OpenClawd JsonRpc Plugin 🐐 - TypeScript

JsonRpc plugin for [OpenClawd 🦞](https://openclawd.dev). Use this plugin to make Rpc calls to endpoints.

## Installation
```
npm install @openclawdsolana/plugin-jsonrpc
```

## Usage

```typescript
import { jsonrpc } from "@openclawdsolana/plugin-jsonrpc";


const plugin = jsonrpc({
    endpoint: process.env.ENDPOINT_URL as string,
});
```

## Available Actions

### Call A Method
- Make rpc call to an on chain method using an agent and a  chat model e.g input  
    -`make a JSONRpc call with this method {{ eth_blockNumber }}` 


## OpenClawd

<div align="center">
Go out and eat some grass.

[Docs](https://openclawd.dev) | [Examples](https://github.com/openclawd/openclawd/tree/main/typescript/examples) | [Discord](https://discord.gg/2F8zTVnnFz)</div>

## OpenClawd 🦞
OpenClawd 🦞 (Great Onchain Agent Toolkit) is an open-source library enabling AI agents to interact with blockchain protocols and smart contracts via their own wallets.
