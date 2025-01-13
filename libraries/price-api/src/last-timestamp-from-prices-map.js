const lastTimestampFromPricesMap = (history) =>
  history.size === 0 ? null : Math.max(...history.keys())

export default lastTimestampFromPricesMap
