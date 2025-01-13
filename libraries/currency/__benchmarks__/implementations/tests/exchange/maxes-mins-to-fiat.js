export default (marketInfoNumbers, fiatConversions) => {
  const assetsKeys = Object.keys(marketInfoNumbers)
  for (const fromCoin of assetsKeys) {
    // currency and conversion function
    const fiatConvFn = fiatConversions[fromCoin]

    for (const toCoin of assetsKeys) {
      if (!marketInfoNumbers[fromCoin][toCoin]) continue

      const { limit, minimum } = marketInfoNumbers[fromCoin][toCoin]
      const limitFiat = fiatConvFn(limit)
      const minimumFiat = fiatConvFn(minimum)

      fiatConvFn(limitFiat)
      fiatConvFn(minimumFiat)
    }
  }
}
