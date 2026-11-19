import assetsRedux from '@exodus/assets-feature/redux/index.js'
// @ts-expect-error -- untyped module
import { testAssets } from '@exodus/assets-test-meta'
import localeRedux from '@exodus/locale/redux/index.js'
import { createReduxStore, setupRedux } from '@exodus/redux-dependency-injection'

import ratesReduxDefinition from '../index.js'

type RatesSelectors = {
  loading: (state: State) => unknown
  fiatRates: (state: State) => unknown
  getIsRateAvailable: (state: State) => (assetName: string) => unknown
  pricesByAssetName: (state: State) => unknown
  assetPrice: (assetName: string) => (state: State) => unknown
  assetRate: (assetName: string) => (state: State) => unknown
}
type State = unknown
type Selectors = { rates: RatesSelectors }
type SetupResult = {
  store: ReturnType<typeof createReduxStore>
  selectors: Selectors
  emitRates: (rates: unknown) => void
  emitCurrencyChange: (currency: unknown) => void
}

const assets = testAssets

export function setup(): SetupResult {
  const allDependencies = [ratesReduxDefinition, localeRedux, assetsRedux]

  const redux = setupRedux({
    dependencies: allDependencies.filter(
      (dep, i) => allDependencies.findIndex((other) => dep.id === other.id) === i
    ),
  })

  const store = createReduxStore(redux)
  const handleEvent = redux.createHandleEvent(store)

  const emitRates = (rates: unknown) => handleEvent('rates', rates)
  const emitCurrencyChange = (currency: unknown) => handleEvent('currency', currency)
  handleEvent('assets', { assets })
  const selectors = redux.selectors as Selectors

  return {
    selectors,
    store,
    emitRates,
    emitCurrencyChange,
  }
}
