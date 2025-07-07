import { memoize } from '@exodus/basic-utils'
import { prepareTime } from './date-utils.js'

const memoizeGetAssetPrices = (historicalPrices, rate, type, currentTime) => {
  if (historicalPrices instanceof Error) return () => null

  const preparedCurrentTime = prepareTime(new Date(currentTime), type)

  return memoize((time) => {
    const preparedTime = prepareTime(time, type)
    if (rate && rate.price && preparedTime === preparedCurrentTime) return rate.price
    return historicalPrices?.[preparedTime] || null
  })
}

export default memoizeGetAssetPrices
