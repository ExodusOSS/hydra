import { compute } from '@exodus/atoms'

const createHasNftsAtom = ({ nftsAtom }) => {
  const selector = (nfts) => {
    return Object.values(nfts).some((nftsByAccount) =>
      Object.values(nftsByAccount).some((nftsByNetwork) =>
        Object.values(nftsByNetwork).some((nft) => nft.isSpam !== true)
      )
    )
  }

  return compute({ atom: nftsAtom, selector })
}

export default createHasNftsAtom
