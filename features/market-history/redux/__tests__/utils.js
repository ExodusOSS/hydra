import { connectAssets } from '@exodus/assets'
import assetsReduxDefinition from '@exodus/assets-feature/redux'
import { asset as bitcoin } from '@exodus/bitcoin-meta'
import { asset as ethereum } from '@exodus/ethereum-meta'
import localeReduxModule from '@exodus/locale/redux'
import ratesReduxDefinition from '@exodus/rates-monitor/redux'
import { setupRedux } from '@exodus/redux-dependency-injection'
import { combineReducers, createStore } from 'redux'

import reduxModule from '../'

const assets = connectAssets({
  bitcoin,
  ethereum,
})

const START_OF_HOUR = 1_692_615_600_000

const startOfHourTimeSelectorDefinition = {
  id: 'time.selectors.startOfHour',
  factory: () => (state) => START_OF_HOUR,
}

export function setup({ dependencies = [] } = Object.create(null)) {
  const allDependencies = [
    ...dependencies,
    reduxModule,
    localeReduxModule,
    ratesReduxDefinition,
    assetsReduxDefinition,
    startOfHourTimeSelectorDefinition,
  ]
  const enhancers = (createStore) => (reducers, initialState, enhancer) => {
    const reducer = combineReducers(reducers)
    return createStore(reducer, initialState, enhancer)
  }

  const redux = setupRedux({
    // override default deps with provided by de-duping
    dependencies: allDependencies.filter(
      (dep, i) => allDependencies.findIndex((other) => dep.id === other.id) === i
    ),
  })

  const { createHandleEvent, reducers, initialState } = redux
  const store = createStore(reducers, initialState, enhancers)
  const handleEvent = createHandleEvent(store)

  const emitMarketHistory = (data) => handleEvent('marketHistory', data)
  const emitRates = (data) => handleEvent('rates', data)
  handleEvent('assets', { assets })

  return { ...redux, store, emitMarketHistory, START_OF_HOUR, emitRates }
}
