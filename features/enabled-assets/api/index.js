const enabledAssetsApi = ({ enabledAssets }) => ({
  assets: {
    enable: enabledAssets.enable,
    disable: enabledAssets.disable,
    addAndEnableToken: enabledAssets.addAndEnableToken,
  },
})

const enabledAssetsApiDefinition = {
  id: 'enabledAssetsApi',
  type: 'api',
  factory: enabledAssetsApi,
  dependencies: ['enabledAssets'],
}

export default enabledAssetsApiDefinition
