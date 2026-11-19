type Asset = any

export const TokenStatus = {
  CURATED: 'c',
  DISABLED: 'd',
  UNVERIFIED: 'u',
  VERIFIED: 'v',
} as const

export type TokenStatus = (typeof TokenStatus)[keyof typeof TokenStatus]

Object.setPrototypeOf(TokenStatus, null)

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
      fetchTokens(assetDescriptors: { assetId: string; baseAssetName: string }[]): Promise<Asset[]>
      searchTokens(params: {
        baseAssetName?: string | string[]
        lifecycleStatus?: TokenStatus[]
        query?: string
        tags?: string[]
        excludeTags?: string[]
        pageNumber?: number
        pageSize?: number
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
