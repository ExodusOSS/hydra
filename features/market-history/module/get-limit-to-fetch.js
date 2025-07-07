import { timeToDays, timeToHours, timeToMinutes } from './utils.js'
import { LIMIT, START_TIME } from './constants.js'

import lastTimestampFromPricesMap from './last-timestamp-from-prices-map.js'

/**
 * @typedef {import('./types.d.ts').GranularityType} GranularityType
 * @typedef {import('./types.d.ts').HistoryType} HistoryType
 */

/**
 * @param {object} options
 * @param {GranularityType} options.granularity
 * @param {HistoryType} options.history
 * @param {number} options.requestTimestamp
 * @param {number} [options.requestLimit]
 * @param {number} [options.specificTimestamp]
 * @returns {number}
 */
const getLimit = ({ granularity, history, requestLimit, requestTimestamp, specificTimestamp }) => {
  if (specificTimestamp) return 1
  // lastCachedTime is always UTC start of hour or day
  const lastCachedTime = lastTimestampFromPricesMap(history)

  const limitFromOptions = requestLimit || LIMIT[granularity]

  if (granularity === 'minute') {
    // don't fetch only if it's still same UTC minute
    if (!lastCachedTime) return limitFromOptions
    return Math.ceil(Math.min(limitFromOptions, timeToMinutes(requestTimestamp - lastCachedTime)))
  }

  if (granularity === 'hour') {
    // don't fetch only if it's still same UTC hour
    if (!lastCachedTime) return limitFromOptions
    return Math.min(limitFromOptions, timeToHours(requestTimestamp - lastCachedTime))
  }

  return Math.min(limitFromOptions, timeToDays(requestTimestamp - (lastCachedTime || START_TIME)))
}

export default getLimit
