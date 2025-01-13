const assetLoadingResultFunc = (prices) => {
  const hasPrices = prices && Object.keys(prices).length > 0
  return !hasPrices
}

export default assetLoadingResultFunc
