import id from './id'
import { APP_PROCESS_INITIAL_STATE } from '../constants'
import selectors from './selectors'

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
