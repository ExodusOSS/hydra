import ms from 'ms'
import lastTimestampFromPricesMap from './last-timestamp-from-prices-map.js'

const hourMs = ms('1h')

const cropHistory = ({ history, hourlyLimit }) => {
  const lastCachedTime = lastTimestampFromPricesMap(history)
  if (!lastCachedTime) return history
  const limitedTime = lastCachedTime - hourMs * hourlyLimit
  const result = new Map()
  for (const [key, value] of history.entries()) {
    if (key > limitedTime) {
      result.set(key, value)
    }
  }

  return result
}

export default cropHistory
