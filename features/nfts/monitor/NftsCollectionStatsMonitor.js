import { Networks } from '../constants/index.js'

const NFTS_NETWORKS_WITH_COLLECTION_STATS = new Set([
  Networks.solana,
  Networks.bitcoin,
  Networks.ethereum,
  Networks.polygon,
  Networks.base,
])

class NftCollectionStatsMonitor {
  #nftsProxy
  #nftCollectionStatsAtom
  #fetchPromises = new Map()

  constructor({ nftsMonitor, nftsProxy, nftCollectionStatsAtom }) {
    this.#nftsProxy = nftsProxy
    this.#nftCollectionStatsAtom = nftCollectionStatsAtom

    nftsMonitor.on('nfts', this.#handleNfts)
  }

  #handleNfts = (data) => {
    const networks = Object.values(data)

    const nfts = networks.map((network) => Object.values(network)).flat(2)

    for (const nft of nfts) {
      if (!NFTS_NETWORKS_WITH_COLLECTION_STATS.has(nft.network)) continue

      const key = nft.collectionName ? `${nft.network}:${nft.collectionName}` : nft.id

      if (this.#fetchPromises.get(key)) continue // We are already fetching collection, skip

      this.#fetchPromises.set(key, this.#fetchCollectionStats({ key, nft }))
    }
  }

  #fetchCollectionStats = async ({ key, nft }) => {
    const { id, network, collectionSymbol } = nft

    if (typeof this.#nftsProxy?.[network]?.getCollectionStats !== 'function') return

    const stats = await this.#nftsProxy[network].getCollectionStats({ nftId: id, collectionSymbol })

    if (!stats) return

    await this.#nftCollectionStatsAtom.set((oldValue) => ({ ...oldValue, [key]: stats }))

    return stats
  }

  refreshCollectionStats = async ({ nft }) => {
    if (!NFTS_NETWORKS_WITH_COLLECTION_STATS.has(nft.network)) return

    const key = nft.collectionName ? `${nft.network}:${nft.collectionName}` : nft.id

    const promise = this.#fetchCollectionStats({ key, nft })

    this.#fetchPromises.set(key, promise)

    await promise
  }
}

export const createNftCollectionStatsMonitor = (args) => new NftCollectionStatsMonitor(args)

const nftCollectionStatsMonitorDefinition = {
  id: 'nftCollectionStatsMonitor',
  type: 'monitor',
  factory: createNftCollectionStatsMonitor,
  dependencies: ['nftsMonitor', 'nftsProxy', 'nftCollectionStatsAtom'],
  public: true,
}

export default nftCollectionStatsMonitorDefinition
