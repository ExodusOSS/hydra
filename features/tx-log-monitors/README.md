# @exodus/tx-log-monitors

This Exodus SDK feature loads transaction history for all enabled assets. It also provides the option to force refresh transaction history for assets individually or en masse.

## Install

```sh
yarn add @exodus/tx-log-monitors
```

## Usage

This feature is designed to be used together with `@exodus/headless`. See [using the sdk](../../docs/development/using-the-sdk.md).

### Play with it

1. Open the playground https://exodus-hydra.pages.dev/features/tx-log-monitors
2. Run `await exodus.txLogMonitors.update({ assetName: 'bitcoin' })` in the Dev Tools Console.

### API Side

See [using the sdk](../../docs/development/using-the-sdk.md#setup-the-api-side) for more details on how features plug into the SDK and the API interface in the [type declaration](./api/index.d.ts).

```ts
await exodus.txLogMonitors.update({ assetName: 'bitcoin' })
```

### UI Side

This feature doesn't export any redux state or selectors.
