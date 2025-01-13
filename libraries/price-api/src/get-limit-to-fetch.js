// @flow
import { timeToDays, timeToHours } from './utils'
import { LIMIT, START_TIME } from './constants'
import type { GranularityType, HistoryType } from './types'
import lastTimestampFromPricesMap from './last-timestamp-from-prices-map'

const getLimit = ({
  granularity,
  history,
  requestLimit,
  requestTimestamp,
  specificTimestamp,
}: {
  granularity: GranularityType,
  history: HistoryType,
  requestLimit?: null | number,
  requestTimestamp: number,
  specificTimestamp?: null | number,
}): number => {
  if (specificTimestamp) return 1
  // lastCachedTime is always UTC start of hour or day
  const lastCachedTime = lastTimestampFromPricesMap(history)

  const limitFromOptions = requestLimit || LIMIT[granularity]

  if (granularity === 'hour') {
    // don't fetch only if it's still same UTC hour
    if (!lastCachedTime) return limitFromOptions
    return Math.min(limitFromOptions, timeToHours(requestTimestamp - lastCachedTime))
  }

  return Math.min(limitFromOptions, timeToDays(requestTimestamp - (lastCachedTime || START_TIME)))
}

export default getLimit
