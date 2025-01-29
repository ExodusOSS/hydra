# Redux Modules

Redux modules enable dependency injection for the vast graph of selectors that accompany features. They enable selectors to live within [feature packages](legos.md#features) and depend on other selectors from other features without package.json `dependencies`.

Underneath `@exodus/redux-dependency-injection` uses the same IOC container as the `@exodus/headless`, it just provides some syntactic sugar to make selector definitions less verbose.

## Example

The unconfirmed balance selector from the `balances` feature [depends on](https://github.com/ExodusOSS/hydra/blob/8ac3c1382e3d51923de4d73c43c32f92005ae351/features/balances/redux/selectors/create-unconfirmed-balance.js#L20) a selector from the [assets feature](https://github.com/ExodusOSS/hydra/blob/8ac3c1382e3d51923de4d73c43c32f92005ae351/features/assets-feature/redux/selectors/index.js#L8)

This dependency is resolved at runtime and allows the two features to be developed and tested independently. Each redux module has an `id`, usually corresponding to the feature `id`. This id controls:

- Where the feature's state is mounted into the redux store, e.g. the [balances redux module](https://github.com/ExodusOSS/hydra/blob/8ac3c1382e3d51923de4d73c43c32f92005ae351/features/balances/redux/id.js#L1)'s state will be available at `store.getState().balances`.
- The selectors namespace on the `selectors` object, e.g. all balances selectors are available at `selectors.balances`

## Anatomy of a Redux Module

See [@exodus/redux-dependency-injection](https://github.com/ExodusOSS/hydra/tree/master/libraries/redux-dependency-injection#redux-module-definitions) for a detailed explanation of the Redux module format.

## Assembly

The minimal assembly code will shrink when `@exodus/headless/redux` [ships soon](https://github.com/ExodusOSS/hydra/issues/6139), but for now, you will need to do a bit of wiring:

```js
import modularRedux from '@exodus/modular-redux'
import { setupRedux } from '@exodus/redux-dependency-injection'
import { createStore } from 'redux'
import { composeWithDevTools as compose } from 'redux-devtools-extension/developmentOnly'

import walletAccounts from '@exodus/wallet-accounts/redux'
import balances from '@exodus/balances/redux'

const { selectors, createHandleEvent, reducers, initialState } = setupRedux({
  dependencies: [
    // your redux modules go here, e.g.
    walletAccounts,
    balances,
  ],
  createLogger: () => console,
})

const enhancers = compose(modularRedux)
export const store = createStore(reducers, initialState, enhancers)

// connect this to @exodus/headless with:
// exodus.subscribe(({ type, payload }) => handleEvent(type, payload))
export const handleEvent = createHandleEvent(store)

// exports selectors namespaced by feature, e.g. `selectors.walletAccounts.active`
export { selectors }
```
