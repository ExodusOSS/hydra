declare const enabledAssetsApiDefinition: {
  id: 'enabledAssetsApi'
  type: 'api'
  factory(): {
    assets: {
      enable(assetNames: string[], opts?: { unlessDisabled?: boolean }): Promise<void>
      disable(assetNames: string[]): Promise<void>
      addAndEnableToken(assetId: string, baseAssetName: string): Promise<string>
    }
  }
}

export default enabledAssetsApiDefinition
