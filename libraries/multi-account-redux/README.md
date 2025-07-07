# `@exodus/multi-account-redux`

Selectors and utilities for managing state with the following shape:

```js
{
  [yourStateSliceName]: {
    [walletAccount]: {
      error: null,
      loaded: true,
      data: {
        [assetName]: {}, // TxSet/UtxoCollection/etc.
      },
    },
  }
}
```

## Install

```sh
yarn add @exodus/multi-account-redux
```

## Usage

```js
import { TxSet } from '@exodus/models'
import { createReduxModuleHelper } from '@exodus/multi-account-redux'

const helper = createReduxModuleHelper({
  slice: 'someAssetSourceRelatedData',
  createInitialPerAssetData: () => TxSet.EMPTY,
})

const myReduxModule = {
  id: 'someAssetSourceRelatedData',
  initialState: helper.createInitialState(),
  eventReducers: {
    someAssetSourceRelatedData: (state, data) => {
      // check source code for other utils for merging/resetting state
      return helper.setAccounts(state, data)
    },
  },
  selectorDefinitions: [...helper.selectorDefinitions, ...customSelectorDefinitions],
}
```
