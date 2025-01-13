import assetsRedux from '@exodus/assets-feature/redux'
import availableAssetsRedux from '@exodus/available-assets/redux'
import balancesRedux from '@exodus/balances/redux'
import txLogsRedux from '@exodus/blockchain-metadata/redux/tx-logs'
import enabledAssetsRedux from '@exodus/enabled-assets/redux'
import favoriteAssetsRedux from '@exodus/favorite-assets/redux'
import feeDataReduxDefinition from '@exodus/fee-data-monitors/redux'
import fiat from '@exodus/fiat-currencies'
import ratesMonitorRedux from '@exodus/rates-monitor/redux'
import { setupRedux } from '@exodus/redux-dependency-injection'
import walletAccountsRedux from '@exodus/wallet-accounts/redux'
import { combineReducers, createStore } from 'redux'

import createFiatBalancesReduxDefinition from '../'

export const createFiatNumberUnit = (value) => fiat.USD.defaultUnit(value)

export function setup({
  dependencies = [],
  optimisticActivityEnabled,
  currency = 'USD',
  removedTokens = [],
  hasUnverifiedRedux = true,
  hasTrustedRedux = true,
} = {}) {
  const fiatBalancesReduxDefinition = createFiatBalancesReduxDefinition({
    optimisticActivityEnabled,
  })

  const unverified = new Set()
  const setUnverifiedToken = (...assets) => {
    unverified.add.apply(unverified, assets)
  }

  const allDependencies = [
    ...dependencies,
    walletAccountsRedux(),
    availableAssetsRedux,
    enabledAssetsRedux,
    favoriteAssetsRedux,
    ratesMonitorRedux,
    assetsRedux,
    balancesRedux,
    txLogsRedux,
    feeDataReduxDefinition,
    fiatBalancesReduxDefinition,
    {
      id: 'locale.selectors.currency',
      factory: () => () => currency,
    },
    {
      id: 'locale.selectors.currencyUnitType',
      factory: () => () => fiat[currency],
    },
  ]
  if (hasUnverifiedRedux) {
    allDependencies.push({
      id: 'removedTokens.selectors.data',
      factory: () => () => removedTokens,
    })
  }

  if (hasTrustedRedux) {
    allDependencies.push({
      id: 'trustedUnverifiedTokens.selectors.getIsUnverified',
      factory: () => () => (asset) => unverified.has(asset.name),
    })
  }

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

  const emitFiatBalances = (balances) => handleEvent('fiatBalances', { balances })
  const emitBalances = (balances) => handleEvent('balances', { balances })
  const emitFavoriteAssets = (payload) => handleEvent('favoriteAssets', payload)
  const emitRates = (payload) => handleEvent('rates', payload)
  const emitOptimisticFiatBalances = (balances) =>
    handleEvent('optimisticFiatBalances', { balances })

  const emitWalletAccounts = (walletAccounts) => {
    handleEvent('walletAccounts', walletAccounts)

    if (Object.keys(walletAccounts).length > 0) {
      handleEvent('multipleWalletAccountsEnabled', true)
    }
  }

  const emitAssets = (payload) => {
    handleEvent('assets', { assets: payload })
    handleEvent('availableAssetNames', Object.keys(payload))
  }

  const emitEnabledAssets = (payload) => handleEvent('enabledAssets', payload)

  return {
    ...redux,
    store,
    emitFiatBalances,
    emitBalances,
    emitOptimisticFiatBalances,
    emitFavoriteAssets,
    emitRates,
    emitAssets,
    emitEnabledAssets,
    emitWalletAccounts,
    setUnverifiedToken,
  }
}
