const DEFAULT = Object.create(null)
const resultFunction = (marketHistory, fiat) =>
  marketHistory?.[fiat.defaultUnit.unitName] ?? DEFAULT

const fiatMarketHistorySelector = {
  id: 'fiatMarketHistory',
  resultFunction,
  dependencies: [
    //
    { selector: 'data' },
    { module: 'locale', selector: 'currencyUnitType' },
  ],
}

export default fiatMarketHistorySelector
