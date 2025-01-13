import assetsRedux from '@exodus/assets-feature/redux/index.js'
import availableAssetsRedux from '@exodus/available-assets/redux/index.js'
import { asset as bitcoin } from '@exodus/bitcoin-meta'
import { asset as ethereum } from '@exodus/ethereum-meta'
import feeDataReduxDefinition from '@exodus/fee-data-monitors/redux/index.js'
import { setupRedux } from '@exodus/redux-dependency-injection'
import walletAccountsRedux from '@exodus/wallet-accounts/redux/index.js'
import { combineReducers, createStore } from 'redux'

import balancesRedux from '../index.js'
import { TX_LOG } from './fixtures.js'

export function setup({ dependencies = [] } = {}) {
  const allDependencies = [
    balancesRedux,
    assetsRedux,
    feeDataReduxDefinition,
    availableAssetsRedux,
    walletAccountsRedux(),
    {
      id: 'txLog.selectors.createAssetSourceSelector',
      factory: () => () => () => TX_LOG,
    },
    {
      id: 'txLog.selectors.createAssetSourceSelectorOld',
      factory: () => () => () => TX_LOG,
    },
    {
      id: 'txLog.selectors.createIsWalletAccountLoadedSelectorOld',
      factory: () => () => () => true,
    },
    ...dependencies,
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

  handleEvent('assets', { assets: { bitcoin, ethereum } })
  const emitBalances = (balances) => handleEvent('balances', balances)
  const emitHasBalance = (payload) => handleEvent('hasBalance', payload)

  const emitAssets = (payload) => {
    handleEvent('assets', { assets: payload })
    handleEvent('availableAssetNames', Object.keys(payload))
  }

  const emitFeeData = (payload) => {
    handleEvent('feeData', payload)
  }

  return { ...redux, store, emitBalances, emitHasBalance, emitAssets, emitFeeData }
}
