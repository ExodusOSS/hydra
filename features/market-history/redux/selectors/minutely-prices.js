const DEFAULT = Object.create(null)
const resultFunction = (fiatMarketHistory) => fiatMarketHistory?.minutely ?? DEFAULT

const minutelyPricesSelector = {
  id: 'minutelyPrices',
  resultFunction,
  dependencies: [
    //
    { selector: 'fiatMarketHistory' },
  ],
}

export default minutelyPricesSelector
