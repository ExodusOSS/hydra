import memoizeGetPrices from './helpers/memoize-get-price.js'

const resultFunction = (getAssetHourlyPrices, rates, assets, startOfHourTime) =>
  memoizeGetPrices(getAssetHourlyPrices, rates, 'hourly', assets, startOfHourTime)

const getHourlyPriceSelector = {
  id: 'getHourlyPrice',
  resultFunction,
  dependencies: [
    //
    { selector: 'getAssetHourlyPrices' },
    { selector: 'fiatRates', module: 'rates' },
    { module: 'assets', selector: 'all' },
    { selector: 'startOfHour', module: 'time' },
  ],
}

export default getHourlyPriceSelector
