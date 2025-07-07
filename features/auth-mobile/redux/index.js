import selectorDefinitions from './selectors.js'

const initialState = {
  loading: true,
  hasPin: false,
  hasBioAuth: false,
  biometry: null,
}

const eventReducers = {
  auth: (state, payload) => ({ ...state, ...payload, loading: false }),
}

const authMobileReduxDefinition = {
  id: 'auth',
  type: 'redux-module',
  initialState,
  eventReducers,
  selectorDefinitions,
}

export default authMobileReduxDefinition
