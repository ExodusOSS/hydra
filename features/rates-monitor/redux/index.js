import id from './id'
import initialState from './initial-state'
import selectorDefinitions from './selectors'

const ratesReduxDefinition = {
  id,
  type: 'redux-module',
  initialState,
  eventReducers: {
    rates: (state, rates) => ({
      ...state,
      loaded: state.loaded || Object.keys(rates).length > 0,
      data: { ...state.data, ...rates },
    }),
  },
  selectorDefinitions,
}

export default ratesReduxDefinition
