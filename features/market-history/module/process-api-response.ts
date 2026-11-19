import type { Granularity, HistoricalPriceResponse, PriceData } from '../types.js'

import cropHistory from './crop-history.js'
import findInvalidPrice from './find-invalid-price.js'

export default function processApiResponse({
  assetTicker,
  fiatTicker,
  fetchedPrices,
  lastCachedItemByTicker,
  ignoreInvalidSymbols,
  historicalPricesMap,
  granularity,
  specificTimestamp,
  requestLimit,
}: {
  assetTicker: string
  fiatTicker: string
  fetchedPrices: HistoricalPriceResponse
  lastCachedItemByTicker: Map<string, PriceData | undefined>
  ignoreInvalidSymbols: boolean
  historicalPricesMap: Map<string, Map<number, PriceData>>
  granularity: Granularity
  specificTimestamp?: number | null
  requestLimit: number
}): Map<number, PriceData> | null {
  if (assetTicker === 'requestErrors') {
    const errors = (fetchedPrices as HistoricalPriceResponse).requestErrors
    if (errors) {
      Object.keys(errors).forEach((key) => {
        if (key !== 'invalidCryptoSymbols' || !ignoreInvalidSymbols) {
          console.warn(`pricing-server: ${key}: `, errors[key])
        }
      })
    }

    return null
  }

  const newData = fetchedPrices[assetTicker]![fiatTicker]!
  const lastCachedItem = lastCachedItemByTicker.get(assetTicker)
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

  let history = historicalPricesMap.get(assetTicker) || new Map<number, PriceData>()
  let added = 0

  for (const piece of newData) {
    if (piece.close !== 0) {
      history.set(piece.time * 1000, { close: piece.close })
      added++
    }
  }

  if (
    (granularity === 'hour' || granularity === 'minute') &&
    !specificTimestamp &&
    added > 0 &&
    requestLimit
  ) {
    history = cropHistory({ history, limit: requestLimit, step: granularity })
  }

  return history
}
