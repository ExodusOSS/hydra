import id from './id.js'
import initialState from './initial-state.js'
import selectorDefinitions from './selectors/index.js'
import helper from './multi-account-helper.js'
import { setAccounts } from '@exodus/multi-account-redux/src/common.js'

const activityTxsReduxDefinition = {
  id,
  type: 'redux-module',
  initialState,
  eventReducers: {
    activityTxs: (state, data) => {
      return setAccounts(state, data)
    },
  },
  selectorDefinitions: [...helper.selectorDefinitions, ...selectorDefinitions],
}

export default activityTxsReduxDefinition
