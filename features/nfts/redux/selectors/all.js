const resultFunction = (nfts, nftsOptimistic) => {
  let merged = { ...nfts.data }
  // assume that nft should exist, otherwise ignore optimistic data
  for (const walletAccount in nftsOptimistic) {
    if (merged.hasOwnProperty(walletAccount)) {
      merged = {
        ...merged,
        [walletAccount]: {
          ...merged[walletAccount],
        },
      }
      for (const network in nftsOptimistic[walletAccount]) {
        if (merged[walletAccount].hasOwnProperty(network)) {
          merged = {
            ...merged,
            [walletAccount]: {
              ...merged[walletAccount],
              [network]: merged[walletAccount][network].map((nft) => {
                if (nftsOptimistic[walletAccount][network][nft.id]) {
                  return {
                    ...nft,
                    ...nftsOptimistic[walletAccount][network][nft.id],
                  }
                }

                return nft
              }),
            },
          }
        }
      }
    }
  }

  return merged
}

const allSelectorDefinition = {
  id: 'all',
  resultFunction,
  dependencies: [{ selector: 'nfts' }, { selector: 'nftsOptimistic' }],
}

export default allSelectorDefinition
