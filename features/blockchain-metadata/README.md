# `@exodus/blockchain-metadata`

This feature stores and manages transaction logs as well as account states of wallet accounts in a central location.

## Install

```sh
yarn add @exodus/blockchain-metadata
```

## Usage

This feature is designed to be used together with `@exodus/headless`. See [using the sdk](../../docs/development/using-the-sdk.md).

### API Side

See [using the sdk](../../docs/development/using-the-sdk.md#setup-the-api-side) for more details on how features plug into the SDK and the API interface in the [type declaration](./api/index.d.ts).

If you're building a feature that needs to write transaction logs or account states you can also use the batching feature of blockchain-metadata, which will only emit once after all updates are processed. Depend on the `blockchainMetadata` node and use the `batch` method to queue up updates:

```ts
await blockchainMetadata
  .batch()
  .updateAccountState({
    assetName: 'bitcoin',
    walletAccount: 'exodus_0',
    newData: { cursor: 'some cursor' },
  })
  .updateAccountState({
    assetName: 'ethereum',
    walletAccount: 'exodus_0',
    newData: { cursor: 'some cursor' },
  })
  .updateTxs({
    assetName: 'ethereum',
    walletAccount: 'exodus_0',
    txs: [{ id: '123', confirmations: 42 }],
  })
  .commit()
```
