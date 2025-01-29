# @exodus/tx-simulator

This Exodus SDK feature allows you to simulate the state of an account after a given transaction. It's only supported for a small subset of assets, and simulation parameters depend on the asset.

## Install

```sh
yarn add @exodus/tx-simulator
```

## Usage

This feature is designed to be used together with `@exodus/headless`. See [using the sdk](../../docs/development/using-the-sdk.md).

```js
import createExodus from '@exodus/headless'
import txSimulator from '@exodus/tx-simulator'

const container = createExodus({ adapters, config, debug })
container.use(txSimulator())

const exodus = container.resolve()
// result shape varies by asset
const result = await exodus.txSimulator.simulate({
  assetName: 'ethereum', // currently 'ethereum' or 'solana'
  // ... asset specific fields
})
```

### API Side

See [using the sdk](../../docs/development/using-the-sdk.md#setup-the-api-side) for more details on how features plug into the SDK and the API interface in the [type declaration](./src/api/index.ts).

If you're building a feature that requires transaction simulation, add a dependency on the `txSimulator` module and use `txSimulator.simulate` exactly as you would `exodus.txSimulator.simulate`.

### UI Side

See [using the sdk](../../docs/development/using-the-sdk.md#events) for more details on basic UI-side setup.
