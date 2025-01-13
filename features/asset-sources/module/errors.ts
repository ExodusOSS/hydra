import type { AssetSource } from '../types.js'

export class UnsupportedAssetError extends Error {
  name = 'UnsupportedAssetError'
  constructor(assetName: string) {
    super(`Asset "${assetName}" is not supported`)
  }
}

export class UnknownWalletAccountError extends Error {
  name = 'UnknownWalletAccountError'
  constructor(walletAccount: string) {
    super(`WalletAccount "${walletAccount}" not found`)
  }
}

export class UnsupportedAssetSourceError extends Error {
  name = 'UnsupportedAssetSourceError'
  constructor({ assetName, walletAccount }: AssetSource) {
    super(`Asset source "${walletAccount}:${assetName}" is not supported`)
  }
}
