<div align="center">
<a href="https://github.com/openclawd/openclawd">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="OpenClawd" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Velodrome OpenClawd Plugin

Swap tokens on [Velodrome](https://velodrome.finance/).

## Installation

```
npm install @openclawdsolana/plugin-velodrome
yarn add @openclawdsolana/plugin-velodrome
pnpm add @openclawdsolana/plugin-velodrome
```

## Usage

```typescript
import { velodrome } from "@openclawdsolana/plugin-velodrome";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [velodrome()],
});
```

## Advanced Usage with ERC20 Plugin

For improved integration to work seamlessly with the ERC20 plugin, you can configure your tools as follows:

```typescript
import { modeGovernance } from "@openclawdsolana/plugin-mode-governance";

const tools = await getOnChainTools({
    wallet: // ...
    plugins: [
        modeGovernance()
    ]
});
```

## Tools

- Add liquidity
- Swap tokens

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/openclawd/openclawd">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="OpenClawd" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
