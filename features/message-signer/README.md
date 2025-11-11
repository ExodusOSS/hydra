# @exodus/message-signer

The message signer delegates the unsigned message to the corresponding software or hardware wallet.

## Install

```sh
yarn add @exodus/message-signer
```

## Usage

This feature is designed to be used together with `@exodus/headless`. See [using the sdk](../../docs/development/using-the-sdk.md).

### Play with it

1. Open the playground https://exodus-hydra.pages.dev/features/message-signer
2. Try out the some methods via the UI. These corresponds 1:1 with the `exodus.messageSigner` API.
3. Run the below in the Dev Tools Console:

```js
await exodus.messageSigner.signMessage({
  walletAccount: 'exodus_0',
  baseAssetName: 'ethereum',
  purpose: 44,
  message: { rawMessage: Buffer.from('hello world') },
})
```

### API Side

See [using the sdk](../../docs/development/using-the-sdk.md#setup-the-api-side) for more details on how features plug into the SDK and the API interface in the [type declaration](./src/api/index.ts).

```ts
await exodus.messageSigner.signMessage({
  walletAccount,
  baseAssetName: asset.name,
  purpose: 44,
  message: { rawMessage: Buffer.from('hello world') },
})
```
