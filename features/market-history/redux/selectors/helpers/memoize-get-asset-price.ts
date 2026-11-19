import { memoize } from '@exodus/basic-utils'

import type { PriceRecord, PriceTimeType } from '../../../types.js'

import { prepareTime } from './date-utils.js'

const memoizeGetAssetPrices = (
  historicalPrices: PriceRecord | Error | undefined,
  rate: { price?: number } | undefined,
  type: PriceTimeType,
  currentTime: number
): ((time: Date) => number | null) => {
  if (historicalPrices instanceof Error) return () => null

  const preparedCurrentTime = prepareTime(new Date(currentTime), type)

  return memoize((time: Date) => {
    const preparedTime = prepareTime(time, type)
    if (rate && rate.price && preparedTime === preparedCurrentTime) return rate.price
    if (!historicalPrices) return null
    return historicalPrices.get(preparedTime) ?? null
  })
}

export default memoizeGetAssetPrices
