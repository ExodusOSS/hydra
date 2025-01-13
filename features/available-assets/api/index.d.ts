declare const assetsApiDefinition: {
  id: 'availableAssetsApi'
  type: 'api'
  factory(): {
    availableAssets: {
      get(): Promise<string[]>
    }
  }
}

export default assetsApiDefinition
