const getFiatValueWithFallbackSelector = {
  id: 'getFiatValueWithFallback',
  resultFunction: (getPriceWithFallback) => {
    return ({ assetName, time, type, amount }) => {
      if (!amount) return 0
      const price = getPriceWithFallback(assetName, time, type)
      if (!price) return 0
      return price * amount
    }
  },
  dependencies: [
    //
    { selector: 'getPriceWithFallback' },
  ],
}

export default getFiatValueWithFallbackSelector
