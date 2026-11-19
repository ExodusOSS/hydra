import { defineReduxModule } from '@exodus/redux-dependency-injection'

import selectorDefinitions from './selectors/index.js'
import type { RatesByCurrency, RatesState } from './types.js'

const initialState: RatesState = {
  loaded: false,
  data: Object.create(null),
  error: null,
}

const ratesReduxDefinition = defineReduxModule({
  id: 'rates',
  initialState,
  eventReducers: {
    rates: (state: RatesState, rates: RatesByCurrency) => ({
      ...state,
      loaded: state.loaded || Object.keys(rates).length > 0,
      data: { ...state.data, ...rates },
    }),
  },
  selectorDefinitions,
})

export default ratesReduxDefinition
