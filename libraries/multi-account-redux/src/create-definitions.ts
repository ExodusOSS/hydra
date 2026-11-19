import { mapValues, memoize } from '@exodus/basic-utils'
import { createSelector } from 'reselect'
import { WalletAccount } from '@exodus/models'
import { MY_STATE } from '@exodus/redux-dependency-injection'
import type { SelectorDefinition } from '@exodus/redux-dependency-injection'

import {
  updateAccount,
  mergeAccountsData,
  setAccounts,
  setAsset,
  setLoaded,
  setLoading,
} from './common.js'
import type { AccountState, PerAssetData, SliceState } from './common.js'

function toFirstUpper(value: string): string {
  const first = value[0]
  if (!first) return ''
  return first.toUpperCase() + value.slice(1)
}

type AssetSourceKey = {
  walletAccount: string
  assetName: string
  network?: string
}

export interface AssetInstance {
  name: string
  baseAsset?: AssetInstance
}

type GetAssetInstance<TAsset extends AssetInstance = AssetInstance> = (assetName: string) => TAsset

type CreateInitialPerAssetDataArgs<TAsset extends AssetInstance = AssetInstance> = {
  state: SliceState
  asset: TAsset
}

type CreateInitialPerAssetData<TAssetData, TAsset extends AssetInstance = AssetInstance> = (
  args: CreateInitialPerAssetDataArgs<TAsset>
) => TAssetData

export type AssetSourceDataSelector<TAssetData> = {
  name: string
  selector: (assetState: TAssetData) => unknown
}

export type CreateReduxModuleHelperParams<
  TAssetData,
  TAsset extends AssetInstance = AssetInstance,
> = {
  slice: string
  createInitialPerAssetData?: CreateInitialPerAssetData<TAssetData, TAsset>
  assetSourceDataSelectors?: AssetSourceDataSelector<TAssetData>[]
}

const getKeyFromAssetSource = ({ walletAccount, assetName, network }: AssetSourceKey): string =>
  network ? `${walletAccount}.${assetName}.${network}` : `${walletAccount}.${assetName}`

export default function createStateHelperAndSelectors<
  TAssetData = PerAssetData[string],
  TAsset extends AssetInstance = AssetInstance,
>({
  slice, // deprecated, unused
  createInitialPerAssetData,
  assetSourceDataSelectors = [],
}: CreateReduxModuleHelperParams<TAssetData, TAsset>) {
  if (!slice) throw new Error('expected string "slice" - the top level state key')
  const initialPerAssetData: CreateInitialPerAssetData<TAssetData, TAsset> =
    createInitialPerAssetData ?? (() => undefined as TAssetData) // allow: fallback for legacy callers omitting createInitialPerAssetData; original JS returned undefined here.

  const createPerAccountState = (): AccountState => ({
    error: null,
    loaded: false,
    data: {},
  })

  const resetAccount = (state: SliceState, walletAccount: string): SliceState => {
    if (!walletAccount) throw new Error('expected walletAccount')

    return {
      ...state,
      [walletAccount]: createPerAccountState(),
    }
  }

  const resetAsset = (state: SliceState, walletAccount: string, asset: TAsset): SliceState =>
    setAsset(state, walletAccount, asset.name, initialPerAssetData({ state, asset }))

  const getAccount = (state: SliceState, walletAccount: string): AccountState | undefined => {
    if (!walletAccount) throw new Error('expected walletAccount')
    return state[walletAccount]
  }

  const getAssets = (state: SliceState, walletAccount: string): PerAssetData | undefined => {
    if (!walletAccount) throw new Error('expected walletAccount')
    return state[walletAccount]?.data
  }

  const getAsset = (
    state: SliceState,
    walletAccount: string,
    asset: AssetInstance | undefined
  ): TAssetData | PerAssetData[string] | null => {
    if (!walletAccount) throw new Error('expected walletAccount')
    if (!asset) {
      console.warn(
        'multi-account-redux: expected asset, returning null for backward compatibility, please investigate'
      )
      return null
    }

    const stored = getAssets(state, walletAccount)?.[asset.name]
    // allow: asset is an AssetInstance from the IoC graph; at runtime it carries TAsset's full shape because the IoC binds getAssetInstance to the consumer's asset module.
    return stored ?? initialPerAssetData({ state, asset: asset as TAsset })
  }

  const setLoadingError = (
    state: SliceState,
    walletAccount: string,
    error: AccountState['error']
  ): SliceState => {
    const reset = resetAccount(state, walletAccount)
    return updateAccount(reset, walletAccount, { error, loading: false })
  }

  const createInitialState = (): SliceState => ({
    [WalletAccount.DEFAULT_NAME]: createPerAccountState(),
  })

  const createAccountAssetsSelectorDefinition = {
    id: 'createAccountAssetsSelector',
    selectorFactory: <TState>(myStateSelector: (state: TState) => SliceState) =>
      memoize((walletAccount: string) =>
        createSelector(myStateSelector, (myState) => getAssets(myState, walletAccount))
      ),
    dependencies: [
      //
      { selector: MY_STATE },
    ],
  } as const

  const getAccountAssetsSelectorDefinition = {
    id: 'getAccountAssetsSelector',
    resultFunction: (myState: SliceState) => (walletAccount: string) =>
      getAssets(myState, walletAccount),
    dependencies: [
      //
      { selector: MY_STATE },
    ],
  } as const

  const activeAccountAssetsSelectorDefinition = {
    id: 'activeAccountAssetsSelector',
    resultFunction: (myState: SliceState, activeAccount: string) =>
      getAssets(myState, activeAccount),
    dependencies: [
      //
      { selector: MY_STATE },
      { module: 'walletAccounts', selector: 'active' },
    ],
  } as const

  const createAssetSourceSelectorDefinition = {
    id: 'createAssetSourceSelector',
    selectorFactory: <TState>(
      myStateSelector: (state: TState) => SliceState,
      getAssetInstanceSelector: (state: TState) => GetAssetInstance<TAsset>
    ) =>
      memoize(
        ({ walletAccount, assetName }: AssetSourceKey) =>
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
  } as const

  // `assetSelector` in old API
  const createAssetSourceSelectorOldDefinition = {
    id: 'createAssetSourceSelectorOld',
    resultFunction: (
      myState: SliceState,
      activeWalletAccount: string,
      getAssetInstance: GetAssetInstance<TAsset>
    ) =>
      memoize(
        ({ walletAccount = activeWalletAccount, assetName }: AssetSourceKey) =>
          getAsset(myState, walletAccount, getAssetInstance(assetName)),
        getKeyFromAssetSource
      ),
    dependencies: [
      //
      { selector: MY_STATE },
      { module: 'walletAccounts', selector: 'active' },
      { module: 'assets', selector: 'getAsset' },
    ],
  } as const

  const createBaseAssetSourceSelectorOldDefinition = {
    id: 'createBaseAssetSourceSelectorOld',
    resultFunction: (
      myState: SliceState,
      activeWalletAccount: string,
      getAssetInstance: GetAssetInstance<TAsset>
    ) =>
      memoize(
        ({ walletAccount, assetName }: AssetSourceKey) =>
          getAsset(myState, walletAccount, getAssetInstance(assetName).baseAsset),
        getKeyFromAssetSource
      ),
    dependencies: [
      //
      { selector: MY_STATE },
      { module: 'walletAccounts', selector: 'active' },
      { module: 'assets', selector: 'getAsset' },
    ],
  } as const

  const createBaseAssetSourceSelectorDefinition = {
    id: 'createBaseAssetSourceSelector',
    selectorFactory: <TState>(
      myStateSelector: (state: TState) => SliceState,
      getAssetInstanceSelector: (state: TState) => GetAssetInstance<TAsset>
    ) =>
      memoize(
        ({ walletAccount, assetName }: AssetSourceKey) =>
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
  } as const

  // `getAssetSourceSelector` in old API
  // deprecated, use 'createGetActiveAssetSourceSelector' instead
  const createActiveAssetSourceSelectorOldDefinition = {
    id: 'createActiveAssetSourceSelectorOld',
    resultFunction: (
      activeWalletAccount: string,
      getAssetInstance: GetAssetInstance<TAsset>,
      myState: SliceState
    ) =>
      memoize((assetName: string) =>
        getAsset(myState, activeWalletAccount, getAssetInstance(assetName))
      ),
    dependencies: [
      //
      { module: 'walletAccounts', selector: 'active' },
      { module: 'assets', selector: 'getAsset' },
      { selector: MY_STATE },
    ],
  } as const

  // `getActiveAccountAssetSelector` in old API
  const createActiveAssetSourceSelectorDefinition = {
    id: 'createActiveAssetSourceSelector',
    selectorFactory: <TState>(
      activeWalletAccountSelector: (state: TState) => string,
      getAssetInstanceSelector: (state: TState) => GetAssetInstance<TAsset>,
      myStateSelector: (state: TState) => SliceState
    ) =>
      memoize((assetName: string) =>
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
  } as const

  const createActiveBaseAssetSourceSelectorDefinition = {
    id: 'createActiveBaseAssetSourceSelector',
    selectorFactory: <TState>(
      activeWalletAccountSelector: (state: TState) => string,
      getAssetInstanceSelector: (state: TState) => GetAssetInstance<TAsset>,
      myStateSelector: (state: TState) => SliceState
    ) =>
      memoize((assetName: string) =>
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
  } as const

  // `loadingSelector` in old API
  // deprecated, prefer `createIsWalletAccountLoadingSelector` instead
  const createIsWalletAccountLoadingSelectorOldDefinition = {
    id: 'createIsWalletAccountLoadingSelectorOld',
    selectorFactory: <TState>(
      activeWalletAccountSelector: (state: TState) => string,
      myStateSelector: (state: TState) => SliceState
    ) =>
      createSelector(
        activeWalletAccountSelector,
        myStateSelector,
        (activeWalletAccount, subState) =>
          (walletAccount: string = activeWalletAccount) =>
            Boolean(subState[walletAccount]?.loading)
      ),
    dependencies: [
      //
      { module: 'walletAccounts', selector: 'active' },
      { selector: MY_STATE },
    ],
  } as const

  const createIsWalletAccountLoadingSelectorDefinition = {
    id: 'createIsWalletAccountLoadingSelector',
    selectorFactory: <TState>(myStateSelector: (state: TState) => SliceState) =>
      memoize((walletAccount: string) =>
        createSelector(myStateSelector, (subState) =>
          Boolean(getAccount(subState, walletAccount)?.loading)
        )
      ),
    dependencies: [{ selector: MY_STATE }],
  } as const

  const isActiveWalletAccountLoadingDefinition = {
    id: 'isActiveWalletAccountLoading',
    resultFunction: (activeWalletAccount: string, subState: SliceState) =>
      Boolean(subState[activeWalletAccount]?.loading),
    dependencies: [
      //
      { module: 'walletAccounts', selector: 'active' },
      { selector: MY_STATE },
    ],
  } as const

  // `loadedSelector` in old API
  const createIsWalletAccountLoadedSelectorOldDefinition = {
    id: 'createIsWalletAccountLoadedSelectorOld',
    resultFunction:
      (activeWalletAccount: string, subState: SliceState) =>
      (walletAccount: string = activeWalletAccount) =>
        Boolean(subState[walletAccount]?.loaded),
    dependencies: [
      //
      { module: 'walletAccounts', selector: 'active' },
      { selector: MY_STATE },
    ],
  } as const

  // `createWalletAccountLoadedSelector` in old API
  const createIsWalletAccountLoadedSelectorDefinition = {
    id: 'createIsWalletAccountLoadedSelector',
    selectorFactory: <TState>(myStateSelector: (state: TState) => SliceState) =>
      memoize((walletAccount: string) =>
        createSelector(myStateSelector, (subState) =>
          Boolean(getAccount(subState, walletAccount)?.loaded)
        )
      ),
    dependencies: [{ selector: MY_STATE }],
  } as const

  const isActiveWalletAccountLoadedDefinition = {
    id: 'isActiveWalletAccountLoaded',
    resultFunction: (activeWalletAccount: string, subState: SliceState) =>
      Boolean(subState[activeWalletAccount]?.loaded),
    dependencies: [
      //
      { module: 'walletAccounts', selector: 'active' },
      { selector: MY_STATE },
    ],
  } as const

  const withAssetSourceDataSelectors = assetSourceDataSelectors.flatMap(({ name, selector }) => {
    const accountMapper = (accountAssets: PerAssetData | undefined) =>
      // allow: PerAssetData stores heterogeneous values per Record<string, unknown>; consumer asserts the per-asset shape via TAssetData on createReduxModuleHelper.
      mapValues(accountAssets ?? {}, (assetState) => selector(assetState as TAssetData))

    return [
      {
        id: `createAccountAssets${toFirstUpper(name)}Selector`,
        selectorFactory: <TState>(
          createAccountAssetsSelector: (walletAccount: string) => (state: TState) => PerAssetData
        ) =>
          memoize((walletAccount: string) =>
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
        resultFunction: (getAccountAssets: (walletAccount: string) => PerAssetData) =>
          memoize((walletAccount: string) => accountMapper(getAccountAssets(walletAccount))),
        dependencies: [
          //
          { selector: 'getAccountAssetsSelector' },
        ],
      },
      {
        id: `createAssetSource${toFirstUpper(name)}Selector`,
        selectorFactory: <TState>(
          createAssetSourceSelector: (key: AssetSourceKey) => (state: TState) => TAssetData
        ) =>
          memoize(
            (assetSource: AssetSourceKey) =>
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
        selectorFactory: <TState>(
          createActiveAssetSourceSelector: (assetName: string) => (state: TState) => TAssetData
        ) =>
          memoize((assetName: string) =>
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
        resultFunction: (
          getAssetSource: (key: AssetSourceKey) => TAssetData,
          activeWalletAccount: string
        ) =>
          memoize(
            ({ assetName, walletAccount = activeWalletAccount }: AssetSourceKey) =>
              selector(getAssetSource({ assetName, walletAccount })),
            getKeyFromAssetSource
          ),
        dependencies: [
          //
          { selector: 'createAssetSourceSelectorOld' },
          { module: 'walletAccounts', selector: 'active' },
        ],
      },
    ] as const
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
    ] as readonly SelectorDefinition[], // allow: heterogeneous union of selectorFactory and resultFunction definitions; alt: discriminated tuple type would not preserve dependency-injection's ID-keyed lookup.
  }
}
