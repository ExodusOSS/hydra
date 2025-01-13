import type { Rate } from '../types'

type CreateAssetRateSelector = (assetName: string) => (state: any) => Rate

export declare const assetPriceDefinition: {
  id: 'assetPrice'
  selectorFactory: (
    createAssetRateSelector: CreateAssetRateSelector
  ) => (assetName: string) => (state: any) => number
  dependencies: [{ selector: 'assetRate' }]
}
