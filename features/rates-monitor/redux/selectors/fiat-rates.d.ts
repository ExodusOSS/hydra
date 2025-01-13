import { RatesByCurrency, RateByAssetTicker } from '../types'

export declare const fiatRatesDefinition: {
  id: 'fiatRates'
  resultFunction: (rates: RatesByCurrency, currency: string) => RateByAssetTicker
  dependencies: [{ selector: 'data' }, { module: 'locale'; selector: 'currency' }]
}
