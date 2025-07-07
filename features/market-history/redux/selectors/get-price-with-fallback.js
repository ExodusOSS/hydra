import { memoize } from '@exodus/basic-utils'
import ms from 'ms'

const PERIOD_TO_MS = {
  hourly: ms('1h'),
  daily: ms('1d'),
  minutely: ms('1m'),
}

const MAX_STEPS = 24
const STEPS_BY_TYPE = {
  hourly: MAX_STEPS,
  daily: 2,
  minutely: 1,
}
const findLastPrice = ({ getPrice, assetName, time, period }) => {
  let i = 0
  const steps = STEPS_BY_TYPE[period]
  while (i < steps) {
    const newTime = time - PERIOD_TO_MS[period] * i
    const price = getPrice(assetName, new Date(newTime))
    if (price) return price
    i++
  }

  return null
}

const getPriceWithFallbackSelector = {
  id: 'getPriceWithFallback',
  resultFunction: (getDailyPrice, getHourlyPrice, getMinutelyPrice) => {
    const fnByType = {
      daily: getDailyPrice,
      hourly: getHourlyPrice,
      minutely: getMinutelyPrice,
    }

    return memoize(
      (assetName, time, type) => {
        const getPrice = fnByType[type]

        return findLastPrice({ getPrice, assetName, time, period: type })
      },
      (assetName, time, type) => `${type}-${time.valueOf()}-${assetName}`
    )
  },
  dependencies: [
    //
    { selector: 'getDailyPrice' },
    { selector: 'getHourlyPrice' },
    { selector: 'getMinutelyPrice' },
  ],
}

export default getPriceWithFallbackSelector
