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

export const mapToArray = (map) => {
  // eslint-disable-next-line unicorn/no-new-array -- new Array(n) is O(1) vs Array.from which is O(n); see https://jsperf.app/cixame/2
  const arr = new Array(map.size)
  let i = 0
  for (const entry of map) {
    arr[i++] = entry
  }

  return arr
}

export const parseGranularity = (granularity) => {
  switch (granularity) {
    case 'day':
      return 'daily'
    case 'hour':
      return 'hourly'
    case 'minute':
      return 'minutely'
    default:
      return granularity
  }
}
