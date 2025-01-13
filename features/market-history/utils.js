const assetFromTickerCache = Object.create(null)
export const getAssetFromTicker = (assets, ticker) => {
  if (assetFromTickerCache[ticker]) return assetFromTickerCache[ticker]
  return Object.values(assets).find((asset) => {
    if (asset.ticker === ticker) {
      assetFromTickerCache[ticker] = asset
      return true
    }

    return false
  })
}

export const parseGranularity = (granularity) => {
  switch (granularity) {
    case 'day':
      return 'daily'
    case 'hour':
      return 'hourly'
    default:
      return granularity
  }
}
