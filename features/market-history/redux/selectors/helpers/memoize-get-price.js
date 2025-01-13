import appendPricesWithRate from './append-prices-with-rate'
import { memoize } from 'lodash' // eslint-disable-line @exodus/restricted-imports/prefer-basic-utils -- TODO: fix next time we touch this file
import { prepareTime } from './date-utils'

const memoizeGetPrices = (getAssetPrices, rates, type, assets, currentTime) => {
  const getHistoricalPrice = (assetName, time) => {
    const rate = rates[assets[assetName].ticker]
    const historicalPrices = getAssetPrices(assetName)
    const pricesWithRate = appendPricesWithRate({ historicalPrices, rate, type, currentTime })

    const preparedTime = prepareTime(time, type)
    return pricesWithRate?.[preparedTime] || null
  }

  return memoize(
    (assetName, time) => getHistoricalPrice(assetName, time),
    (assetName, time) => `${time.valueOf()}-${assetName}`
  )
}

export default memoizeGetPrices
