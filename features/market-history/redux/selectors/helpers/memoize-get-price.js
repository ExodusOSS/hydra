import { memoize } from '@exodus/basic-utils'
import { prepareTime } from './date-utils.js'

const memoizeGetPrices = (getAssetPrices, rates, type, assets, currentTime) => {
  const preparedCurrentTime = prepareTime(new Date(currentTime), type)

  const getHistoricalPrice = (assetName, time) => {
    const historicalPrices = getAssetPrices(assetName)
    if (historicalPrices instanceof Error) return null

    const preparedTime = prepareTime(time, type)

    const rate = rates[assets[assetName].ticker]
    if (rate && rate.price && preparedTime === preparedCurrentTime) return rate.price

    return historicalPrices?.[preparedTime] || null
  }

  return memoize(
    (assetName, time) => getHistoricalPrice(assetName, time),
    (assetName, time) => `${time.valueOf()}-${assetName}`
  )
}

export default memoizeGetPrices
