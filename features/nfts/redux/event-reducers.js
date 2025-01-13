const nfts = (state, payload) => {
  return { ...state, nfts: { ...state.nfts, data: payload, loaded: true } }
}

const nftsOptimistic = (state, payload) => {
  return { ...state, nftsOptimistic: payload }
}

const nftsTxs = (state, payload) => {
  return { ...state, txs: { ...state.txs, data: payload, loaded: true } }
}

const nftsConfigs = (state, payload) => ({ ...state, configs: payload })

const nftCollectionStats = (state, payload) => ({ ...state, collectionStats: payload })

const eventReducers = {
  nfts,
  nftsTxs,
  nftsConfigs,
  nftsOptimistic,
  nftCollectionStats,
}

export default eventReducers
