import { safeString } from '@exodus/safe-string'

export class UnsupportedAssetSourceError extends Error {
  name = safeString`UnsupportedAssetSourceError`
  constructor({ assetName, walletAccount }) {
    super(`Asset source "${walletAccount}:${assetName}" is not supported`)
  }
}

export class ExternalAddressNotFoundError extends Error {
  name = safeString`ExternalAddressNotFoundError`
  constructor({ assetName, walletAccount }) {
    super(
      `External address not found for asset "${assetName}" in wallet account "${walletAccount}"`
    )
  }
}
