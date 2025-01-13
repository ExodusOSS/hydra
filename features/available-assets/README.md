# @exodus/available-assets

Tracks supported/available assets, i.e. assets that the user can potentially enable via the UI.

## Install

```sh
yarn add @exodus/available-assets
```

## Usage

```js
// see https://github.com/ExodusMovement/exodus-hydra/blob/c5632b131fd3cd210f658fb45113528c0e227beb/sdks/headless/__tests__/available-assets.test.js#L40
import createExodus from '@exodus/headless'
import availableAssets from '@exodus/available-assets'

const container = createExodus({
  port,
  adapters,
  config: {
    // ...,
    // TODO: support configuring via feature config:
    // `container.use(availableAssets({ defaultAvailableAssetNames: ['bitcoin', 'ethereum']}))`
    availableAssetsAtom: {
      defaultAvailableAssetNames: ['bitcoin', 'ethereum'],
    },
  },
})

container.use(availableAssets())

const exodus = container.resolve()

const availableAssetNames = await exodus.availableAssets.get() // ['bitcoin', 'ethereum']
```
