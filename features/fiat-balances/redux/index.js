import id from './id'
import initialState from './initial-state'
import createSelectorDefinitions from './selectors'
import { merge } from 'lodash'

const mergeWalletAccountChanges = (balances, byWalletAccount) =>
  merge(
    //
    {},
    balances,
    byWalletAccount
  )

const mergeAssetSourceChanges = (balances, byType) =>
  merge(
    //
    {},
    balances,
    byType
  )

const prepareData = ({ state, payload }) => {
  const { totals, byWalletAccount, ...rest } = payload
  return {
    ...mergeAssetSourceChanges(state.data, rest),
    totals,
    byWalletAccount: mergeWalletAccountChanges(state.data.byWalletAccount, byWalletAccount),
  }
}

const createFiatBalancesReduxDefinition = ({
  optimisticActivityEnabled,
  ignoreMarketCapAssets = ['ethereumgoerli', 'bitcoinregtest', 'bitcointestnet'],
}) => ({
  id,
  type: 'redux-module',
  initialState,
  eventReducers: {
    fiatBalances: (state, { balances }) => {
      const data = prepareData({ state, payload: balances })

      return {
        ...state,
        loaded: true,
        optimisticLoaded: true,
        data,
        optimisticData: optimisticActivityEnabled ? state.optimisticData : data,
      }
    },
    optimisticFiatBalances: (state, { balances }) => ({
      ...state,
      optimisticLoaded: true,
      optimisticData: prepareData({ state, payload: balances }),
    }),
  },
  selectorDefinitions: createSelectorDefinitions({ ignoreMarketCapAssets }),
})

export default createFiatBalancesReduxDefinition
