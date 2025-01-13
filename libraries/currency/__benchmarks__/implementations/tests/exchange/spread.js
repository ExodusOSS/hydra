export default (assets, marketInfoConversions) => {
  const assetsKeys = Object.keys(marketInfoConversions)
  for (const fromCoin of assetsKeys) {
    for (const toCoin of assetsKeys) {
      if (!marketInfoConversions[fromCoin][toCoin]) continue

      const conversion = marketInfoConversions[fromCoin][toCoin]

      conversion(assets[fromCoin].defaultUnit(1))
      conversion(assets[toCoin].defaultUnit(1))
    }
  }
}
