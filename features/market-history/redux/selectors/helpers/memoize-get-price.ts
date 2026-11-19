import { memoize } from '@exodus/basic-utils'

import type { PriceRecord, PriceTimeType } from '../../../types.js'

import { prepareTime } from './date-utils.js'

const memoizeGetPrices = (
  getAssetPrices: (assetName: string) => PriceRecord | Error,
  rates: Record<string, { price?: number }>,
  type: PriceTimeType,
  getAsset: (assetName: string) => { ticker: string },
  currentTime: number
) => {
  const preparedCurrentTime = prepareTime(new Date(currentTime), type)

  const getHistoricalPrice = (assetName: string, time: Date): number | null => {
    const historicalPrices = getAssetPrices(assetName)
    if (!historicalPrices || historicalPrices instanceof Error) return null

    const preparedTime = prepareTime(time, type)

    const rate = rates[getAsset(assetName).ticker]
    if (rate && rate.price && preparedTime === preparedCurrentTime) return rate.price

    return historicalPrices.get(preparedTime) ?? null
  }

  return memoize(
    (assetName: string, time: Date) => getHistoricalPrice(assetName, time),
    (assetName: string, time: Date) => `${time.valueOf()}-${assetName}`
  )
}

export default memoizeGetPrices
