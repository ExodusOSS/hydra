import { mapValues } from '@exodus/basic-utils'
import type { ReduxModuleDefinition } from '@exodus/redux-dependency-injection'
import id from './id.js'
import initialState from './initial-state.js'
import helper from './multi-account-helper.js'
import customTxLogsSelectors from './selectors.js'
import type { TxLogMap, TxSet } from '../../types.js'

type TxLogsPayload = {
  value?: TxLogMap
  changes?: TxLogMap
}

type TxLogsModuleState = typeof initialState

const txLogsReduxModuleDefinition = {
  id,
  type: 'redux-module',
  initialState,
  eventReducers: {
    txLogs: (state: TxLogsModuleState, { value, changes }: TxLogsPayload) =>
      value
        ? mapValues(value, (txSetsByAsset) => ({
            error: null,
            loaded: true,
            data: txSetsByAsset,
            hasHistory: Object.values(txSetsByAsset).some((txSet: TxSet) => txSet.size > 0),
          }))
        : {
            ...state,
            ...mapValues(changes, (txSetsByAsset, walletAccount) => {
              const data: Record<string, TxSet> = {
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
} as const satisfies ReduxModuleDefinition<TxLogsModuleState>

export default txLogsReduxModuleDefinition
