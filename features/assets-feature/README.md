# @exodus/assets-feature

This Exodus SDK feature provides access to instances of all blockchain asset adapters supported by the wallet, and enables you to search for and add custom tokens at runtime. Added tokens persist across restarts.

## Install

```sh
yarn add @exodus/assets-feature
```

## Usage

`@exodus/assets-feature` is bundled with `@exodus/headless`. It injects the `assetsAtom` into the IOC, which you can then reference in your feature's dependencies to get all/any particular assets.

Example:

```js
const myModule = {
  id: 'myModule',
  type: 'module,
  factory: ({ assetsAtom }) => {
    // get all assets known at this moment
    const { value: assets } = await assetsAtom.get()
    assetsAtom.observe(({ value }) => {
      // do something with updated assets
    })
  },
  dependencies: ['assetsAtom']
}
```

### Play with it

1. Open the playground https://exodus-hydra.pages.dev/features/assets
2. Run `await exodus.assets.getAsset('bitcoin')` in the Dev Tools Console.
3. Run `await exodus.assets.searchTokens({ lifecycleStatus: ['c', 'v'], baseAssetName: 'ethereum' })` in the Dev Tools Console.
4. Run `await exodus.assets.addTokens({ assetIds: ['0x455e53CBB86018Ac2B8092FdCd39d8444aFFC3F6'], baseAssetName: 'ethereum', allowedStatusList: ['c', 'v'] })` in the Dev Tools Console to add the Polygon Ecosystem Token token on the ethereum chain (not financial advice).

See [api/index.d.ts](./api/index.d.ts) for more details on the API and token validation/curation status.

### API Side

See [using the sdk](../../docs/docs-website/docs/development/using-the-sdk.md#setup-the-api-side) for more details on how features plug into the SDK and the API interface in the [type declaration](./api/index.d.ts).

### UI Side

See [using the sdk](../../docs/docs-website/docs/development/using-the-sdk.md#events) for more details on basic UI-side setup.

```js
import selectors from '~/ui/flux/selectors'

const MyComponent = () => {
  const bitcoin = useSelector(selectors.assets.createAssetByNameSelector('bitcoin'))
  const tx = await bitcoin.api.signTx({
    // ...,
  })
}
```
