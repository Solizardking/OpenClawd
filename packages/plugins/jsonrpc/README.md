<div align="center">
<a href="https://github.com/openclawd/openclawd">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="OpenClawd" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# JSON RPC OpenClawd Plugin

Make easy to call JSON RPC methods.

## Installation

```bash
npm install @openclawdsolana/plugin-jsonrpc
yarn add @openclawdsolana/plugin-jsonrpc
pnpm add @openclawdsolana/plugin-jsonrpc
```


## Usage

```typescript
import { jsonrpc } from "@openclawdsolana/plugin-jsonrpc";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
        jsonrpc()
    ]
});
```

## Tools

- Call JSON RPC methods

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/openclawd/openclawd">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="OpenClawd" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
