import { defineSelectorResultFunction } from '@exodus/redux-dependency-injection'

import type { RatesByCurrency, RateByAssetTicker, RatesSelectorState } from '../types.js'

export type FiatRatesSelector = (state: RatesSelectorState) => RateByAssetTicker

const DEFAULT: RateByAssetTicker = Object.create(null)
const resultFunction = (rates: RatesByCurrency, currency: string) => rates[currency] ?? DEFAULT

const fiatRatesSelector = defineSelectorResultFunction({
  id: 'fiatRates',
  resultFunction,
  dependencies: [
    //
    { selector: 'data' },
    { module: 'locale', selector: 'currency' },
  ],
})

export default fiatRatesSelector
