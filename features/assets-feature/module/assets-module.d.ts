import type { BaseAsset, TokenAsset, CombinedAsset } from '@exodus/asset-types'

type Asset = BaseAsset | TokenAsset | CombinedAsset
type TokenDefinition = Record<string, unknown>

export declare class AssetsModule {
  initialize(params: {
    assetClientInterface: unknown
    assetsConfig?: Record<string, { config?: Record<string, unknown> }>
  }): void

  getAssets(): Record<string, Asset>

  getAsset(assetName: string): Asset | undefined

  getTokenNames(baseAssetName: string): string[]

  getBaseAssetNames(): string[]

  load(): Promise<void>

  fetchToken(assetId: string, baseAssetName: string): Promise<TokenDefinition>

  fetchTokens(assetDescriptors: { assetId: string; baseAssetName: string }[]): Promise<Asset[]>

  addToken(assetId: string, baseAssetName: string): Promise<Asset>

  addTokens(params: {
    assetIds: string[]
    baseAssetName: string
    allowedStatusList?: string[]
  }): Promise<Asset[]>

  addRemoteTokens(params: { tokenNames: string[]; allowedStatusList?: string[] }): Promise<string[]>
}

export default AssetsModule
