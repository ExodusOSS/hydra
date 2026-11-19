import type { Asset, Granularity, PriceTimeType } from './types.js'

const assetFromTickerCache: Record<string, Asset> = Object.create(null)
export const getAssetFromTicker = (assets: Record<string, Asset>, ticker: string): Asset => {
  if (assetFromTickerCache[ticker]) return assetFromTickerCache[ticker]
  return Object.values(assets).find((asset) => {
    if (asset.ticker === ticker) {
      assetFromTickerCache[ticker] = asset
      return true
    }

    return false
  })!
}

export const mapToArray = <K, V>(map: Map<K, V>): [K, V][] => {
  // oxlint-disable-next-line unicorn/no-new-array -- new Array(n) is O(1) vs Array.from which is O(n); see https://jsperf.app/cixame/2
  const arr: [K, V][] = new Array(map.size)
  let i = 0
  for (const entry of map) {
    arr[i++] = entry
  }

  return arr
}

export const parseGranularity = (granularity: Granularity): PriceTimeType => {
  switch (granularity) {
    case 'day':
      return 'daily'
    case 'hour':
      return 'hourly'
    case 'minute':
      return 'minutely'
    default:
      throw new Error(`Unknown granularity: ${granularity as string}`)
  }
}
