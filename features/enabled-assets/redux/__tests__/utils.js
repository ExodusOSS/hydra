import assetsReduxModule from '@exodus/assets-feature/redux/index.js'
import { combinedAssetsList, testAssets } from '@exodus/assets-test-meta'
import availableAssetsReduxModule from '@exodus/available-assets/redux/index.js'
import { keyBy } from '@exodus/basic-utils'
import { setupRedux } from '@exodus/redux-dependency-injection'
import { combineReducers, createStore } from 'redux'

import reduxModule from '../index.js'

const combinedAsset = combinedAssetsList.find((a) => a.combinedAssetNames.includes('usdcoin'))

export const {
  bitcoin,
  ethereum,
  usdcoin: usdcoinEthereum,
  usdcoin_solana: usdcoinSolana,
} = testAssets

export const _usdcoin = testAssets[combinedAsset.name]

export function setup({ dependencies = [] } = {}) {
  const allDependencies = [
    ...dependencies,
    reduxModule,
    assetsReduxModule,
    availableAssetsReduxModule,
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
  handleEvent('assets', {
    assets: keyBy([bitcoin, ethereum, _usdcoin, usdcoinSolana, usdcoinEthereum], 'name'),
  })
  handleEvent(
    'availableAssetNames',
    [bitcoin, ethereum, _usdcoin, usdcoinSolana, usdcoinEthereum].map(({ name }) => name)
  )

  const emitEnabledAssets = (data) => handleEvent('enabledAssets', data)

  return { ...redux, store, emitEnabledAssets }
}
