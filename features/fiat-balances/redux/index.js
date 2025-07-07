import id from './id.js'
import initialState from './initial-state.js'
import createSelectorDefinitions from './selectors/index.js'

const mergeChanges = (balances, changes) => {
  const result = { ...balances }

  for (const key in changes) {
    const sourceValue = changes[key]

    if (sourceValue && typeof sourceValue === 'object' && sourceValue.constructor === Object) {
      result[key] = mergeChanges(result[key] || {}, sourceValue)
    } else {
      result[key] = sourceValue
    }
  }

  return result
}

const prepareData = ({ state, payload }) => {
  const { totals, byWalletAccount, ...rest } = payload
  return {
    ...mergeChanges(state.data, rest),
    totals,
    byWalletAccount: mergeChanges(state.data.byWalletAccount, byWalletAccount),
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
        optimisticLoaded: optimisticActivityEnabled ? state.optimisticLoaded : true,
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
