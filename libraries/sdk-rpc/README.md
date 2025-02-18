# @exodus/sdk-rpc

RPC and client specifically tailored to allow for easy consumption of the Exodus SDK APIs across RPC

## Install

```
yarn add @exodus/sdk-rpc
```

## Usage

This library is ideally to be used as a wrapper around `@exodus/headless` or `@exodus/wallet-sdk` to expose the methods of the SDK to be called over RPC.

```ts
// in the process that instantiates the RPC server
import createWalletSdk from '@exodus/wallet-sdk'
import { RPC } from '@exodus/sdk-rpc'

const rpc = new RPC({
  transport: windowTransport,
})

const walletSdkApi = createWalletSdk({
  // ...deps
}).resolve()

rpc.exposeMethods(walletSdkApi)
```

```ts
// in the process that instantiates the RPC client
import type { WalletSdkApi } from '@exodus/wallet-sdk'
import { RPC, createRPCClient } from '@exodus/sdk-rpc'

const rpc = new RPC({
  transport: windowTransport, // or webviewTransport in Mobile
})

const sdk = createRPCClient<WalletSdkApi>(rpc)

// call methods
const exists = await sdk.wallet.exists()
```
