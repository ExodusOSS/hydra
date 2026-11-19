import { memoize } from '@exodus/basic-utils'
import ms from 'ms'
import type { SelectorDefinition } from '@exodus/redux-dependency-injection'

import type { GetPriceFn, PriceTimeType } from '../../types.js'

const PERIOD_TO_MS: Record<PriceTimeType, number> = {
  hourly: ms('1h'),
  daily: ms('1d'),
  minutely: ms('1m'),
}

const MAX_STEPS = 24
const STEPS_BY_TYPE: Record<PriceTimeType, number> = {
  hourly: MAX_STEPS,
  daily: 2,
  minutely: 1,
}
const findLastPrice = ({
  getPrice,
  assetName,
  time,
  period,
}: {
  getPrice: GetPriceFn
  assetName: string
  time: number
  period: PriceTimeType
}): number | null => {
  let i = 0
  const steps = STEPS_BY_TYPE[period]
  while (i < steps) {
    const newTime = time - PERIOD_TO_MS[period]! * i
    const price = getPrice(assetName, new Date(newTime))
    if (price) return price
    i++
  }

  return null
}

const getPriceWithFallbackSelector = {
  id: 'getPriceWithFallback',
  resultFunction: (
    getDailyPrice: GetPriceFn,
    getHourlyPrice: GetPriceFn,
    getMinutelyPrice: GetPriceFn
  ) => {
    const fnByType: Record<PriceTimeType, GetPriceFn> = {
      daily: getDailyPrice,
      hourly: getHourlyPrice,
      minutely: getMinutelyPrice,
    }

    return memoize(
      (assetName: string, time: number, type: PriceTimeType) => {
        const getPrice = fnByType[type]

        return findLastPrice({ getPrice, assetName, time, period: type })
      },
      (assetName: string, time: number, type: PriceTimeType) =>
        `${type}-${time.valueOf()}-${assetName}`
    )
  },
  dependencies: [
    //
    { selector: 'getDailyPrice' },
    { selector: 'getHourlyPrice' },
    { selector: 'getMinutelyPrice' },
  ],
} as const satisfies SelectorDefinition

export default getPriceWithFallbackSelector
