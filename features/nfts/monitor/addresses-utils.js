import assert from 'minimalistic-assert'

export const getNftsAddresses = async ({ addressProvider, asset, walletAccount }) => {
  assert(addressProvider, 'addressProvider is required')
  assert(asset, 'asset is required')
  assert(walletAccount, 'walletAccount is required')
  const assetName = asset.name
  let addresses = []
  try {
    if (asset.api.nfts?.getNftsAddresses) {
      addresses = await asset.api.nfts?.getNftsAddresses({ walletAccount, assetName }) // for bitcoin, we may have multiple addresses, different purpose, different chain index. To be resolved from the ordinal utxos
    } else {
      addresses = [
        await addressProvider.getReceiveAddress({ assetName, walletAccount, useCache: true }),
      ]
    }
  } catch {
    console.warn(`Failed to get NFT addresses for ${walletAccount}, ${assetName}`)
  }

  return addresses
}
