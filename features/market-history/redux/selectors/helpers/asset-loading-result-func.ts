import type { PriceRecord } from '../../../types.js'

const assetLoadingResultFunc = (prices: PriceRecord | undefined): boolean => {
  const hasPrices = prices && prices.size > 0
  return !hasPrices
}

export default assetLoadingResultFunc
