import processApiResponse from './process-api-response.js'

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
}) {
  if (assetTickersToFetch.length === 0) {
    return
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
        const requestParams = Object.create(null)
        requestParams.assets = currentTickersToFetch.map((item) => item.tickerSymbol)
        requestParams.fiatArray = [fiatTicker]
        requestParams.granularity = granularity
        requestParams.limit = limit
        requestParams.timestamp = timestamp
        requestParams.ignoreInvalidSymbols = ignoreInvalidSymbols

        const fetchedPrices = await api(requestParams)

        Object.keys(fetchedPrices).forEach((assetTicker) => {
          const newHistory = processApiResponse({
            assetTicker,
            fiatTicker,
            fetchedPrices,
            assetTickersToFetch,
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
