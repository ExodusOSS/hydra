import type { ReduxModuleDefinition } from '@exodus/redux-dependency-injection'

import type { MarketHistoryData, MarketHistoryState } from '../types.js'

import id from './id.js'
import initialState from './initial-state.js'
import selectorDefinitions from './selectors/index.js'

const marketHistoryReduxDefinition = {
  id,
  type: 'redux-module',
  initialState,
  eventReducers: {
    marketHistory: (state: MarketHistoryState, marketHistory: { data: MarketHistoryData }) => {
      return {
        ...state,
        data: marketHistory.data,
      }
    },
  },
  selectorDefinitions,
} as const satisfies ReduxModuleDefinition<MarketHistoryState>

export default marketHistoryReduxDefinition
