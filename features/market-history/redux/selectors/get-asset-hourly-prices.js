const resultFunction = (prices) => (assetName) => prices[assetName]

const getAssetHourlyPricesSelector = {
  id: 'getAssetHourlyPrices',
  resultFunction,
  dependencies: [
    //
    { selector: 'hourlyPrices' },
  ],
}

export default getAssetHourlyPricesSelector
