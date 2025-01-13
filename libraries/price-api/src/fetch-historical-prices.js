// @flow
import findInvalidPrice from './find-invalid-price'
import type { HistoryType, OptionsType, RuntimeCacheType } from './types'
import getLimit from './get-limit-to-fetch'
import tryToGetCache from './try-to-load-cache'
import dayjs from './dayjs'
import { LIMIT } from './constants'
import cropHistory from './crop-history'

const runtimeCacheDefault: RuntimeCacheType = new Map()
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
}: OptionsType): Promise<Map<string, HistoryType>> {
  const specificTimestamp = timestamp
    ? dayjs(timestamp)
        .utc()
        .startOf(granularity)
        .valueOf()
    : null

  const requestTimestamp =
    specificTimestamp ||
    dayjs
      .utc(getCurrentTime())
      .subtract(1, granularity)
      .startOf(granularity)
      .valueOf()

  const historicalPricesMap = new Map()
  const fetchedPricesMap = new Map()
  const assetTickersToFetch = []

  const tickerSymbols = Array.isArray(assetTickers) ? assetTickers : [assetTickers]

  for (const tickerSymbol of tickerSymbols) {
    const runtimeCacheKey = getRuntimeCacheKey({
      fiatTicker,
      assetTicker: tickerSymbol,
      granularity,
    })
    const history: HistoryType = await tryToGetCache({
      runtimeCacheKey,
      runtimeCache,
      getCacheFromStorage: () => getCacheFromStorage(tickerSymbol),
    })

    historicalPricesMap.set(tickerSymbol, history)

    if (specificTimestamp && history.get(specificTimestamp)) {
      continue
    }

    const limit = getLimit({
      granularity,
      history: !ignoreCache ? history : new Map(),
      requestLimit,
      requestTimestamp,
      specificTimestamp,
    })

    if (limit <= 0) {
      continue
    }

    const lastCachedTime = [...history.keys()].sort().pop()
    const lastCachedItem = history.get(lastCachedTime)

    // Could not find data in cache. Needs to be fetched
    assetTickersToFetch.push({ tickerSymbol, limit, lastCachedItem })
  }

  if (assetTickersToFetch.length > 0) {
    const maxLimit = Math.max(...assetTickersToFetch.map(({ limit }) => limit))

    const requests = [
      assetTickersToFetch.filter(({ limit }) => limit !== maxLimit),
      assetTickersToFetch.filter(({ limit }) => limit === maxLimit),
    ]

    await Promise.all(
      requests
        .filter((tickers) => tickers.length > 0)
        .map(async (currentTickersToFetch) => {
          const limit = Math.max(...currentTickersToFetch.map(({ limit }) => limit))
          const requestParams = {
            assets: currentTickersToFetch.map((item) => item.tickerSymbol),
            fiatArray: [fiatTicker],
            granularity: granularity,
            limit,
            timestamp: requestTimestamp / 1000,
            ignoreInvalidSymbols: ignoreInvalidSymbols,
          }

          const fetchedPrices = await api(requestParams)

          Object.keys(fetchedPrices).forEach((assetTicker) => {
            if (assetTicker === 'requestErrors') {
              const errors = fetchedPrices[assetTicker]
              Object.keys(errors).forEach((key) => {
                if (key !== 'invalidCryptoSymbols' || !ignoreInvalidSymbols) {
                  console.warn(`pricing-server: ${key}: `, errors[key])
                }
              })
              return
            }
            const newData = fetchedPrices[assetTicker][fiatTicker]
            const { lastCachedItem } =
              assetTickersToFetch.find(({ tickerSymbol }) => tickerSymbol === assetTicker) || {}
            const wrongDataItem = findInvalidPrice(newData, lastCachedItem)

            if (wrongDataItem) {
              const date = new Date(wrongDataItem.time * 1000)
              console.warn(
                `pricing-server: invalid ${assetTicker} price for ${date.toISOString()}: ${JSON.stringify(
                  wrongDataItem
                )}`
              )
              return
            }

            const filteredData = newData
              .filter((piece) => piece.close !== 0)
              .map((piece) => ({ time: piece.time, close: piece.close }))

            let history = historicalPricesMap.get(assetTicker) || new Map()

            for (let price of filteredData) {
              history.set(price.time * 1000, { close: price.close })
            }

            if (
              granularity === 'hour' &&
              !specificTimestamp &&
              filteredData.length > 0 &&
              requestLimit
            ) {
              history = cropHistory({ history, hourlyLimit: requestLimit || LIMIT[granularity] })
            }

            fetchedPricesMap.set(assetTicker, history)
            historicalPricesMap.set(assetTicker, history)
          })
        })
    )
  }

  for (const tickerSymbol of tickerSymbols) {
    const runtimeCacheKey = getRuntimeCacheKey({
      fiatTicker,
      assetTicker: tickerSymbol,
      granularity,
    })
    const history = historicalPricesMap.get(tickerSymbol)
    if (history && history.size !== 0) {
      runtimeCache.set(runtimeCacheKey, [...history])
    }
  }

  return {
    historicalPricesMap,
    fetchedPricesMap,
  }
}
