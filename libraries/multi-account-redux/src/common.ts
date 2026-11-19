import { mapValues } from '@exodus/basic-utils'

// allow: per-asset data shapes are registered by each consumer (txLogs, balances, etc.); no shared schema at this layer.
export type PerAssetData<TAssetData = unknown> = Record<string, TAssetData>

export type AccountState<TAssetData = unknown> = {
  // allow: error shape comes from upstream loaders that may throw arbitrary values.
  error: unknown
  loaded: boolean
  loading?: boolean
  data: PerAssetData<TAssetData>
}

export type SliceState<TAssetData = unknown> = Record<string, AccountState<TAssetData>>

export const updateAccount = <TAssetData = unknown>(
  state: SliceState<TAssetData>,
  walletAccount: string,
  update: Partial<AccountState<TAssetData>>
): SliceState<TAssetData> => {
  if (!walletAccount) throw new Error('expected walletAccount')

  return {
    ...state,
    [walletAccount]: {
      ...state[walletAccount],
      ...update,
    } as AccountState<TAssetData>, // allow: spread of Partial<AccountState> requires the cast; alt: a fresh literal would diverge from observed runtime behavior of always merging onto prior state.
  }
}

export const mergeAccountsData = <TAssetData = unknown>(
  state: SliceState<TAssetData>,
  payload: Record<string, PerAssetData<TAssetData>>
): SliceState<TAssetData> => {
  const updated: SliceState<TAssetData> = mapValues(payload, (byAsset, walletAccount) => ({
    ...state[walletAccount],
    data: {
      ...state[walletAccount]?.data,
      ...byAsset,
    },
  })) as SliceState<TAssetData> // allow: basic-utils mapValues returns a generic Record — cast preserves behavior; alt would refactor mapValues' return type.

  return { ...state, ...updated }
}

export const setAccounts = <TAssetData = unknown>(
  state: SliceState<TAssetData>,
  valuesByAccount: Record<string, PerAssetData<TAssetData>>
): SliceState<TAssetData> => {
  const entries = Object.entries(valuesByAccount).map(
    ([key, update]): [string, AccountState<TAssetData>] => [
      key,
      {
        ...state[key],
        loaded: true,
        data: update,
      } as AccountState<TAssetData>, // allow: same partial-spread pattern as updateAccount.
    ]
  )

  return Object.fromEntries(entries)
}

export const setAsset = <TAssetData = unknown>(
  state: SliceState<TAssetData>,
  walletAccount: string,
  assetName: string,
  value: TAssetData
): SliceState<TAssetData> => {
  if (typeof assetName !== 'string') throw new Error('expected asset')

  const current: PerAssetData<TAssetData> = state[walletAccount]?.data ?? {}
  return updateAccount(state, walletAccount, {
    data: {
      ...current,
      [assetName]: value,
    },
  })
}

export const setLoaded = <TAssetData = unknown>(
  state: SliceState<TAssetData>,
  walletAccount: string,
  data?: PerAssetData<TAssetData>
): SliceState<TAssetData> =>
  updateAccount(state, walletAccount, {
    data,
    loaded: true,
    error: null,
    loading: false,
  })

export const setLoading = <TAssetData = unknown>(
  state: SliceState<TAssetData>,
  walletAccount: string
): SliceState<TAssetData> => updateAccount(state, walletAccount, { loading: true })
