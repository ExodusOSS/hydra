import { connectAssets } from '@exodus/assets'
import assetsReduxDefinition from '@exodus/assets-feature/redux/index.js'
import { asset as bitcoin } from '@exodus/bitcoin-meta'
import { asset as ethereum } from '@exodus/ethereum-meta'
import localeReduxModule from '@exodus/locale/redux/index.js'
import ratesReduxDefinition from '@exodus/rates-monitor/redux/index.js'
import { type ContainerDependency, setupRedux } from '@exodus/redux-dependency-injection'
import { createStore } from 'redux'

import reduxModule from '../index.js'

const assets = connectAssets({
  bitcoin,
  ethereum,
})

const START_OF_HOUR = 1_692_615_600_000
const START_OF_MINUTE = 1_692_615_600_000

const startOfHourTimeSelectorDefinition = {
  id: 'time.selectors.startOfHour',
  factory: () => (_state: unknown) => START_OF_HOUR,
}

const startOfMinuteTimeSelectorDefinition = {
  id: 'time.selectors.startOfMinute',
  factory: () => (_state: unknown) => START_OF_MINUTE,
}

export function setup<const Deps extends readonly ContainerDependency[] = readonly []>({
  dependencies,
}: { dependencies?: Deps } = {}) {
  const allDependencies = [
    ...(dependencies ?? []),
    reduxModule,
    localeReduxModule as ContainerDependency,
    ratesReduxDefinition as ContainerDependency,
    assetsReduxDefinition as ContainerDependency,
    startOfHourTimeSelectorDefinition as ContainerDependency,
    startOfMinuteTimeSelectorDefinition as ContainerDependency,
  ]
  const redux = setupRedux({
    // override default deps with provided by de-duping
    dependencies: allDependencies.filter(
      (dep, i) => allDependencies.findIndex((other) => dep.id === other.id) === i
    ),
  })

  const { createHandleEvent, combinedReducer } = redux
  const store = createStore(combinedReducer)
  const handleEvent = createHandleEvent(store)

  const emitMarketHistory = (data: unknown) => handleEvent('marketHistory', data)
  const emitRates = (data: unknown) => handleEvent('rates', data)
  handleEvent('assets', { assets })

  return { ...redux, store, emitMarketHistory, START_OF_HOUR, emitRates }
}
