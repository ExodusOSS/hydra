const getIsEnabledSelector = {
  id: 'getIsEnabled',
  resultFunction: (enabledAssets) => (assetName) => !!enabledAssets[assetName],
  dependencies: [{ selector: 'data' }],
}

export default getIsEnabledSelector
