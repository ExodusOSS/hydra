const createAvailableAssetsApi = ({ availableAssetNamesAtom }) => ({
  availableAssets: {
    get: async () => availableAssetNamesAtom.get(),
  },
})

const availableAssetsApiDefinition = {
  id: 'availableAssetsApi',
  type: 'api',
  factory: createAvailableAssetsApi,
  dependencies: ['availableAssetNamesAtom'],
}

export default availableAssetsApiDefinition
