import type { PriceData } from '../types.js'

const lastTimestampFromPricesMap = (history: Map<number, PriceData>): number | null => {
  if (history.size === 0) return null

  let max: number | null = null
  for (const key of history.keys()) {
    if (max === null || key > max) max = key
  }

  return max
}

export default lastTimestampFromPricesMap
