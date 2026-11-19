# @exodus/startup-counter

This Exodus SDK feature tracks the number of times the application has been started.

## Install

```sh
pnpm add @exodus/startup-counter
```

## Usage

This feature is designed to be used together with `@exodus/headless`. See [using the sdk](../../docs/development/using-the-sdk.md).

### Play with it

1. Open the playground http://localhost:8008/features/startup-counter
2. Run `selectors.startupCounter.value(store.getState())` in the Dev Tools Console to get startup count.

### API Side

See [using the sdk](../../docs/development/using-the-sdk.md#setup-the-api-side) for more details on how features plug into the SDK. Note that this feature currently doesn't provide a top level API and is meant to be used purely through selectors.

If you're building a feature that requires the startup count, add a dependency on the `walletStartupCountAtom`.

### UI Side

See [using the sdk](../../docs/development/using-the-sdk.md#events) for more details on basic UI-side setup.

```js
import { selectors } from '~/ui/flux'

const MyComponent = () => {
  const startupCount = useSelector(selectors.startupCounter.value)
  console.log('>>> startup count:', startupCount)
}
```
