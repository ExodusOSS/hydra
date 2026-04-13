import memoizeGetPrices from './helpers/memoize-get-price.js'

const resultFunction = (getAssetDailyPrices, rates, getAsset, startOfHourTime) =>
  memoizeGetPrices(getAssetDailyPrices, rates, 'daily', getAsset, startOfHourTime)

const getDailyPriceSelector = {
  id: 'getDailyPrice',
  resultFunction,
  dependencies: [
    //
    { selector: 'getAssetDailyPrices' },
    { selector: 'fiatRates', module: 'rates' },
    { module: 'assets', selector: 'getAsset' },
    { selector: 'startOfHour', module: 'time' },
  ],
}

export default getDailyPriceSelector
