import ms from 'ms'

import type { PriceData } from '../types.js'

import lastTimestampFromPricesMap from './last-timestamp-from-prices-map.js'

type CropStep = 'hour' | 'minute'

const STEP_MS = {
  hour: ms('1h'),
  minute: ms('1m'),
} as const satisfies Record<CropStep, number>

const cropHistory = ({
  history,
  limit,
  step,
}: {
  history: Map<number, PriceData>
  limit: number
  step: CropStep
}): Map<number, PriceData> => {
  const stepMs = STEP_MS[step]
  const lastCachedTime = lastTimestampFromPricesMap(history)
  if (!lastCachedTime) return history
  const limitedTime = lastCachedTime - stepMs * limit
  const result = new Map<number, PriceData>()
  for (const [key, value] of history.entries()) {
    if (key > limitedTime) {
      result.set(key, value)
    }
  }

  return result
}

export default cropHistory
