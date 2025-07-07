import id from './id.js'

const analyticsReduxDefinition = {
  id,
  type: 'redux-module',
  initialState: {
    shareActivity: true,
    loaded: false,
  },
  eventReducers: {
    shareActivity: (state, data) => ({ ...state, loaded: true, shareActivity: data }),
  },
  selectorDefinitions: [],
}

export default analyticsReduxDefinition
