import { memoize } from '@exodus/basic-utils'
import { ASSET_NAME_TO_NFTS_NETWORK } from '../../constants/index.js'

const resultFunction = (allNfts) =>
  memoize((assetName) => {
    const networkName = ASSET_NAME_TO_NFTS_NETWORK[assetName]
    return Object.values(allNfts).some((nftsByAccount) => {
      const nfts = nftsByAccount[networkName]
      return Array.isArray(nfts) && nfts.some((nft) => nft.isSpam !== true)
    })
  })

const hasNftsByAssetNameSelectorDefinition = {
  id: 'hasNftsByAssetName',
  resultFunction,
  dependencies: [
    //
    { selector: 'all' },
  ],
}

export default hasNftsByAssetNameSelectorDefinition
