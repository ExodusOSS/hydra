import ms from 'ms'

export const calculateDynamicInterval = ({
  baseInterval,
  nftsCount,
  txsCount,
  emptyNftsMultiplier,
  emptyTxsMultiplier,
}) => {
  let adjustedInterval = baseInterval

  // do not adjust "short" intervals
  if (baseInterval < ms('1m')) {
    return adjustedInterval
  }

  if (nftsCount === 0) {
    adjustedInterval *= emptyNftsMultiplier
  }

  if (txsCount === 0) {
    adjustedInterval *= emptyTxsMultiplier
  }

  return adjustedInterval
}

export const handleNftsOnImport = async ({ nfts }, { nftsModule, nftsConfigAtom, config }) => {
  await nftsModule.load()
  const nftsConfig = await nftsConfigAtom.get()
  const nftsWithoutConfig = nfts.filter((nft) => {
    if (!nftsConfig[nft.id]) return true

    if (config?.autoApproveOnImport) {
      return nftsConfig[nft.id]?.hidden === undefined
    }

    return nftsConfig[nft.id]?.preImport === undefined
  })

  const nftsConfigToUpdate = nftsWithoutConfig.map((nft) => ({
    ...nftsConfig[nft.id],
    id: nft.id,
    preImport: true,
    ...(config?.autoApproveOnImport ? { hidden: false } : {}),
  }))

  if (nftsConfigToUpdate.length > 0) {
    await nftsModule.upsertConfigs(nftsConfigToUpdate)
  }
}
