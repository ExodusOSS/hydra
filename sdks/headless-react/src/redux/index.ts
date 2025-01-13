import { REDUX_SLICE_NAME } from '../constants/index.js'
import { State, SetPayload } from '../types.js'

const initialState: State = {}

const uiLoad = (state: State, payload: State = {}) => payload

const uiSet = (state: State, payload: SetPayload) => {
  const { namespace, key, value } = payload

  if (!namespace) {
    console.error('uiRedux: UI_SET action requires a namespace')
    return state
  }

  if (!key) {
    console.error('uiRedux: UI_SET action requires a key')
    return state
  }

  const namespaceState = state[namespace] || {}

  return { ...state, [namespace]: { ...namespaceState, [key]: value } }
}

const uiReduxDefinition = {
  id: REDUX_SLICE_NAME,
  type: 'redux-module',
  initialState,
  actionReducers: { UI_LOAD: uiLoad, UI_SET: uiSet },
  selectorDefinitions: [],
} as const

export default uiReduxDefinition
