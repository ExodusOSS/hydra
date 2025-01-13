# @exodus/fee-data-monitors

This Exodus SDK feature provides `feeData`, which are inputs for fee calculations performed by the client when building a transaction for user approval. The shape of `feeData` **varies per asset**, e.g. it might contain `feePerKB` for `bitcoin` and `baseFeePerGas` for ethereum.

The `feeData` returned by this monitor MAY be assembled from several parts:

- Static fee related data defined in asset libraries
- Fee related data fetched from [remote-config](../remote-config/)
- Fee related data fetched by the asset specific fee data monitor

## Install

```sh
yarn add @exodus/fee-data-monitors
```

## Usage

This feature is designed to be used together with `@exodus/headless`. See [using the sdk](../../docs/docs-website/docs/development/using-the-sdk.md).

### Play with it

1. Open the playground https://exodus-hydra.pages.dev/features/fee-data-monitors
2. Run `await exodus.fees.getFeeData({ assetName: 'bitcoin' })` in the Dev Tools Console.
3. Run `selectors.feeData.createData('bitcoin')(store.getState())` in the Dev Tools Console.

### API Side

See [using the sdk](../../docs/docs-website/docs/development/using-the-sdk.md#setup-the-api-side) for more details on how features plug into the SDK and the API interface in the [type declaration](./api/index.d.ts).

```ts
const bitcoinFeeData = await exodus.fees.getFeeData({ assetName: 'bitcoin' })
```

If you're building a feature that requires the wallet's addresses, add a dependency on the `feeDataAtom` atom, which stores data in the shape of `{ [assetName]: feeData }`

### UI Side

See [using the sdk](../../docs/docs-website/docs/development/using-the-sdk.md#events) for more details on basic UI-side setup.

```jsx
import { useSelector } from 'react-redux'
import selectors from '~/ui/flux/selectors'

const MyComponent = () => {
  // TODO: API and selector namespaces should match
  const feeData = useSelector(selectors.feeData.createData('bitcoin'))
  return <Text>{JSON.stringify(feeData)}</Text>
}
```
