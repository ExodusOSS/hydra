import memoizeGetPrices from './helpers/memoize-get-price.js'

const resultFunction = (getAssetHourlyPrices, rates, getAsset, startOfHourTime) =>
  memoizeGetPrices(getAssetHourlyPrices, rates, 'hourly', getAsset, startOfHourTime)

const getHourlyPriceSelector = {
  id: 'getHourlyPrice',
  resultFunction,
  dependencies: [
    //
    { selector: 'getAssetHourlyPrices' },
    { selector: 'fiatRates', module: 'rates' },
    { module: 'assets', selector: 'getAsset' },
    { selector: 'startOfHour', module: 'time' },
  ],
}

export default getHourlyPriceSelector
