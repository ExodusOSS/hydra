import lodash from 'lodash'
import { mapValues } from '@exodus/basic-utils'
import { createSelector } from 'reselect'
import { WalletAccount } from '@exodus/models'
import { MY_STATE } from '@exodus/redux-dependency-injection'

import {
  updateAccount,
  mergeAccountsData,
  setAccounts,
  setAsset,
  setLoaded,
  setLoading,
} from './common.js'

const { get, memoize } = lodash // eslint-disable-line @exodus/restricted-imports/prefer-basic-utils -- TODO: fix next time we touch this file

function toFirstUpper(value) {
  const first = value[0]
  if (!first) return ''
  return first.toUpperCase() + value.slice(1)
}

const getKeyFromAssetSource = ({ walletAccount, assetName, network }) =>
  network ? `${walletAccount}.${assetName}.${network}` : `${walletAccount}.${assetName}`

export default function createStateHelperAndSelectors({
  slice, // deprecated, unused
  createInitialPerAssetData,
  assetSourceDataSelectors = [],
}) {
  if (!slice) throw new Error('expected string "slice" - the top level state key')
  if (!createInitialPerAssetData) createInitialPerAssetData = ({ state, asset }) => {}

  const createPerAccountState = () => ({
    error: null,
    loaded: false,
    data: {},
  })

  const resetAccount = (state, walletAccount) => {
    if (!walletAccount) throw new Error('expected walletAccount')

    return {
      ...state,
      [walletAccount]: createPerAccountState(),
    }
  }

  const resetAsset = (state, walletAccount, asset) => {
    return setAsset(state, walletAccount, asset.name, createInitialPerAssetData({ state, asset }))
  }

  const getAccount = (state, walletAccount) => {
    if (!walletAccount) throw new Error('expected walletAccount')
    return state[walletAccount]
  }

  const getAssets = (state, walletAccount) => {
    if (!walletAccount) throw new Error('expected walletAccount')
    return get(state, [walletAccount, 'data'])
  }

  const getAsset = (state, walletAccount, asset) => {
    if (!walletAccount) throw new Error('expected walletAccount')
    if (!asset) {
      console.warn(
        'multi-account-redux: expected asset, returning null for backward compatibility, please investigate'
      )
      return null
    }

    return (
      get(getAssets(state, walletAccount), [asset.name]) ||
      createInitialPerAssetData({ state, asset })
    )
  }

  const setLoadingError = (state, walletAccount, error) => {
    const reset = resetAccount(state, walletAccount)
    return updateAccount(reset, walletAccount, { error, loading: false })
  }

  const createInitialState = () => ({
    [WalletAccount.DEFAULT_NAME]: createPerAccountState(),
  })

  const createAccountAssetsSelectorDefinition = {
    id: 'createAccountAssetsSelector',
    selectorFactory: (myStateSelector) =>
      memoize((walletAccount) =>
        createSelector(myStateSelector, (myState) => getAssets(myState, walletAccount))
      ),
    dependencies: [
      //
      { selector: MY_STATE },
    ],
  }

  const getAccountAssetsSelectorDefinition = {
    id: 'getAccountAssetsSelector',
    resultFunction: (myState) => (walletAccount) => getAssets(myState, walletAccount),
    dependencies: [
      //
      { selector: MY_STATE },
    ],
  }

  const activeAccountAssetsSelectorDefinition = {
    id: 'activeAccountAssetsSelector',
    resultFunction: (myState, activeAccount) => getAssets(myState, activeAccount),
    dependencies: [
      //
      { selector: MY_STATE },
      { module: 'walletAccounts', selector: 'active' },
    ],
  }

  const createAssetSourceSelectorDefinition = {
    id: 'createAssetSourceSelector',
    selectorFactory: (myStateSelector, getAssetInstanceSelector) =>
      memoize(
        ({ walletAccount, assetName }) =>
          createSelector(myStateSelector, getAssetInstanceSelector, (myState, getAssetInstance) =>
            getAsset(myState, walletAccount, getAssetInstance(assetName))
          ),
        getKeyFromAssetSource
      ),
    dependencies: [
      //
      { selector: MY_STATE },
      { module: 'assets', selector: 'getAsset' },
    ],
  }

  // `assetSelector` in old API
  const createAssetSourceSelectorOldDefinition = {
    id: 'createAssetSourceSelectorOld',
    resultFunction: (myState, activeWalletAccount, getAssetInstance) =>
      memoize(
        ({ walletAccount = activeWalletAccount, assetName }) =>
          getAsset(myState, walletAccount, getAssetInstance(assetName)),
        getKeyFromAssetSource
      ),
    dependencies: [
      //
      { selector: MY_STATE },
      { module: 'walletAccounts', selector: 'active' },
      { module: 'assets', selector: 'getAsset' },
    ],
  }

  const createBaseAssetSourceSelectorOldDefinition = {
    id: 'createBaseAssetSourceSelectorOld',
    resultFunction: (myState, activeWalletAccount, getAssetInstance) =>
      memoize(
        ({ walletAccount, assetName }) =>
          getAsset(myState, walletAccount, getAssetInstance(assetName).baseAsset),
        getKeyFromAssetSource
      ),
    dependencies: [
      //
      { selector: MY_STATE },
      { module: 'walletAccounts', selector: 'active' },
      { module: 'assets', selector: 'getAsset' },
    ],
  }

  const createBaseAssetSourceSelectorDefinition = {
    id: 'createBaseAssetSourceSelector',
    selectorFactory: (myStateSelector, getAssetInstanceSelector) =>
      memoize(
        ({ walletAccount, assetName }) =>
          createSelector(myStateSelector, getAssetInstanceSelector, (myState, getAssetInstance) =>
            getAsset(myState, walletAccount, getAssetInstance(assetName).baseAsset)
          ),
        getKeyFromAssetSource
      ),
    dependencies: [
      //
      { selector: MY_STATE },
      { module: 'assets', selector: 'getAsset' },
    ],
  }

  // `getAssetSourceSelector` in old API
  // deprecated, use 'createGetActiveAssetSourceSelector' instead
  const createActiveAssetSourceSelectorOldDefinition = {
    id: 'createActiveAssetSourceSelectorOld',
    resultFunction: (activeWalletAccount, getAssetInstance, myState) =>
      memoize((assetName) => getAsset(myState, activeWalletAccount, getAssetInstance(assetName))),
    dependencies: [
      //
      { module: 'walletAccounts', selector: 'active' },
      { module: 'assets', selector: 'getAsset' },
      { selector: MY_STATE },
    ],
  }

  // `getActiveAccountAssetSelector` in old API
  const createActiveAssetSourceSelectorDefinition = {
    id: 'createActiveAssetSourceSelector',
    selectorFactory: (activeWalletAccountSelector, getAssetInstanceSelector, myStateSelector) =>
      memoize((assetName) =>
        createSelector(
          activeWalletAccountSelector,
          getAssetInstanceSelector,
          myStateSelector,
          (activeWalletAccount, getAssetInstance, myState) =>
            getAsset(myState, activeWalletAccount, getAssetInstance(assetName))
        )
      ),
    dependencies: [
      //
      { module: 'walletAccounts', selector: 'active' },
      { module: 'assets', selector: 'getAsset' },
      { selector: MY_STATE },
    ],
  }

  const createActiveBaseAssetSourceSelectorDefinition = {
    id: 'createActiveBaseAssetSourceSelector',
    selectorFactory: (activeWalletAccountSelector, getAssetInstanceSelector, myStateSelector) =>
      memoize((assetName) =>
        createSelector(
          activeWalletAccountSelector,
          getAssetInstanceSelector,
          myStateSelector,
          (activeWalletAccount, getAssetInstance, myState) =>
            getAsset(myState, activeWalletAccount, getAssetInstance(assetName).baseAsset)
        )
      ),
    dependencies: [
      //
      { module: 'walletAccounts', selector: 'active' },
      { module: 'assets', selector: 'getAsset' },
      { selector: MY_STATE },
    ],
  }

  // `loadingSelector` in old API
  // deprecated, prefer `createIsWalletAccountLoadingSelector` instead
  const createIsWalletAccountLoadingSelectorOldDefinition = {
    id: 'createIsWalletAccountLoadingSelectorOld',
    selectorFactory: (myStateSelector, activeWalletAccountSelector) =>
      createSelector(
        myStateSelector,
        activeWalletAccountSelector,
        (activeWalletAccount, subState) =>
          (walletAccount = activeWalletAccount) =>
            subState[walletAccount]?.loading || false
      ),
    dependencies: [
      //
      { module: 'walletAccounts', selector: 'active' },
      { selector: MY_STATE },
    ],
  }

  const createIsWalletAccountLoadingSelectorDefinition = {
    id: 'createIsWalletAccountLoadingSelector',
    selectorFactory: (myStateSelector) =>
      memoize((walletAccount) =>
        createSelector(
          myStateSelector,
          (subState) => get(getAccount(subState, walletAccount), 'loading') || false
        )
      ),
    dependencies: [{ selector: MY_STATE }],
  }

  const isActiveWalletAccountLoadingDefinition = {
    id: 'isActiveWalletAccountLoading',
    resultFunction: (activeWalletAccount, subState) =>
      subState[activeWalletAccount]?.loading || false,
    dependencies: [
      //
      { module: 'walletAccounts', selector: 'active' },
      { selector: MY_STATE },
    ],
  }

  // `loadedSelector` in old API
  const createIsWalletAccountLoadedSelectorOldDefinition = {
    id: 'createIsWalletAccountLoadedSelectorOld',
    resultFunction:
      (activeWalletAccount, subState) =>
      (walletAccount = activeWalletAccount) =>
        subState[walletAccount]?.loaded || false,
    dependencies: [
      //
      { module: 'walletAccounts', selector: 'active' },
      { selector: MY_STATE },
    ],
  }

  // `createWalletAccountLoadedSelector` in old API
  const createIsWalletAccountLoadedSelectorDefinition = {
    id: 'createIsWalletAccountLoadedSelector',
    selectorFactory: (myStateSelector) =>
      memoize((walletAccount) =>
        createSelector(
          myStateSelector,
          (subState) => getAccount(subState, walletAccount)?.loaded || false
        )
      ),
    dependencies: [{ selector: MY_STATE }],
  }

  const isActiveWalletAccountLoadedDefinition = {
    id: 'isActiveWalletAccountLoaded',
    resultFunction: (activeWalletAccount, subState) =>
      subState[activeWalletAccount]?.loaded || false,
    dependencies: [
      //
      { module: 'walletAccounts', selector: 'active' },
      { selector: MY_STATE },
    ],
  }

  const withAssetSourceDataSelectors = assetSourceDataSelectors.flatMap(({ name, selector }) => {
    const accountMapper = (accountAssets) =>
      mapValues(accountAssets, (assetState) => selector(assetState))

    return [
      {
        id: `createAccountAssets${toFirstUpper(name)}Selector`,
        selectorFactory: (createAccountAssetsSelector) =>
          memoize((walletAccount) =>
            createSelector(createAccountAssetsSelector(walletAccount), accountMapper)
          ),
        dependencies: [
          //
          { selector: 'createAccountAssetsSelector' },
        ],
      },
      {
        id: `activeAccountAssets${toFirstUpper(name)}Selector`,
        resultFunction: accountMapper,
        dependencies: [
          //
          { selector: 'activeAccountAssetsSelector' },
        ],
      },
      {
        id: `getAccountAssets${toFirstUpper(name)}Selector`,
        resultFunction: (getAccountAssets) =>
          memoize((walletAccount) => accountMapper(getAccountAssets(walletAccount))),
        dependencies: [
          //
          { selector: 'getAccountAssetsSelector' },
        ],
      },
      {
        id: `createAssetSource${toFirstUpper(name)}Selector`,
        selectorFactory: (createAssetSourceSelector) =>
          memoize(
            (assetSource) =>
              createSelector(createAssetSourceSelector(assetSource), (sourceData) =>
                selector(sourceData)
              ),
            getKeyFromAssetSource
          ),
        dependencies: [
          //
          { selector: 'createAssetSourceSelector' },
        ],
      },
      {
        id: `createActiveAssetSource${toFirstUpper(name)}Selector`,
        selectorFactory: (createActiveAssetSourceSelector) =>
          memoize((assetName) =>
            createSelector(createActiveAssetSourceSelector(assetName), (sourceData) =>
              selector(sourceData)
            )
          ),
        dependencies: [
          //
          { selector: 'createActiveAssetSourceSelector' },
        ],
      },
      {
        id: `getAssetSource${toFirstUpper(name)}Selector`,
        resultFunction: (getAssetSource, activeWalletAccount) =>
          memoize(
            ({ assetName, walletAccount = activeWalletAccount }) =>
              selector(getAssetSource({ assetName, walletAccount })),
            getKeyFromAssetSource
          ),
        dependencies: [
          //
          { selector: 'createAssetSourceSelectorOld' },
          { module: 'walletAccounts', selector: 'active' },
        ],
      },
    ]
  })

  return {
    // init
    createInitialState,
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
    // definitions
    selectorDefinitions: [
      createAssetSourceSelectorDefinition,
      createAssetSourceSelectorOldDefinition,
      createBaseAssetSourceSelectorDefinition,
      createBaseAssetSourceSelectorOldDefinition,
      createActiveAssetSourceSelectorOldDefinition,
      createActiveAssetSourceSelectorDefinition,
      createActiveBaseAssetSourceSelectorDefinition,
      createIsWalletAccountLoadingSelectorOldDefinition,
      createIsWalletAccountLoadingSelectorDefinition,
      createIsWalletAccountLoadedSelectorOldDefinition,
      createIsWalletAccountLoadedSelectorDefinition,
      isActiveWalletAccountLoadingDefinition,
      isActiveWalletAccountLoadedDefinition,
      createAccountAssetsSelectorDefinition,
      activeAccountAssetsSelectorDefinition,
      getAccountAssetsSelectorDefinition,
      ...withAssetSourceDataSelectors,
    ],
  }
}
