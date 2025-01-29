import type { RateByAssetTicker } from '../types'

export declare const getIsRateAvailableDefinition: {
  id: 'getIsRateAvailable'
  resultFunction: (
    loading: boolean,
    rates: RateByAssetTicker,
    assets: { [assetName: string]: any }
  ) => (assetName: string) => boolean
  dependencies: [
    { selector: 'loading' },
    { selector: 'fiatRates' },
    { module: 'assets'; selector: 'all' },
  ]
}
