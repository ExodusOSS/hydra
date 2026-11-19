import assetsReduxModule from '@exodus/assets-feature/redux/index.js'
import { combinedAssetsList, testAssets } from '@exodus/assets-test-meta'
import { keyBy } from '@exodus/basic-utils'
import { setupRedux } from '@exodus/redux-dependency-injection'
import { combineReducers, createStore } from 'redux'

import availableAssetsReduxDefinition from '../index.js'

const combinedAsset = combinedAssetsList.find((a) => a.combinedAssetNames.includes('usdcoin'))

export const {
  bitcoin,
  ethereum,
  usdcoin: usdcoinEthereum,
  usdcoin_solana: usdcoinSolana,
  usdcoin_algorand: usdcoinAlgorand,
} = testAssets

export const usdcoin = testAssets[combinedAsset.name]

export function setup({ dependencies = [] } = {}) {
  const allDependencies = [...dependencies, assetsReduxModule, availableAssetsReduxDefinition]

  const enhancers = (createStore) => (reducers, initialState, enhancer) => {
    const reducer = combineReducers(reducers)
    return createStore(reducer, initialState, enhancer)
  }

  const redux = setupRedux({
    // override default deps with provided by de-duping
    dependencies: allDependencies.filter(
      (dep, i) => allDependencies.findIndex((other) => dep.id === other.id) === i
    ),
  })

  const { createHandleEvent, reducers, initialState } = redux
  const store = createStore(reducers, initialState, enhancers)
  const handleEvent = createHandleEvent(store)

  const emitAssets = (assets) => handleEvent('assets', { assets })

  const emitAvailableAssetNames = (availableAssetNames) =>
    handleEvent('availableAssetNames', availableAssetNames)

  const emitAvailableAssetNamesByWalletAccount = (value) =>
    handleEvent('availableAssetNamesByWalletAccount', value)

  emitAssets(keyBy([bitcoin, ethereum, usdcoin, usdcoinSolana, usdcoinAlgorand], 'name'))
  emitAvailableAssetNames(new Set())

  return { ...redux, store, emitAvailableAssetNames, emitAvailableAssetNamesByWalletAccount }
}
