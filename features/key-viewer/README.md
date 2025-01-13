# @exodus/key-viewer

Export an asset's encoded private key for software wallet accounts

## Install

```sh
yarn add @exodus/key-viewer
```

## Usage

This feature is designed to be used together with `@exodus/headless`. See [using the sdk](../../docs/docs-website/docs/development/using-the-sdk.md).

### Play with it

1. Open the playground https://exodus-hydra.pages.dev/features/key-viewer
2. Try out the some methods via the UI. These corresponds 1:1 with the `exodus.keyViewer` API.
3. Run `await exodus.keyViewer.getEncodedPrivateKeys({ walletAccount: 'exodus_0', baseAssetName: 'bitcoin' })` in the Dev Tools Console.

### API Side

See [using the sdk](../../docs/docs-website/docs/development/using-the-sdk.md#setup-the-api-side) for more details on how features plug into the SDK and the API interface in the [type declaration](./api/index.ts).

```js
// hex encoded private key
const key = await exodus.keyViewer.getEncodedPrivateKey({
  baseAssetName,
  walletAccount,
})

// array of key + address + key identifier
const keys = await exodus.keyViewer.getEncodedPrivateKeys({
  baseAssetName,
  walletAccount,
})
```
