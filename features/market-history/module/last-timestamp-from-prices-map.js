const lastTimestampFromPricesMap = (history) => {
  if (history.size === 0) return null

  let max = null
  for (const key of history.keys()) {
    if (max === null || key > max) max = key
  }

  return max
}

export default lastTimestampFromPricesMap
