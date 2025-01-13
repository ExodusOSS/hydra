const DEFAULT = Object.create(null)
const resultFunction = (fiatMarketHistory) => fiatMarketHistory?.daily ?? DEFAULT

const dailyPricesSelector = {
  id: 'dailyPrices',
  resultFunction,
  dependencies: [
    //
    { selector: 'fiatMarketHistory' },
  ],
}

export default dailyPricesSelector
