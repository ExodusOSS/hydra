import memoizeGetPrices from './helpers/memoize-get-price.js'

const resultFunction = (getAssetDailyPrices, rates, assets, startOfHourTime) =>
  memoizeGetPrices(getAssetDailyPrices, rates, 'daily', assets, startOfHourTime)

const getDailyPriceSelector = {
  id: 'getDailyPrice',
  resultFunction,
  dependencies: [
    //
    { selector: 'getAssetDailyPrices' },
    { selector: 'fiatRates', module: 'rates' },
    { module: 'assets', selector: 'all' },
    { selector: 'startOfHour', module: 'time' },
  ],
}

export default getDailyPriceSelector
