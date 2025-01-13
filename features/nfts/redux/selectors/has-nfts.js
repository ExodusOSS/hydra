const resultFunction = (data) =>
  Object.values(data).some((nftsByAccount) =>
    Object.values(nftsByAccount).some(
      (nftsByNetwork) => Array.isArray(nftsByNetwork) && nftsByNetwork.length > 0
    )
  )

const hasNftsSelectorDefinition = {
  id: 'hasNfts',
  resultFunction,
  dependencies: [
    //
    { selector: 'all' },
  ],
}

export default hasNftsSelectorDefinition
