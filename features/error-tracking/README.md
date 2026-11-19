# @exodus/error-tracking

A simple namespaces error tracking package to let any feature collect errors and create the report

## Install

```sh
pnpm add @exodus/error-tracking
```

## Usage

This feature is designed to be used together with `@exodus/headless`. See [using the sdk](../../docs/development/using-the-sdk.md).

### Play with it

1. Open the playground https://exodus-hydra.pages.dev/features/errors
2. Try out the some methods via the UI. These corresponds 1:1 with the `exodus.errors` API.
3. Run in the Dev Tools Console:

```ts
await exodus.errors.track({
  namespace: safeString`balances`,
  error: new Error('Encountered an issue when computing total balances'),
  context: {},
})
```

### API Side

See [using the sdk](../../docs/development/using-the-sdk.md#setup-the-api-side) for more details on how features plug into the SDK and the API interface in the [type declaration](./api/index.d.ts).

```ts
import { safeString } from '@exodus/safe-string'
import type { SafeContextType } from '@exodus/errors'

// Track error with optional context (see SafeContextType for available properties).
const context: SafeContextType = {
  /* ... */
}
await exodus.errors.track({ namespace: safeString`wallet`, error, context })
```

**Important:** The `namespace` parameter must be a SafeString to prevent dynamic values from being used. Use the `safeString` template tag from `@exodus/safe-string`:

```ts
// ✅ Correct - safe string namespace
await exodus.errors.track({
  namespace: safeString`balances`,
  error: new Error('Failed to compute balances'),
})

// ❌ Incorrect - plain strings not allowed
const NAMESPACE = 'my-namespace'
await exodus.errors.track({
  namespace: NAMESPACE,
  error: new Error('Some error'),
})
```

If you're building a feature and like to use error tracking inside that feature, you can depend on `errorTracking` and will receive the module with a track method that is auto-namespaced to your feature id.
