const createNftsApi = ({ nfts, nftsMonitor, nftsProxy, nftCollectionStatsMonitor }) => {
  const nftsModule = nfts
  return {
    nfts: {
      upsertConfig: nftsModule.upsertConfig,
      upsertConfigs: nftsModule.upsertConfigs,
      setMonitorInterval: nftsMonitor.setInterval,
      monitorForceFetch: nftsMonitor.forceFetch,
      getNft: async (id) => nftsProxy.getNft(id),
      setOptimisticNft: ({ id, network, walletAccount }, payload) => {
        nftsModule.setOptimisticNft({ id, network, walletAccount }, payload)
      },
      getNftImage: async (...args) => nftsProxy.getNftImage(...args),
      getNftImageUrl: (...args) => nftsProxy.getNftImageUrl(...args),
      getCollectionStats: async ({ network, ...args }) =>
        nftsProxy[network].getCollectionStats(args),
      refreshCollectionStats: async (args) =>
        nftCollectionStatsMonitor?.refreshCollectionStats(args),
    },
  }
}

const nftsApiDefinition = {
  id: 'createNftsApi',
  type: 'api',
  factory: createNftsApi,
  dependencies: ['nfts', 'nftsMonitor', 'nftsProxy', 'nftCollectionStatsMonitor?'],
}

export default nftsApiDefinition
