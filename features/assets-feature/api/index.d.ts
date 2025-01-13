type Asset = any

export enum TokenStatus {
  CURATED = 'c',
  DISABLED = 'd',
  UNVERIFIED = 'u',
  VERIFIED = 'v',
}

declare const assetsApiDefinition: {
  id: 'assetsApi'
  type: 'api'
  factory(): {
    assetPreferences: {
      enableMultiAddressMode(params: { assetNames: string[] }): Promise<void>
      disableMultiAddressMode(params: { assetNames: string[] }): Promise<void>
      disablePurpose(params: { assetName: string; purpose: number }): Promise<void>
      enablePurpose(params: { assetName: string; purpose: number }): Promise<void>
    }
    assets: {
      fetchToken(assetId: string, baseAssetName: string): Asset
      searchTokens(params: {
        baseAssetName?: string | string[]
        lifecycleStatus?: TokenStatus[]
        query?: string
        excludeTags?: string[]
      })
      updateTokens(): Promise<void>
      addTokens(params: {
        assetIds: string[]
        baseAssetName: string
        allowedStatusList?: TokenStatus[]
      }): string
      getAsset(assetName: string): Promise<Asset>
      getAssets(): Promise<{ [assetName: string]: Asset }>
    }
  }
}

export default assetsApiDefinition
