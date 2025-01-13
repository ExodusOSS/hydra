# @exodus/headless-react

The headless Exodus React SDK.

## Table of Contents

- [Quick Start](#quick-start)
- [API Reference](#api-reference)

## Quick Start

The first step is wrapping your app in `<HeadlessProvider />`. This will expose all shared and necesary utils for feature headless UI libraries to work.

```js
import { HeadlessProvider } from '@exodus/headless-react'

// At the root of the app
const App = () => {
  return (
    <ReduxProvider store={store}>
      <HeadlessProvider
        exodus={exodus}
        adapters={adapters}
        selectors={selectors}
      >
        // {... rest of the app}
      </>
    </ReduxProvider>
  )
}
```

> It's important `<HeadlessProvider />` is inside `<ReduxProvider />` as it depends on it for state UI storing

From here, any piece of UI (specially the one living on headless UI libraries) can consume hooks exposed by `@exodus/headless-react`:

```js
const MyHeadlessComponent = () => {
  const exodus = useExodus()

  const selectors = useSelectors()

  const [assetName, setAssetName] = useGlobalState({
    namespace: 'my-feature',
    key: 'amount',
    defaultValue: 'bitcoin',
    persist: true,
  })

  // Business logic...
}
```

## API Reference

### `HeadlessProvider`

#### Props

- **exodus**: Exodus SDK reference
- **adapters**: Platform adapters (currenlty only `storage` is required)
- **selectors**: Redux selector collection. Most likely coming from feature redux modules

### `useExodus`

#### Arguments

_None_

#### Returns

Passed exodus SDK reference

### `useSelectors`

#### Arguments

_None_

#### Returns

Passed selector collection

### `useGlobalState`

#### Arguments

- **namespace** _String_: Feature namespace under which this state will be stored in Redux
- **key** _String_: State key under which this state will be stored in Redux
- **defaultValue** _Any_: Default value of state before is first written
- **persist** _Boolean_: Wether this state shuold be persisted in storage or not

#### Returns

`React.useState` compatible API _Array_

- **[0]**: state value
- **[1]**: setter function
