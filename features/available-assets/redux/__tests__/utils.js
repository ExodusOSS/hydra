import { connectAssets } from '@exodus/assets'
import assetsBase from '@exodus/assets-base'
import assetsReduxModule from '@exodus/assets-feature/redux/index.js'
import { keyBy } from '@exodus/basic-utils'
import combinedAssetsList from '@exodus/combined-assets-meta'
import { setupRedux } from '@exodus/redux-dependency-injection'
import { combineReducers, createStore } from 'redux'

import availableAssetsReduxDefinition from '../index.js'

const combinedAssets = keyBy(combinedAssetsList, ({ name }) => name)
export const {
  bitcoin,
  ethereum,
  _usdcoin: usdcoin,
  usdcoin: usdcoinEthereum,
  usdcoin_solana: usdcoinSolana,
  usdcoin_algorand: usdcoinAlgorand,
  usdcoin_ftx: usdcoinFtx,
} = connectAssets({
  ...combinedAssets,
  ...assetsBase,
})

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

  emitAssets(
    keyBy([bitcoin, ethereum, usdcoin, usdcoinSolana, usdcoinAlgorand, usdcoinFtx], 'name')
  )
  emitAvailableAssetNames(new Set())

  return { ...redux, store, emitAvailableAssetNames, emitAvailableAssetNamesByWalletAccount }
}
