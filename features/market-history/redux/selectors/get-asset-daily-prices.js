const resultFunction = (dailyPrices) => (assetName) => dailyPrices[assetName]

const getAssetDailyPricesSelector = {
  id: 'getAssetDailyPrices',
  resultFunction,
  dependencies: [
    //
    { selector: 'dailyPrices' },
  ],
}

export default getAssetDailyPricesSelector
