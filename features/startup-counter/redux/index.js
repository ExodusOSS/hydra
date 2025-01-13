const initialState = {
  value: undefined,
  loaded: false,
}

const eventReducers = {
  startupCount: (state, payload) => ({ ...state, value: payload, loaded: true }),
}

const startupCounterReduxDefinition = {
  id: 'startupCounter',
  type: 'redux-module',
  initialState,
  eventReducers,
  selectorDefinitions: [],
}

export default startupCounterReduxDefinition
