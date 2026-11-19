import { memoize } from '@exodus/basic-utils'
import type { SelectorDefinition } from '@exodus/redux-dependency-injection'

import type { RateByAssetTicker } from '../types.js'

type Asset = {
  ticker: string
  isCombined?: boolean
  combinedAssetNames?: string[]
}

const resultFunction = (
  loading: boolean,
  rates: RateByAssetTicker,
  getAsset: (assetName: string) => Asset | undefined
) =>
  memoize((assetName: string): boolean => {
    if (loading) return false
    const isValid = (assetName: string) => {
      const asset = getAsset(assetName)
      if (!asset) return false
      const ticker = asset.ticker
      const rate = rates[ticker]
      if (!rate) return false
      if (!rate.price) return false
      return rates[ticker]?.invalid !== true
    }

    const asset = getAsset(assetName)
    if (!asset) return false

    if (asset.isCombined) {
      return asset.combinedAssetNames!.some(isValid)
    }

    return isValid(assetName)
  })

const getIsRateAvailableSelector = {
  id: 'getIsRateAvailable',
  resultFunction,
  dependencies: [
    //
    { selector: 'loading' },
    { selector: 'fiatRates' },
    { module: 'assets', selector: 'getAsset' },
  ],
} as const satisfies SelectorDefinition

export default getIsRateAvailableSelector
