import getLimit from './get-limit-to-fetch.js'
import tryToGetCache from './try-to-load-cache.js'
import lastTimestampFromPricesMap from './last-timestamp-from-prices-map.js'

export default async function prepareFetchInstructions({
  tickerSymbol,
  fiatTicker,
  granularity,
  getCacheFromStorage,
  requestLimit,
  specificTimestamp,
  ignoreCache,
  runtimeCache,
  getRuntimeCacheKey,
  requestTimestamp,
}) {
  const runtimeCacheKey = getRuntimeCacheKey({
    fiatTicker,
    assetTicker: tickerSymbol,
    granularity,
  })
  const history = await tryToGetCache({
    runtimeCacheKey,
    runtimeCache,
    getCacheFromStorage: () => getCacheFromStorage(tickerSymbol),
  })

  if (specificTimestamp && history.get(specificTimestamp)) {
    return { history, tickerSymbol }
  }

  const limit = getLimit({
    granularity,
    history: ignoreCache ? new Map() : history,
    requestLimit,
    requestTimestamp,
    specificTimestamp,
  })

  if (limit <= 0) {
    return { history, tickerSymbol }
  }

  const lastCachedTime = lastTimestampFromPricesMap(history)
  const lastCachedItem = history.get(lastCachedTime)

  return { history, limit, lastCachedItem, tickerSymbol }
}
