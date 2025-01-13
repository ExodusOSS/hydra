const createIsEnabledSelector = {
  id: 'createIsEnabled',
  selectorFactory: (enabledAssetsSelector) => (assetName) => (state) =>
    !!enabledAssetsSelector(state)[assetName],
  dependencies: [{ selector: 'data' }],
}

export default createIsEnabledSelector
