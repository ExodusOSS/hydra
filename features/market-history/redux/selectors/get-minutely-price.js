import memoizeGetPrices from './helpers/memoize-get-price.js'

const resultFunction = (getAssetMinutelyPrices, rates, getAsset, startOfMinuteTime) =>
  memoizeGetPrices(getAssetMinutelyPrices, rates, 'minutely', getAsset, startOfMinuteTime)

const getMinutelyPriceSelector = {
  id: 'getMinutelyPrice',
  resultFunction,
  dependencies: [
    //
    { selector: 'getAssetMinutelyPrices' },
    { selector: 'fiatRates', module: 'rates' },
    { module: 'assets', selector: 'getAsset' },
    { selector: 'startOfMinute', module: 'time' },
  ],
}

export default getMinutelyPriceSelector
