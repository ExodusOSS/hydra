import id from './id.js'
import { APP_PROCESS_INITIAL_STATE } from '../constants.js'
import selectors from './selectors/index.js'

const balancesReduxDefinition = {
  id,
  type: 'redux-module',
  initialState: APP_PROCESS_INITIAL_STATE,
  eventReducers: {
    appProcess: (state, payload) => ({
      ...state.data,
      ...payload,
    }),
  },
  selectorDefinitions: selectors,
}

export default balancesReduxDefinition
