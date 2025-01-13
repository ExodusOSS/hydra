const isValid = (value) => value !== 0 && Number.isFinite(value)

const findInvalidPrice = (data, lastCachedItem) =>
  data.find((item, index) => {
    if (!Number.isFinite(item.close) || !Number.isFinite(item.open)) return true

    if (lastCachedItem && isValid(lastCachedItem.close) && index === 0) {
      // check first item has value. It must, because we have cache for previous period.
      return !isValid(item.close)
    }

    if (index > 0) {
      const prevItem = data[index - 1]
      // check if price is zero but previous wasn't
      if (!isValid(item.close) && isValid(prevItem.close)) return true
      if (!isValid(item.open) && isValid(prevItem.open)) return true
    }
  })

module.exports = findInvalidPrice
