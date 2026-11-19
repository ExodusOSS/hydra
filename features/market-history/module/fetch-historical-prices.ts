import dayjs from '@exodus/dayjs'

import type { CacheEntry, FetchApiFunction, Granularity, PriceData } from '../types.js'
import { mapToArray } from '../utils.js'

import fetchAndProcessTickers from './fetch-and-process-tickers.js'
import prepareFetchInstructions from './prepare-fetch-instructions.js'

const runtimeCacheDefault = new Map<string, CacheEntry[]>()
const getRuntimeCacheKeyDefault = ({
  fiatTicker,
  assetTicker,
  granularity,
}: {
  fiatTicker: string
  assetTicker: string
  granularity: string
}): string => `${assetTicker}_${fiatTicker}_${granularity}`

export default async function fetchHistoricalPrices({
  api,
  assetTickers,
  fiatTicker,
  granularity = 'day',
  getCacheFromStorage,
  requestLimit,
  timestamp,
  getCurrentTime = () => Date.now(),
  ignoreInvalidSymbols = false,
  ignoreCache = false,
  runtimeCache = runtimeCacheDefault,
  getRuntimeCacheKey = getRuntimeCacheKeyDefault,
}: {
  api: FetchApiFunction
  assetTickers: string | string[]
  fiatTicker: string
  granularity?: Granularity
  getCacheFromStorage: (ticker: string) => Promise<CacheEntry[] | string | undefined>
  requestLimit: number
  timestamp?: number
  getCurrentTime?: () => number
  ignoreInvalidSymbols?: boolean
  ignoreCache?: boolean
  runtimeCache?: Map<string, CacheEntry[]>
  getRuntimeCacheKey?: (params: {
    fiatTicker: string
    assetTicker: string
    granularity: Granularity
  }) => string
}) {
  const specificTimestamp = timestamp ? dayjs(timestamp).utc().startOf(granularity).valueOf() : null

  const requestTimestamp =
    specificTimestamp ||
    dayjs.utc(getCurrentTime()).subtract(1, granularity).startOf(granularity).valueOf()

  const historicalPricesMap = new Map<string, Map<number, PriceData>>()
  const fetchedPricesMap = new Map<string, Map<number, PriceData>>()

  const tickerSymbols = Array.isArray(assetTickers) ? assetTickers : [assetTickers]

  if (tickerSymbols.length === 0) {
    return {
      historicalPricesMap,
      fetchedPricesMap,
    }
  }

  const instructions = await Promise.all(
    tickerSymbols.map((tickerSymbol) =>
      prepareFetchInstructions({
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
      })
    )
  )

  const assetTickersToFetch: {
    tickerSymbol: string
    limit: number
    lastCachedItem?: PriceData
  }[] = []
  instructions.forEach(({ history, limit, lastCachedItem, tickerSymbol }) => {
    historicalPricesMap.set(tickerSymbol, history)
    if (limit) {
      assetTickersToFetch.push({ tickerSymbol, limit, lastCachedItem })
    }
  })

  await fetchAndProcessTickers({
    assetTickersToFetch,
    api,
    fiatTicker,
    granularity,
    timestamp,
    ignoreInvalidSymbols,
    historicalPricesMap,
    fetchedPricesMap,
    specificTimestamp,
    requestLimit,
  })

  for (const tickerSymbol of tickerSymbols) {
    const runtimeCacheKey = getRuntimeCacheKey({
      fiatTicker,
      assetTicker: tickerSymbol,
      granularity,
    })
    const history = historicalPricesMap.get(tickerSymbol)
    if (
      history &&
      history.size > 0 &&
      (fetchedPricesMap.has(tickerSymbol) || !runtimeCache.has(runtimeCacheKey))
    ) {
      runtimeCache.set(runtimeCacheKey, mapToArray(history))
    }
  }

  return {
    historicalPricesMap,
    fetchedPricesMap,
  }
}
