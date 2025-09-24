const createAssetsApi = ({ assetPreferences, assetsModule }) => {
  return {
    assetPreferences: {
      enableMultiAddressMode: assetPreferences.enableMultiAddressMode,
      disableMultiAddressMode: assetPreferences.disableMultiAddressMode,
      enableLegacyAddressMode: assetPreferences.enableLegacyAddressMode,
      disableLegacyAddressMode: assetPreferences.disableLegacyAddressMode,
      enableTaprootAddressMode: assetPreferences.enableTaprootAddressMode,
      disableTaprootAddressMode: assetPreferences.disableTaprootAddressMode,
      disablePurpose: assetPreferences.disablePurpose,
      enablePurpose: assetPreferences.enablePurpose,
    },
    assets: {
      fetchToken: (...args) => assetsModule.fetchToken(...args),
      fetchTokens: (...args) => assetsModule.fetchTokens(...args),
      searchTokens: (...args) => assetsModule.searchTokens(...args),
      updateTokens: (...args) => assetsModule.updateTokens(...args),
      addTokens: (...args) => assetsModule.addTokens(...args),
      getAsset: (assetName) => assetsModule.getAsset(assetName),
      getAssets: () => assetsModule.getAssets(),
      getIcon: (assetName) => assetsModule.getIcon(assetName),
    },
  }
}

const assetsApiDefinition = {
  id: 'assetsApi',
  type: 'api',
  factory: createAssetsApi,
  dependencies: ['assetPreferences', 'assetsModule'],
}

export default assetsApiDefinition
