import id from './id.js'
import initialState from './initial-state.js'
import selectorDefinitions from './selectors/index.js'
import { mapValues } from '@exodus/basic-utils'
import lodash from 'lodash'
import helper from './multi-account-helper.js'
import { setAccounts } from '@exodus/multi-account-redux/src/common.js'

const { merge } = lodash

const mergeChanges = (balancesState, changesByWalletAccount) => {
  return {
    ...balancesState,
    ...mapValues(changesByWalletAccount, (changesByAsset, walletAccount) => {
      if (!balancesState?.[walletAccount]) {
        return {
          loaded: true,
          error: null,
          data: mapValues(changesByAsset, (changesByField) =>
            mapValues(changesByField, (balanceField) => balanceField.to)
          ),
        }
      }

      const updatedData = mapValues(changesByAsset, (changesByField) =>
        mapValues(changesByField, (balanceField) => balanceField.to)
      )

      return {
        ...balancesState[walletAccount],
        data: merge({}, balancesState[walletAccount].data, updatedData),
      }
    }),
  }
}

const balancesReduxDefinition = {
  id,
  type: 'redux-module',
  initialState,
  eventReducers: {
    balances: (state, payload) => {
      const { hasBalance, ...walletAccountBalances } = state
      const balancesLoaded = Object.keys(walletAccountBalances).every((value) => value.loaded)

      if (balancesLoaded && payload.changes && Object.keys(payload.changes).length > 0) {
        return mergeChanges(state, payload.changes)
      }

      return { hasBalance, ...setAccounts(state, payload.balances) }
    },
    hasBalance: (state, payload) => ({
      ...state,
      hasBalance: payload,
    }),
  },
  selectorDefinitions: [...helper.selectorDefinitions, ...selectorDefinitions],
}

export default balancesReduxDefinition
