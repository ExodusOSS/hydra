import id from './id.js'
import initialState from './initial-state.js'
import selectorDefinitions from './selectors/index.js'

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
    ratesSimulationEnabled: (state, simulationEnabled) => ({
      ...state,
      simulationEnabled,
    }),
  },
  selectorDefinitions,
}

export default ratesReduxDefinition
