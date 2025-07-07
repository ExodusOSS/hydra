import findInvalidPrice from './find-invalid-price.js'
import cropHistory from './crop-history.js'

export default function processApiResponse({
  assetTicker,
  fiatTicker,
  fetchedPrices,
  assetTickersToFetch,
  ignoreInvalidSymbols,
  historicalPricesMap,
  granularity,
  specificTimestamp,
  requestLimit,
}) {
  if (assetTicker === 'requestErrors') {
    const errors = fetchedPrices[assetTicker]
    Object.keys(errors).forEach((key) => {
      if (key !== 'invalidCryptoSymbols' || !ignoreInvalidSymbols) {
        console.warn(`pricing-server: ${key}: `, errors[key])
      }
    })
    return null
  }

  const newData = fetchedPrices[assetTicker][fiatTicker]
  const { lastCachedItem } =
    assetTickersToFetch.find(({ tickerSymbol }) => tickerSymbol === assetTicker) ||
    Object.create(null)
  const wrongDataItem = findInvalidPrice(newData, lastCachedItem)

  if (wrongDataItem) {
    const date = new Date(wrongDataItem.time * 1000)
    console.warn(
      `pricing-server: invalid ${assetTicker} price for ${date.toISOString()}: ${JSON.stringify(
        wrongDataItem
      )}`
    )
    return null
  }

  const filteredData = newData
    .filter((piece) => piece.close !== 0)
    .map((piece) => ({ time: piece.time, close: piece.close }))

  let history = historicalPricesMap.get(assetTicker) || new Map()

  for (const price of filteredData) {
    history.set(price.time * 1000, { close: price.close })
  }

  if (granularity === 'hour' && !specificTimestamp && filteredData.length > 0 && requestLimit) {
    history = cropHistory({ history, hourlyLimit: requestLimit })
  }

  return history
}
