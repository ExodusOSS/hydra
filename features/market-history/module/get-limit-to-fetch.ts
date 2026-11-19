import type { Granularity, PriceData } from '../types.js'

import lastTimestampFromPricesMap from './last-timestamp-from-prices-map.js'
import { timeToDays, timeToHours, timeToMinutes } from './utils.js'

const START_TIME = new Date('2015-12-09').getTime()

const getLimit = ({
  granularity,
  history,
  requestLimit,
  requestTimestamp,
  specificTimestamp,
}: {
  granularity: Granularity
  history: Map<number, PriceData>
  requestTimestamp: number
  requestLimit: number
  specificTimestamp?: number | null
}): number => {
  if (specificTimestamp) return 1
  // lastCachedTime is always UTC start of hour or day
  const lastCachedTime = lastTimestampFromPricesMap(history)

  if (granularity === 'minute') {
    // don't fetch only if it's still same UTC minute
    if (!lastCachedTime) return requestLimit
    return Math.ceil(Math.min(requestLimit, timeToMinutes(requestTimestamp - lastCachedTime)))
  }

  if (granularity === 'hour') {
    // don't fetch only if it's still same UTC hour
    if (!lastCachedTime) return requestLimit
    return Math.min(requestLimit, timeToHours(requestTimestamp - lastCachedTime))
  }

  return Math.min(requestLimit, timeToDays(requestTimestamp - (lastCachedTime || START_TIME)))
}

export default getLimit
