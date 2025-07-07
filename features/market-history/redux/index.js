import id from './id.js'
import initialState from './initial-state.js'
import selectorDefinitions from './selectors/index.js'

const marketHistoryReduxDefinition = {
  id,
  type: 'redux-module',
  initialState,
  eventReducers: {
    marketHistory: (state, marketHistory) => {
      return {
        ...state,
        data: marketHistory.data,
      }
    },
  },
  selectorDefinitions,
}

export default marketHistoryReduxDefinition
