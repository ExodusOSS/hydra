import { setupRedux } from '@exodus/redux-dependency-injection'
import { combineReducers, createStore } from 'redux'

import assetsReduxDefinition from '../../../assets-feature/redux/index.js'
import enabledAssetsReduxDefinition from '../../../enabled-assets/redux/index.js'
import assetSourcesReduxDefinition from '../index.ts'

export function setup({ dependencies = [] } = {}) {
  const allDependencies = [
    ...dependencies,
    assetSourcesReduxDefinition,
    enabledAssetsReduxDefinition,
    assetsReduxDefinition,
  ]

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

  const emitAvailableAssetNamesByWalletAccount = (value) =>
    handleEvent('availableAssetNamesByWalletAccount', value)

  const emitEnabledAssets = (data) => handleEvent('enabledAssets', data)
  const emitAssets = (data) => handleEvent('assets', { assets: data })

  return { ...redux, store, emitAvailableAssetNamesByWalletAccount, emitEnabledAssets, emitAssets }
}
