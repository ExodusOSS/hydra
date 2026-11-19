import type { CacheEntry, Granularity, PriceData } from '../types.js'

import getLimit from './get-limit-to-fetch.js'
import lastTimestampFromPricesMap from './last-timestamp-from-prices-map.js'
import tryToGetCache from './try-to-load-cache.js'

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
}: {
  tickerSymbol: string
  fiatTicker: string
  granularity: Granularity
  getCacheFromStorage: (ticker: string) => Promise<CacheEntry[] | string | undefined>
  requestLimit: number
  specificTimestamp?: number | null
  ignoreCache: boolean
  runtimeCache: Map<string, CacheEntry[]>
  getRuntimeCacheKey: (params: {
    fiatTicker: string
    assetTicker: string
    granularity: Granularity
  }) => string
  requestTimestamp: number
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
  const lastCachedItem: PriceData | undefined = lastCachedTime
    ? history.get(lastCachedTime)
    : undefined

  return { history, limit, lastCachedItem, tickerSymbol }
}
