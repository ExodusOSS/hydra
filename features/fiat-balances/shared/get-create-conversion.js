import { conversionByRate } from '@exodus/currency'

export const getCreateConversion = (fiatCurrency, rates) => (asset) => {
  let fiatRate
  // HACK: Super hacky, terrible, the rates state object should have the prices split up by sub-objects per fiat
  if (fiatCurrency.defaultUnit.unitName === 'USD') {
    fiatRate = rates?.[asset.ticker]?.priceUSD || 0
  } else {
    fiatRate = rates?.[asset.ticker]?.price || 0
  }

  return conversionByRate(asset.currency, fiatCurrency, fiatRate)
}
