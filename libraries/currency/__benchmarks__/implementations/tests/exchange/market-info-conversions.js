export default (currencyModule, marketInfoNumbers) => {
  const conversionByRate = currencyModule.module.conversionByRate
  const assets = currencyModule.assets

  let market = {}
  Object.keys(marketInfoNumbers).forEach((fromCoin) => {
    Object.keys(marketInfoNumbers[fromCoin]).forEach((toCoin) => {
      if (!market[fromCoin]) market[fromCoin] = {}
      let info = marketInfoNumbers[fromCoin][toCoin]
      function convert(numberUnit, opts = { inclMinerFee: true }) {
        let conversionFn = conversionByRate(assets[fromCoin], assets[toCoin], info.rate)

        let minerFee = opts.inclMinerFee ? info.minerFee : info.minerFee.unitType.ZERO

        // from = 'bitcoin', to = 'litecoin'; entering BTC, want LTC
        let result
        if (numberUnit.unitType.equals(assets[fromCoin])) {
          result = conversionFn(numberUnit).sub(minerFee)
          // from = 'bitcoin', to = 'litecoin'; entering LTC, want BTC
        } else if (numberUnit.unitType.equals(assets[toCoin])) {
          result = conversionFn(numberUnit.add(minerFee))
          // When estimating conversions for XYZ > NEO, overestimate fromAmount slightly to ensure it
          // doesn't dip below the threshold, shorting the customer of their NEO
          if (['neo', 'ontology'].includes(toCoin)) result = result.mul(1.0005)
        }

        // only 8 decimals after point
        result = result
          .toBase()
          .round()
          .toDefault()
          .toFixed(8)

        // set to zero, but retain unit
        if (result.isNegative) result = result.unitType.ZERO.to(result.unit)

        return result
      }

      market[fromCoin][toCoin] = convert
    })
  })

  return market
}
