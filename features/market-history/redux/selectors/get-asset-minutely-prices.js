const resultFunction = (prices) => (assetName) => prices[assetName]

const getAssetMinutelyPricesSelector = {
  id: 'getAssetMinutelyPrices',
  resultFunction,
  dependencies: [
    //
    { selector: 'minutelyPrices' },
  ],
}

export default getAssetMinutelyPricesSelector
