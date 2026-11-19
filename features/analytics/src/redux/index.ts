import id from './id.js'

type State = {
  shareActivity: boolean
  loaded: boolean
}

const initialState: State = {
  shareActivity: true,
  loaded: false,
}

const analyticsReduxDefinition = {
  id,
  type: 'redux-module',
  initialState,
  eventReducers: {
    shareActivity: (state: State, data: boolean): State => ({
      ...state,
      loaded: true,
      shareActivity: data,
    }),
  },
  selectorDefinitions: [],
} as const

export default analyticsReduxDefinition
