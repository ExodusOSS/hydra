import dayjs from '@exodus/dayjs'
import prepareFetchInstructions from './prepare-fetch-instructions.js'
import fetchAndProcessTickers from './fetch-and-process-tickers.js'

const runtimeCacheDefault = new Map()
const getRuntimeCacheKeyDefault = ({ fiatTicker, assetTicker, granularity }) =>
  `${assetTicker}_${fiatTicker}_${granularity}`

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
}) {
  const specificTimestamp = timestamp ? dayjs(timestamp).utc().startOf(granularity).valueOf() : null

  const requestTimestamp =
    specificTimestamp ||
    dayjs.utc(getCurrentTime()).subtract(1, granularity).startOf(granularity).valueOf()

  const historicalPricesMap = new Map()
  const fetchedPricesMap = new Map()

  const tickerSymbols = Array.isArray(assetTickers) ? assetTickers : [assetTickers]

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

  const assetTickersToFetch = []
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
    if (history && history.size > 0) {
      runtimeCache.set(runtimeCacheKey, [...history])
    }
  }

  return {
    historicalPricesMap,
    fetchedPricesMap,
  }
}
