import lodash from 'lodash'
import { mapValues } from '@exodus/basic-utils'

const { get } = lodash

export const updateAccount = (state, walletAccount, update) => {
  if (!walletAccount) throw new Error('expected walletAccount')

  return {
    ...state,
    [walletAccount]: {
      ...state[walletAccount],
      ...update,
    },
  }
}

export const mergeAccountsData = (state, payload) => {
  const updated = mapValues(payload, (byAsset, walletAccount) => ({
    ...state[walletAccount],
    data: {
      ...state[walletAccount]?.data,
      ...byAsset,
    },
  }))

  return { ...state, ...updated }
}

export const setAccounts = (state, valuesByAccount) => {
  const entries = Object.entries(valuesByAccount).map(([key, update]) => [
    key,
    {
      ...state[key],
      loaded: true,
      data: update,
    },
  ])

  return Object.fromEntries(entries)
}

export const setAsset = (state, walletAccount, assetName, value) => {
  if (typeof assetName !== 'string') throw new Error('expected asset')

  const current = get(state, [walletAccount, 'data'], {})
  return updateAccount(state, walletAccount, {
    data: {
      ...current,
      [assetName]: value,
    },
  })
}

export const setLoaded = (state, walletAccount, data) => {
  return updateAccount(state, walletAccount, {
    data,
    loaded: true,
    error: null,
    loading: false,
  })
}

export const setLoading = (state, walletAccount) => {
  return updateAccount(state, walletAccount, {
    loading: true,
  })
}
