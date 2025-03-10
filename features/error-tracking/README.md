# @exodus/error-tracking

A simple namespaces error tracking package to let any feature collect errors and create the report

## Install

```sh
yarn add @exodus/error-tracking
```

## Usage

This feature is designed to be used together with `@exodus/headless`. See [using the sdk](../../docs/development/using-the-sdk.md).

### Play with it

1. Open the playground https://exodus-hydra.pages.dev/features/errors
2. Try out the some methods via the UI. These corresponds 1:1 with the `exodus.errors` API.
3. Run `await exodus.errors.track({ namespace: 'balances', error: 'Encountered an issue when computing total balances', context: {} })` in the Dev Tools Console.

### API Side

See [using the sdk](../../docs/development/using-the-sdk.md#setup-the-api-side) for more details on how features plug into the SDK and the API interface in the [type declaration](./api/index.d.ts).

```ts
await exodus.errors.track({ namespace, error, context: {} })
await exodus.errors.trackRemote({ error })
```

If you're building a feature and like to use error tracking inside that feature, you can depend on `errorTracking` and will receive the module with a track method that is auto-namespaced to your feature id.
