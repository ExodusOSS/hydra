import selectorDefinitions from './selectors/index.js'

const feeDataReduxDefinition = {
  id: 'feeData',
  type: 'redux-module',
  initialState: {},
  eventReducers: { feeData: (state, data) => data },
  selectorDefinitions,
}

export default feeDataReduxDefinition
