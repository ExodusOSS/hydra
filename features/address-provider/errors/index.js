export class UnsupportedAssetSourceError extends Error {
  name = 'UnsupportedAssetSourceError'
  constructor({ assetName, walletAccount }) {
    super(`Asset source "${walletAccount}:${assetName}" is not supported`)
  }
}
