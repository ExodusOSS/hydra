import ms from 'ms'
import lastTimestampFromPricesMap from './last-timestamp-from-prices-map.js'

const hourMs = ms('1h')

const cropHistory = ({ history, hourlyLimit }) => {
  const lastCachedTime = lastTimestampFromPricesMap(history)
  if (!lastCachedTime) return history
  const limitedTime = lastCachedTime - hourMs * hourlyLimit
  return new Map([...history].filter(([key]) => key > limitedTime))
}

export default cropHistory
