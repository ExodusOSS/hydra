# @exodus/available-assets

This Exodus SDK feature tracks available assets, i.e. assets that the user can potentially enable via the UI.

## Install

```sh
yarn add @exodus/available-assets
```

## Usage

This feature is designed to be used together with `@exodus/headless`. See [using the sdk](../../docs/development/using-the-sdk.md).

### Play with it

1. Open the playground https://exodus-hydra.pages.dev/features/available-assets
2. Run `exodus.availableAssets.get()` in the Dev Tools Console.
3. Run `selectors.availableAssets.all(store.getState())` in the Dev Tools Console.
4. Run `selectors.availableAssets.get(store.getState())('bitcoin')` in the Dev Tools Console.
5. Try out some other selectors from `selectors.availableAssets`. See example usage in [tests](./redux/__tests__/selectors/).

### API Side

See [using the sdk](../../docs/development/using-the-sdk.md#setup-the-api-side) for more details on how features plug into the SDK and the API interface in the [type declaration](./api/index.d.ts).

If you're building a feature that requires knowing available assets, add a dependency on the `availableAssetNamesAtom`.

### UI Side

See [using the sdk](../../docs/development/using-the-sdk.md#events) for more details on basic UI-side setup.

```js
import selectors from '~/ui/flux/selectors'

const MyComponent = () => {
  const bitcoin = useSelector((state) => selectors.availableAssets.get(state)('bitcoin'))
  if (!bitcoin) return <div>Bitcoin is not supported</div>
}
```
