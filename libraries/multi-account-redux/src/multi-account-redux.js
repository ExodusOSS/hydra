import lodash from 'lodash'
import { createSelector } from 'reselect'
import { WalletAccount } from '@exodus/models'

import {
  updateAccount,
  mergeAccountsData,
  setAccounts,
  setAsset,
  setLoaded,
  setLoading,
} from './common.js'

const { get, memoize } = lodash // eslint-disable-line @exodus/restricted-imports/prefer-basic-utils -- TODO: fix next time we touch this file

export const getKeyFromAssetSource = ({ walletAccount, asset: assetName, network }) =>
  network ? `${walletAccount}.${assetName}.${network}` : `${walletAccount}.${assetName}`

export const getKeyFromMultiAssetSource = (assetNames, walletAccounts, ...rest) => {
  return `${assetNames.join(',')}_${walletAccounts.join(',')}_${rest.join('_')}`
}

export const getKeyFromMultiWalletAccounts = (assetName, walletAccounts, ...rest) => {
  return getKeyFromMultiAssetSource([assetName], walletAccounts, ...rest)
}

export const createStateHelperAndSelectorsCreator =
  ({ activeWalletAccountSelector }) =>
  (params) =>
    createStateHelperAndSelectors({
      ...params,
      activeWalletAccountSelector,
    })

export default function createStateHelperAndSelectors({
  slice,
  createInitialPerAssetData,
  assetNames,
  activeWalletAccountSelector,
}) {
  if (!slice) throw new Error('expected string "slice" - the top level state key')
  if (!createInitialPerAssetData) throw new Error('expected "createInitialPerAssetData"')

  const createInitialAssetsData = () =>
    assetNames.reduce((acc, assetName) => {
      acc[assetName] = createInitialPerAssetData(assetName)
      return acc
    }, {})

  const createPerAccountState = () => ({
    error: null,
    loaded: false,
    data: createInitialAssetsData(),
  })

  const resetAccount = (state, walletAccount) => {
    if (!walletAccount) throw new Error('expected walletAccount')

    return {
      ...state,
      [walletAccount]: createPerAccountState(),
    }
  }

  const resetAsset = (state, walletAccount, assetName) => {
    return setAsset(state, walletAccount, assetName, createInitialPerAssetData(assetName))
  }

  const getAccount = (state, walletAccount) => {
    if (!walletAccount) throw new Error('expected walletAccount')
    return state[walletAccount]
  }

  const getAssets = (state, walletAccount) => {
    if (!walletAccount) throw new Error('expected walletAccount')
    return get(state, [walletAccount, 'data'])
  }

  const getAsset = (state, walletAccount, assetName) => {
    if (!walletAccount) throw new Error('expected walletAccount')
    if (!assetName) throw new Error('expected assetName')
    return get(getAssets(state, walletAccount), [assetName])
  }

  const setLoadingError = (state, walletAccount, error) => {
    const reset = resetAccount(state, walletAccount)
    return updateAccount(reset, walletAccount, { error, loading: false })
  }

  const createInitialState = () => ({
    [WalletAccount.DEFAULT_NAME]: createPerAccountState(),
  })

  const assetSelector = createSelector(
    (state) => state[slice],
    activeWalletAccountSelector,
    (subState, activeWalletAccount) => {
      return (assetName, walletAccount = activeWalletAccount) => {
        return getAsset(subState, walletAccount, assetName) || createInitialPerAssetData(assetName)
      }
    }
  )

  const getAssetSourceSelector = memoize(
    ({ walletAccount, asset: assetName }) =>
      createSelector(
        (state) => getAsset(state[slice], walletAccount, assetName),
        (assetState) => assetState || createInitialPerAssetData(assetName)
      ),
    getKeyFromAssetSource
  )

  const getActiveAccountAssetSelector = memoize((assetName) =>
    createSelector(
      (state) =>
        getAssetSourceSelector({
          walletAccount: activeWalletAccountSelector(state),
          asset: assetName,
        })(state),
      (accountState) => accountState
    )
  )

  const loadingSelector = createSelector(
    (state) => state[slice],
    activeWalletAccountSelector,
    (subState, activeWalletAccount) => {
      return (walletAccount = activeWalletAccount) => {
        return get(getAccount(subState, walletAccount), 'loading') || false
      }
    }
  )

  const loadedSelector = createSelector(
    (state) => state[slice],
    activeWalletAccountSelector,
    (subState, activeWalletAccount) => {
      return (walletAccount = activeWalletAccount) => {
        return get(getAccount(subState, walletAccount), 'loaded') || false
      }
    }
  )

  const createWalletAccountLoadedSelector = memoize((walletAccount) =>
    createSelector(
      (state) => state[slice],
      (subState) => {
        return get(getAccount(subState, walletAccount), 'loaded') || false
      }
    )
  )

  return {
    // init
    createInitialState,
    createInitialAssetsData,
    // per-account
    getAccount,
    updateAccount,
    mergeAccountsData,
    setAccounts,
    resetAccount,
    setLoaded,
    setLoading,
    setLoadingError,
    getAssets,
    // per-asset
    getAsset,
    setAsset,
    resetAsset,
    assetSelector,
    getAssetSourceSelector,
    getActiveAccountAssetSelector,
    loadedSelector,
    loadingSelector,
    createWalletAccountLoadedSelector,
  }
}
