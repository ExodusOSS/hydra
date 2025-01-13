import lodash from 'lodash'

export default (currencyModule) => {
  const conversion = currencyModule.module.conversion
  const assets = currencyModule.assets

  const fiatCurrency = assets.dollar

  // eslint-disable-next-line @exodus/basic-utils/prefer-basic-utils
  return lodash.mapValues(assets, (asset, assetName) => {
    const marketValue = Math.random() // no real fiat prices - doesn't matter
    const fiat = marketValue ? fiatCurrency.defaultUnit(marketValue) : fiatCurrency.ZERO
    const convFn = conversion(asset.defaultUnit(1), fiat)
    return (numberUnit) => {
      if (fiat.isZero) {
        return numberUnit.unitType.equals(fiatCurrency) ? asset.ZERO : fiatCurrency.ZERO
      }

      return convFn(numberUnit)
    }
  })
}
