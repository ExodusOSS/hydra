# @exodus/fees

This Exodus SDK feature provides an API to calculate fees for a draft transaction.

## Install

```sh
yarn add @exodus/fees
```

## Usage

This feature is designed to be used together with `@exodus/headless` and is included by default. See [using the sdk](../../docs/development/using-the-sdk.md).

### Play with it

1. Open the playground https://exodus-hydra.pages.dev/features/fees
2. Run `await exodus.fees.getFees({ assetName: 'bitcoin', walletAccount: 'exodus_0' })` in the Dev Tools Console.

### API Side

See [using the sdk](../../docs/development/using-the-sdk.md#setup-the-api-side) for more details on how features plug into the SDK and the API interface in the [type declaration](./api/index.d.ts).

```ts
const { fee } = await exodus.fees.getFees({ assetName: 'bitcoin', walletAccount: 'exodus_0' })
```

### UI Side

See [using the sdk](../../docs/development/using-the-sdk.md#events) for more details on basic UI-side setup.
