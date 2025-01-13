import appendPricesWithRate from './append-prices-with-rate'
import { memoize } from 'lodash' // eslint-disable-line @exodus/restricted-imports/prefer-basic-utils -- TODO: fix next time we touch this file
import { prepareTime } from './date-utils'

const memoizeGetAssetPrices = (historicalPrices, rate, type, currentTime) => {
  const allPrices = appendPricesWithRate({ historicalPrices, rate, type, currentTime })

  return memoize((time) => allPrices?.[prepareTime(time, type)] || null)
}

export default memoizeGetAssetPrices
