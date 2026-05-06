<div align="center">
<a href="https://github.com/openclawd/openclawd">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="OpenClawd" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# ERC1155 OpenClawd Plugin

This plugin provides support for interacting with ERC1155 tokens.

## Installation

```bash
npm install @openclawdsolana/plugin-erc1155
```

## Usage

```typescript
import { erc1155 } from "@openclawdsolana/plugin-erc1155";
```

### Adding custom tokens

```typescript
import { erc1155 } from "@openclawdsolana/plugin-erc1155";


const plugin = erc1155({
    tokens: [
        {
            decimals: 18,
            symbol: "MYOpenClawd",
            name: "MYOpenClawd",
            id: 1,
            chains: {
                "919": {
                    contractAddress: "0x6f4a5412DB14EC9b109B3db4A9ddD29CE3Ec0754",
                },
            },
        },
    ],
});
```

## Tools

1. Get token info by symbol
2. Get balance
3. Transfer
4. Approve
5. Revoke approval
6. Total supply

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/openclawd/openclawd">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="OpenClawd" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
