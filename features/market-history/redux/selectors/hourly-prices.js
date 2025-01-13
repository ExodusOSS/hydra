const DEFAULT = Object.create(null)
const resultFunction = (fiatMarketHistory) => fiatMarketHistory?.hourly ?? DEFAULT

const hourlyPricesSelector = {
  id: 'hourlyPrices',
  resultFunction,
  dependencies: [
    //
    { selector: 'fiatMarketHistory' },
  ],
}

export default hourlyPricesSelector
