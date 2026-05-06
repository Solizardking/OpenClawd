<div align="center">
<a href="https://github.com/openclawd/openclawd">

<img src="https://github.com/user-attachments/assets/5fc7f121-259c-492c-8bca-f15fe7eb830c" alt="OpenClawd" width="100px" height="auto" style="object-fit: contain;">
</a>
</div>

# Zetrix Wallet for OpenClawd
## Installation

```
npm install @openclawdsolana/wallet-zetrix
yarn add @openclawdsolana/wallet-zetrix
pnpm add @openclawdsolana/wallet-zetrix
```

## Usage

```typescript
import ZtxChainSDK from "zetrix-sdk-nodejs";

const sdk = new ZtxChainSDK({
  host: process.env.NODE_URL,
  secure: true
});

const zetrixAccount = process.env.ZETRIX_ACCOUNT;
const zetrixAccountPrivateKey = process.env.ZETRIX_ACCOUNT_PRIVATE_KEY;

const tools = await getOnChainTools({
    wallet: zetrix({
        zetrixSDK: sdk,
        zetrixAccount: zetrixAccount,
        zetrixAccountPrivateKey: zetrixAccountPrivateKey
    }),
});
```

<footer>
<br/>
<br/>
<div>
<a href="https://github.com/openclawd/openclawd">
  <img src="https://github.com/user-attachments/assets/59fa5ddc-9d47-4d41-a51a-64f6798f94bd" alt="OpenClawd" width="100%" height="auto" style="object-fit: contain; max-width: 800px;">
</a>
</div>
</footer>
