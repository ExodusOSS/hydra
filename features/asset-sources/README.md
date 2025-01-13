# @exodus/asset-sources

Provides compatibility info and metadata about asset sources. An asset source is a combination of a `walletAccount` and an `asset`.

## Install

```sh
yarn add @exodus/asset-sources
```

## Usage

This feature is designed to be used together with `@exodus/headless`. See [using the sdk](../../docs/docs-website/docs/development/using-the-sdk.md).

### Play with it

1. Open the playground https://exodus-hydra.pages.dev/features/asset-sources
2. Try out some methods via the UI. These correspond 1:1 with the `exodus.assetSources` API.
3. Run `await exodus.assetSources.isSupported({assetName: 'bitcoin', walletAccount: 'exodus_0'})` in the Dev Tools Console.

### API Side

See [using the sdk](../../docs/docs-website/docs/development/using-the-sdk.md#setup-the-api-side) for more details on how features plug into the SDK and the API interface in the [type declaration](./api/index.ts).

```ts
await exodus.assetSources.isSupported({
  walletAccount: 'exodus_0',
  assetName: 'bitcoin',
}) // true

await exodus.assetSources.isSupported({
  walletAccount: 'trezor_0_123',
  assetName: 'solana',
}) // false, until Exodus adds Trezor support in our integration

await exodus.assetSources.getSupportedPurposes({
  walletAccount: 'exodus_0',
  assetName: 'bitcoin',
}) // [84, 86, 44]

await exodus.assetSources.getSupportedPurposes({
  walletAccount: 'trezor_0_123',
  assetName: 'bitcoin',
}) // [84, 49]

await exodus.assetSources.getDefaultPurpose({
  walletAccount: 'exodus_0',
  assetName: 'bitcoin',
}) // 84

await exodus.assetSources.getDefaultPurpose({
  walletAccount: 'exodus_0',
  assetName: 'cardano',
}) // 44

await exodus.assetSources.getDefaultPurpose({
  walletAccount: 'trezor_0_123',
  assetName: 'cardano',
}) // 1852
```

### UI Side

See [using the sdk](../../docs/docs-website/docs/development/using-the-sdk.md#events) for more details on basic UI-side setup.

```jsx
import { selectors } from '~/ui/flux'

const AvailableAssetsByWalletAccountDisplay = () => {
  const availableAssetsByWalletAccount = useSelector(
    selectors.assetSources.availableAssetNamesByWalletAccount
  )

  const supportedAssetsTexts = Object.entries(availableAssetsByWalletAccount).map(
    ([walletAccountName, supportedAssets]) => (
      <Text>
        {walletAccountName} ==> {Array.from(supportedAssets).join(' ')}
      </Text>
    )
  )

  return <>{supportedAssetsTexts}</>
}
```
