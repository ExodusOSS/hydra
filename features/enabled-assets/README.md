# @exodus/enabled-assets

This Exodus SDK feature provides a way to enable/disable assets, as well as auto-enable them under certain conditions, e.g. when the asset is involved in a purchase/sale/exchange.

## Install

```sh
yarn add @exodus/enabled-assets
```

## Usage

This feature is used inside `@exodus/headless` (see [using the sdk](../../docs/development/using-the-sdk.md))

The separate usage may look like:

```js
import enabledAssets from '@exodus/enabled-assets'

const ioc = createIOC({ adapters, config, debug })
ioc.use(
  enabledAssets({
    defaultEnabledAssetsList: ['bitcoin', 'ethereum'],
    defaultEnabledAssetsListForFreshWallets: ['bitcoin', 'ethereum'],
    alwaysAutoEnable: true, // determines if asset with balance should be auto enabled regardless of previous user's disabling
    throttleInterval: 500,
  })
)
```

If you're building a feature that needs to know which assets are enabled, add a dependency on the `enabledAssetsAtom`, which stores data in the shape:

`{ "<assetName>": boolean }`

### Play with it

1. Open the playground https://exodus-hydra.pages.dev/features/enabled-assets
2. Try the following methods in the Dev Tools Console:

```js
await exodus.assets.disable(['bitcoin'])
await exodus.assets.enable(['bitcoin'])
```

### UI Side

See [using the sdk](../../docs/development/using-the-sdk.md#events) for more details on basic UI-side setup.

```js
import selectors from '~/ui/flux/selectors'

const MyComponent = () => {
  const enabledAssetsDict = useSelector(selectors.enabledAssets.data)
  const isBitcoinEnabled = useSelector(selectors.enabledAssets.createIsEnabled('bitcoin'))
}
```
