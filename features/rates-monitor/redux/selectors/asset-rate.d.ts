import type { Rate } from '../types'

type FiatRatesSelector = (state: any) => { [assetTicker: string]: Rate }
type CreateAssetByNameSelector = (assetName: string) => (state: any) => any

export declare const assetRateDefinition: {
  id: 'assetRate'
  selectorFactory: (
    fiatRatesSelector: FiatRatesSelector,
    createAssetByNameSelector: CreateAssetByNameSelector
  ) => (assetName: string) => (state: any) => Rate
  dependencies: [{ selector: 'fiatRates' }, { selector: 'createAssetSelector'; module: 'assets' }]
}
