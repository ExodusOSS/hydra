# @exodus/modular-redux

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Quick start](#quick-start)
- [Dependencies](#dependencies)
- [Enhanced Store API](#enhanced-store-api)
- [Utils API](#utils-api)

## Overview

Redux Store enhancer to support building modular features on top of Redux.

With Modular Redux, each Redux module is responsible for registering itself with the store rather than the other way around. This means not having to export a reducer function (keeping these Redux-specific concepts hidden). This also enables each module to work with more than one "slice" of the state.

## Installation

```sh
yarn add @exodus/modular-redux
```

## Quick start

```js
import modularRedux from '@exodus/modular-redux'
import { createStore, applyMiddleware } from 'redux'

const initialState = {}

const middleware = [
  /* ... middlewares */
]

const enhancers = compose(modularRedux, applyMiddleware(...middleware))

const store = createStore(reducers, initialState, enhancers)
```

## Dependencies

Redux modules relies on injecting dependencies for all those things that are out of your module's scope. For example, if a specific module requires geolocation data, it might be wiser to pass this as a module dependency instead of dealign with it internally. Specially if the way it works depends on the target application (the way we get geolocation in mobile might be different than in desktop). This way, we can start building small, testable and composable modules we can reuse throughout features.

## Enhanced Store API

### `store.injectReducer(name, reducer)`

Registers a new Redux state slice.

#### Arguments

| Name    | Description                                                                   |
| ------- | ----------------------------------------------------------------------------- |
| name    | Name of Redux slice. This will be used as state key in the global Redux state |
| reducer | Reducer function that dictates how the register slice state mutates           |

## Utils API

Util functions exported from `@exodus/modular-redux` to bind different pieces of logic to Redux store

### `bindActionCreators(store, actions, deps, onError)`

Wrapper around `redux.bindActionCreators` to bind action creators to the store and module dependencies

#### Arguments

| Name    | Description                                                                               |
| ------- | ----------------------------------------------------------------------------------------- |
| store   | Redux store                                                                               |
| actions | Module action creators object, each with the form of `(deps) => action`                   |
| deps    | Module dependencies. See [Dependencies](#dependencies) for mode details.                  |
| onError | Error handling function. Called everytime something goes wrong on some action. _Optional_ |

#### Returns

Bound actions object you can return from your module and call directly to dispatch events

### `bindHooks(store, hooks, deps)`

Bind functions to state changes.

#### Arguments

| Name  | Description                                                                 |
| ----- | --------------------------------------------------------------------------- |
| store | Redux store                                                                 |
| hooks | Hooks definition object in the form of `{ email: [emailSelector, hookFn] }` |
| deps  | Module dependencies. See [Dependencies](#dependencies) for mode details.    |

### `bindSelectors(store, selectors)`

Transform selector functions into a declarative API to read data out of the Redux slice.

> This is an experimental API. Selectors should be still exported from each module for compatibility reasons and other selector composability

#### Arguments

| Name      | Description                                                                              |
| --------- | ---------------------------------------------------------------------------------------- |
| store     | Redux store                                                                              |
| selectors | Module selectors functions object. Ex. `{ getBalaceSelector: (state) => state.balance }` |

#### Returns

Selectors API. Each selector entry on the provided object is returned as a getter function. Ex. `{ getBalaceSelector: (state) => state.balance }` -> `{ getBalace: () => balance }`
