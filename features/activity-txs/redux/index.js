import id from './id'
import initialState from './initial-state'
import selectorDefinitions from './selectors'
import helper from './multi-account-helper'
import { setAccounts } from '@exodus/multi-account-redux/src/common'

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
