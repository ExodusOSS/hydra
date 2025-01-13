import { mapValues } from '@exodus/basic-utils'

export const toBalanceOnly = (balancesByBaseAssetSource) => {
  return mapValues(balancesByBaseAssetSource, (balancesByAssetSource) =>
    mapValues(balancesByAssetSource, (balancesByField) => balancesByField.balance)
  )
}

export const isMultiNetworkAsset = (asset) => {
  return asset.assetType === 'MULTI_NETWORK_ASSET'
}
