import { mapValues } from '@exodus/basic-utils'

import id from './id.js'
import initialState from './initial-state.js'
import selectorDefinitions from './selectors/index.js'

const availableAssetsReduxDefinition = {
  id,
  type: 'redux-module',
  initialState,
  eventReducers: {
    availableAssetNames: (state, availableAssetNames) => ({
      ...state,
      data: new Set(availableAssetNames),
    }),
    availableAssetNamesByWalletAccount: (state, availableAssetNamesByWalletAccount) => ({
      ...state,
      assetNamesByWalletAccount: mapValues(
        availableAssetNamesByWalletAccount,
        (assetNames) => new Set(assetNames)
      ),
    }),
  },
  selectorDefinitions,
}

export default availableAssetsReduxDefinition
