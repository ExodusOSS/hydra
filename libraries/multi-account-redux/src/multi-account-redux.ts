import { memoize } from '@exodus/basic-utils'
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
import type { AccountState, PerAssetData, SliceState } from './common.js'

type AssetSourceKey = {
  walletAccount: string
  asset: string
  network?: string
}

export const getKeyFromAssetSource = ({
  walletAccount,
  asset: assetName,
  network,
}: AssetSourceKey): string =>
  network ? `${walletAccount}.${assetName}.${network}` : `${walletAccount}.${assetName}`

export const getKeyFromMultiAssetSource = (
  assetNames: string[],
  walletAccounts: string[],
  ...rest: (string | number)[]
): string => `${assetNames.join(',')}_${walletAccounts.join(',')}_${rest.join('_')}`

export const getKeyFromMultiWalletAccounts = (
  assetName: string,
  walletAccounts: string[],
  ...rest: (string | number)[]
): string => getKeyFromMultiAssetSource([assetName], walletAccounts, ...rest)

export type RootStateWithSlice<TSlice extends string> = { [K in TSlice]: SliceState }

export type CreateStateHelperAndSelectorsParams<
  TSlice extends string,
  TRootState extends RootStateWithSlice<TSlice>,
> = {
  slice: TSlice
  createInitialPerAssetData: (assetName: string) => PerAssetData[string]
  assetNames: string[]
  activeWalletAccountSelector: (state: TRootState) => string
}

export const createStateHelperAndSelectorsCreator =
  <TRootState>({
    activeWalletAccountSelector,
  }: {
    activeWalletAccountSelector: (state: TRootState) => string
  }) =>
  <TSlice extends string>(
    params: Omit<
      CreateStateHelperAndSelectorsParams<TSlice, TRootState & RootStateWithSlice<TSlice>>,
      'activeWalletAccountSelector'
    >
  ) =>
    createStateHelperAndSelectors<TSlice, TRootState & RootStateWithSlice<TSlice>>({
      ...params,
      activeWalletAccountSelector,
    })

export default function createStateHelperAndSelectors<
  TSlice extends string,
  TRootState extends RootStateWithSlice<TSlice>,
>({
  slice,
  createInitialPerAssetData,
  assetNames,
  activeWalletAccountSelector,
}: CreateStateHelperAndSelectorsParams<TSlice, TRootState>) {
  if (!slice) throw new Error('expected string "slice" - the top level state key')
  if (!createInitialPerAssetData) throw new Error('expected "createInitialPerAssetData"')

  const createInitialAssetsData = (): PerAssetData =>
    assetNames.reduce<PerAssetData>((acc, assetName) => {
      acc[assetName] = createInitialPerAssetData(assetName)
      return acc
    }, {})

  const createPerAccountState = (): AccountState => ({
    error: null,
    loaded: false,
    data: createInitialAssetsData(),
  })

  const resetAccount = (state: SliceState, walletAccount: string): SliceState => {
    if (!walletAccount) throw new Error('expected walletAccount')

    return {
      ...state,
      [walletAccount]: createPerAccountState(),
    }
  }

  const resetAsset = (state: SliceState, walletAccount: string, assetName: string): SliceState =>
    setAsset(state, walletAccount, assetName, createInitialPerAssetData(assetName))

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
    assetName: string
  ): PerAssetData[string] | undefined => {
    if (!walletAccount) throw new Error('expected walletAccount')
    if (!assetName) throw new Error('expected assetName')
    return getAssets(state, walletAccount)?.[assetName]
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

  const getSlice = (state: TRootState): SliceState => state[slice]

  const assetSelector = createSelector(
    getSlice,
    activeWalletAccountSelector,
    (subState, activeWalletAccount) =>
      (assetName: string, walletAccount: string = activeWalletAccount) =>
        getAsset(subState, walletAccount, assetName) || createInitialPerAssetData(assetName)
  )

  const getAssetSourceSelector = memoize(
    ({ walletAccount, asset: assetName }: AssetSourceKey) =>
      createSelector(
        (state: TRootState) => getAsset(getSlice(state), walletAccount, assetName),
        (assetState) => assetState || createInitialPerAssetData(assetName)
      ),
    getKeyFromAssetSource
  )

  const getActiveAccountAssetSelector = memoize((assetName: string) =>
    createSelector(
      (state: TRootState) =>
        getAssetSourceSelector({
          walletAccount: activeWalletAccountSelector(state),
          asset: assetName,
        })(state),
      (accountState) => accountState
    )
  )

  const loadingSelector = createSelector(
    getSlice,
    activeWalletAccountSelector,
    (subState, activeWalletAccount) =>
      (walletAccount: string = activeWalletAccount) =>
        Boolean(getAccount(subState, walletAccount)?.loading)
  )

  const loadedSelector = createSelector(
    getSlice,
    activeWalletAccountSelector,
    (subState, activeWalletAccount) =>
      (walletAccount: string = activeWalletAccount) =>
        Boolean(getAccount(subState, walletAccount)?.loaded)
  )

  const createWalletAccountLoadedSelector = memoize((walletAccount: string) =>
    createSelector(getSlice, (subState) => Boolean(getAccount(subState, walletAccount)?.loaded))
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
