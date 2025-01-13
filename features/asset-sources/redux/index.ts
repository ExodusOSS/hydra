import { mapValues } from '@exodus/basic-utils'

import selectorDefinitions from './selectors/index.js'

export type AssetSourcesState = {
  availableAssetNamesByWalletAccount: Record<string, Set<string>> // { [walletAccount]: [assetName0, assetName1, ...] }
}

const initialState: AssetSourcesState = {
  availableAssetNamesByWalletAccount: {},
}

const eventReducers = {
  availableAssetNamesByWalletAccount: (
    state: AssetSourcesState,
    data: Record<string, string[]>
  ) => ({
    ...state,
    availableAssetNamesByWalletAccount: mapValues(
      data,
      (assetNames: string[]) => new Set(assetNames)
    ),
  }),
}

const assetSourcesReduxDefinition = {
  id: 'assetSources',
  type: 'redux-module',
  initialState,
  eventReducers,
  selectorDefinitions,
} as const

export default assetSourcesReduxDefinition
