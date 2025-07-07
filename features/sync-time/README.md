# @exodus/sync-time

This Exodus SDK feature provides a `startOfHour` timestamp via redux, which is synchronized with the Exodus server time.

## Install

```sh
yarn add @exodus/sync-time
```

## Usage

This feature is designed to be used together with `@exodus/headless`. See [using the sdk](../../docs/development/using-the-sdk.md).

```js
import createExodus from '@exodus/headless'
import syncTime from '@exodus/sync-time'

const container = createExodus({ adapters, config, debug })
container.use(syncTime())
```

### Play with it

1. Open the playground http://localhost:8008/features/time
2. Run `new Date(selectors.time.startOfHour(store.getState()))` in the Dev Tools Console.

### API Side

See [using the sdk](../../docs/development/using-the-sdk.md#setup-the-api-side) for more details on how features plug into the SDK. Note that this feature currently doesn't provide a top level API.

### UI Side

See [using the sdk](../../docs/development/using-the-sdk.md#events) for more details on basic UI-side setup.

> [!IMPORTANT]
> You probably do NOT want to use the `selectors.time.time` selector as its value will only be updated periodically.

```jsx
import exodus from '~/ui/exodus'
import selectors from '~/ui/flux/selectors'

const MyComponent = () => {
  const startOfHour = useSelector(selectors.time.startOfHour)
  console.log('>>> startOfHour', startOfHour) // timestamp with millis
}
```
