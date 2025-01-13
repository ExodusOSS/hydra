import id from './id'
import initialState from './initial-state'
import selectorDefinitions from './selectors'

const marketHistoryReduxDefinition = {
  id,
  type: 'redux-module',
  initialState,
  eventReducers: {
    marketHistory: (state, marketHistory) => ({
      ...state,
      loaded: true,
      data: marketHistory.data,
    }),
  },
  selectorDefinitions,
}

export default marketHistoryReduxDefinition
