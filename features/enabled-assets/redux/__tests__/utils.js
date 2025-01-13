import { connectAssetsList } from '@exodus/assets'
import assetsBase from '@exodus/assets-base'
import assetsReduxModule from '@exodus/assets-feature/redux/index.js'
import { keyBy } from '@exodus/basic-utils'
import combinedAssetsList from '@exodus/combined-assets-meta'
import { setupRedux } from '@exodus/redux-dependency-injection'
import { combineReducers, createStore } from 'redux'

import reduxModule from '../index.js'

const assets = connectAssetsList([...combinedAssetsList, ...Object.values(assetsBase)])
export const {
  bitcoin,
  ethereum,
  _usdcoin,
  usdcoin: usdcoinEthereum,
  usdcoin_solana: usdcoinSolana,
} = assets

export function setup({ dependencies = [] } = {}) {
  const allDependencies = [...dependencies, reduxModule, assetsReduxModule]

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

  const emitEnabledAssets = (data) => handleEvent('enabledAssets', data)

  return { ...redux, store, emitEnabledAssets }
}
