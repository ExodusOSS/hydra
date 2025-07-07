import { WalletAccount } from '@exodus/models'
import { set } from '@exodus/basic-utils'
import ms from 'ms'

export const calculateDynamicInterval = ({
  baseInterval,
  nftsCount,
  txsCount,
  emptyNftsMultiplier,
  emptyTxsMultiplier,
  network,
  networkMultipliers,
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

  // Apply optional network-specific multiplier
  if (network && typeof networkMultipliers?.[network] === 'number') {
    adjustedInterval *= networkMultipliers[network]
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

export const doesWalletAccountSupportNFTs = (walletAccount) =>
  walletAccount.isSoftware || walletAccount.source === WalletAccount.LEDGER_SRC

export const updateNetworkFetchStatus = async ({ atom, network, walletAccountName, type }) => {
  await atom.set((state) => {
    const newState = { ...state }
    set(newState, ['fetchState', network, walletAccountName, `${type}PreviousFetch`], Date.now())
    return newState
  })
}

export const getFetchStatus = async ({ atom, network, walletAccountName, type }) => {
  const state = await atom.get()
  return state?.fetchState?.[network]?.[walletAccountName]?.[`${type}PreviousFetch`] || 0
}
