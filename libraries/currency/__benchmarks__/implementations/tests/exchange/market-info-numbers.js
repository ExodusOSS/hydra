export default (assets, marketInfo) => {
  let market = {}
  Object.keys(marketInfo).forEach((fromCoin) => {
    Object.keys(marketInfo[fromCoin]).forEach((toCoin) => {
      if (!market[fromCoin]) market[fromCoin] = {}
      let info = cleanNumbers(marketInfo[fromCoin][toCoin])

      let newInfo = {
        ...info,
        // no point benchmarking over a 0 value for rate
        rate: info.rate || Math.random() + 0.1, // although this can be removed because of the ...info, the explicitness of specifying it is good for clarity
        minerFee: assets[toCoin].defaultUnit(info.minerFee),
        limit: assets[fromCoin].defaultUnit(info.limit),
        maxLimit: assets[fromCoin].defaultUnit(info.maxLimit),
        // shapeshift.marketInfo() with no params returns 'min' instead of 'minimum'
        minimum: assets[fromCoin].defaultUnit(info.minimum),
      }

      // if 'min' is present
      delete newInfo.min

      market[fromCoin][toCoin] = newInfo
    })
  })

  return market
}

// => convert strings to numbers, and NaNs to 0's.
function cleanNumbers(info = {}) {
  // hack to chop off sig figs since BigNumber can only handle 15 (wtf)
  // it's okay to do this since this should only be used for limits
  // the net effect in doing this is that the limit is lowered slightly
  const cleanFloatForLimit = (num) => parseFloat((parseFloat(num) || 0).toPrecision(14))

  let newInfo = { ...info }
  newInfo.rate = parseFloat(newInfo.rate) || 0
  newInfo.minerFee = parseFloat(newInfo.minerFee) || 0
  newInfo.limit = cleanFloatForLimit(info.limit)
  newInfo.maxLimit = cleanFloatForLimit(info.maxLimit)
  // shapeshift.marketInfo() with no params returns 'min' instead of 'minimum'
  // info.min = parseFloat(newInfo.min) || 0
  info.minimum = parseFloat(newInfo.minimum) || 0 || (parseFloat(newInfo.min) || 0)

  return { ...info, ...newInfo }
}

/*
  what the info looks like:

  {
    "rate": "50.00775138",
    "limit": 2.30675843,
    "pair": "BTC_ETH",
    "maxLimit": 2.72318401,
    "min": 0.00039848,
    "minerFee": 0.01
  },

  Note how 'rate' is a type `string` but the rest are of type `Number`? Also can receive NaN or "NaN" from time to time.

*/
