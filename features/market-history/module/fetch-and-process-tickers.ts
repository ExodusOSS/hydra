import type { FetchApiFunction, Granularity, HistoricalPriceParams, PriceData } from '../types.js'

import processApiResponse from './process-api-response.js'

type TickerToFetch = {
  tickerSymbol: string
  limit: number
  lastCachedItem?: PriceData
}

export default async function fetchAndProcessTickers({
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
}: {
  assetTickersToFetch: TickerToFetch[]
  api: FetchApiFunction
  fiatTicker: string
  granularity: Granularity
  timestamp?: number
  ignoreInvalidSymbols: boolean
  historicalPricesMap: Map<string, Map<number, PriceData>>
  fetchedPricesMap: Map<string, Map<number, PriceData>>
  specificTimestamp?: number | null
  requestLimit: number
}): Promise<void> {
  if (assetTickersToFetch.length === 0) {
    return
  }

  const lastCachedItemByTicker = new Map<string, PriceData | undefined>()
  for (const { tickerSymbol, lastCachedItem } of assetTickersToFetch) {
    lastCachedItemByTicker.set(tickerSymbol, lastCachedItem)
  }

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
        const requestParams: HistoricalPriceParams = {
          assets: currentTickersToFetch.map((item) => item.tickerSymbol),
          fiatArray: [fiatTicker],
          granularity,
          limit,
          timestamp,
          ignoreInvalidSymbols,
        }

        const fetchedPrices = await api(requestParams)

        Object.keys(fetchedPrices).forEach((assetTicker) => {
          const newHistory = processApiResponse({
            assetTicker,
            fiatTicker,
            fetchedPrices,
            lastCachedItemByTicker,
            ignoreInvalidSymbols,
            historicalPricesMap,
            granularity,
            specificTimestamp,
            requestLimit,
          })

          if (newHistory) {
            fetchedPricesMap.set(assetTicker, newHistory)
            historicalPricesMap.set(assetTicker, newHistory)
          }
        })
      })
  )
}
