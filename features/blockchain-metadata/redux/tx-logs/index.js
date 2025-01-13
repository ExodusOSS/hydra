import { mapValues } from '@exodus/basic-utils'
import id from './id.js'
import initialState from './initial-state.js'
import helper from './multi-account-helper.js'
import customTxLogsSelectors from './selectors.js'

const txLogsReduxModuleDefinition = {
  id,
  type: 'redux-module',
  initialState,
  eventReducers: {
    txLogs: (state, { value, changes }) =>
      value
        ? mapValues(value, (txSetsByAsset) => ({
            error: null,
            loaded: true,
            data: txSetsByAsset,
            hasHistory: Object.values(txSetsByAsset).some((txSet) => txSet.size > 0),
          }))
        : {
            ...state,
            ...mapValues(changes, (txSetsByAsset, walletAccount) => {
              const data = {
                ...state[walletAccount]?.data,
                ...txSetsByAsset,
              }

              return {
                ...state[walletAccount],
                error: null,
                loaded: true,
                data,
                hasHistory: Object.values(data).some((txSet) => txSet.size > 0),
              }
            }),
          },
  },
  selectorDefinitions: [...helper.selectorDefinitions, ...customTxLogsSelectors],
}

export default txLogsReduxModuleDefinition
