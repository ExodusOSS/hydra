import type KeyIdentifier from '@exodus/key-identifier'

export type Asset = {
  name: string
  baseAsset: Asset
  bip44: number
  api?: {
    hasFeature?: (feature: string) => boolean
    getKeyIdentifier(params: {
      purpose: number
      accountIndex: number
      chainIndex?: number
      addressIndex?: number
      compatibilityMode?: string
    }): KeyIdentifier
  }
}

export interface AssetsModule {
  getAsset: (assetName: string) => Asset
  getAssets: () => Record<string, Asset>
  getBaseAssetNames: () => string[]
}

export type BlockchainMetadata = {
  clear: () => Promise<void>
}

export interface AssetSources {
  getDefaultPurpose(params: { walletAccount: string; assetName: string }): Promise<number>
}
