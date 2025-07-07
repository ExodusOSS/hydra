import memoizeGetPrices from './helpers/memoize-get-price.js'

const resultFunction = (getAssetMinutelyPrices, rates, assets, startOfMinuteTime) =>
  memoizeGetPrices(getAssetMinutelyPrices, rates, 'minutely', assets, startOfMinuteTime)

const getMinutelyPriceSelector = {
  id: 'getMinutelyPrice',
  resultFunction,
  dependencies: [
    //
    { selector: 'getAssetMinutelyPrices' },
    { selector: 'fiatRates', module: 'rates' },
    { module: 'assets', selector: 'all' },
    { selector: 'startOfMinute', module: 'time' },
  ],
}

export default getMinutelyPriceSelector
