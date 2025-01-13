import { memoize } from 'lodash' // eslint-disable-line @exodus/restricted-imports/prefer-basic-utils -- TODO: fix next time we touch this file
import { ASSET_NAME_TO_NFTS_NETWORK } from '../../constants'

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
