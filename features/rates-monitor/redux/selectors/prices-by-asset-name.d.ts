import { RateByAssetTicker } from '../types'

type GetAssetFromTicker = (ticker: string) => any

export declare const pricesByAssetNameDefinition: {
  id: 'pricesByAssetName'
  resultFunction: (
    rates: RateByAssetTicker,
    loading: boolean,
    currencyName: string,
    getAssetFromTicker: GetAssetFromTicker
  ) => { [assetName: string]: { USD: number; [currencyName: string]: number } }
  dependencies: [
    { selector: 'fiatRates' },
    { selector: 'loading' },
    { module: 'locale'; selector: 'currency' },
    { module: 'assets'; selector: 'getAssetFromTicker' },
  ]
}
