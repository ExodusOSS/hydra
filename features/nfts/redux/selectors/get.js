import { createSelector } from 'reselect'

import { decomposeId } from './utils.js'

const selectorFactory = (nftsSelector) =>
  createSelector(nftsSelector, (nfts) => ({ id, walletAccount } = {}) => {
    if (!id) return

    const nftsByAccount = nfts
    const [network] = decomposeId(id, ':')

    if (!network) return

    const networks = walletAccount
      ? [nftsByAccount[walletAccount.toString()]].filter(Boolean)
      : Object.values(nftsByAccount)

    for (const nftsByNetwork of networks) {
      // return undefined if not all nfts of that network loaded yet
      if (!nftsByNetwork[network]) return

      for (const nft of nftsByNetwork[network]) {
        if (nft.id === id) return nft
      }
    }

    return null
  })

const createGetSelector = {
  id: 'get',
  selectorFactory,
  dependencies: [{ selector: 'all' }],
}

export default createGetSelector
