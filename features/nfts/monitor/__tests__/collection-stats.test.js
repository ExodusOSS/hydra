import { createInMemoryAtom } from '@exodus/atoms'
import EventEmitter from 'events/events.js'

import { createNftCollectionStatsMonitor } from '../NftsCollectionStatsMonitor.js'

const initialNfts = {
  exodus_0: {
    solana: [
      { id: 'Harry Potter', network: 'solana', collectionName: 'Chocolate Frog Cards' },
      { id: 'Albus Dumbledore', network: 'solana', collectionName: 'Chocolate Frog Cards' },
    ],
    bitcoin: [{ id: 'Frodo Baggins', network: 'bitcoin', collectionName: 'LOTR Collectibles' }],
    polygon: [{ id: 'Darth Vader', network: 'polygon', collectionName: 'Star Wars Collectibles' }],
  },
}

describe('nfts collection stats monitor', () => {
  let monitor
  let nftsMonitor
  let nftsProxy
  let nftCollectionStatsAtom

  beforeEach(() => {
    nftsMonitor = new EventEmitter()

    nftCollectionStatsAtom = createInMemoryAtom({ defaultValue: {} })

    nftsProxy = {
      solana: { getCollectionStats: jest.fn(async () => ({ floorPrice: 7 })) },
      bitcoin: { getCollectionStats: jest.fn(async () => ({ floorPrice: 10 })) },
      polygon: { getCollectionStats: jest.fn(async () => ({ floorPrice: 12 })) },
    }

    monitor = createNftCollectionStatsMonitor({ nftsMonitor, nftsProxy, nftCollectionStatsAtom })
  })

  it('should fetch details for emitted nfts', async () => {
    nftsMonitor.emit('nfts', initialNfts)

    await new Promise(setImmediate)

    expect(nftsProxy.solana.getCollectionStats).toHaveBeenCalledTimes(1)
    expect(nftsProxy.bitcoin.getCollectionStats).toHaveBeenCalledTimes(1)
    expect(nftsProxy.polygon.getCollectionStats).toHaveBeenCalledTimes(1)

    await expect(nftCollectionStatsAtom.get()).resolves.toEqual({
      'solana:Chocolate Frog Cards': { floorPrice: 7 },
      'polygon:Star Wars Collectibles': { floorPrice: 12 },
      'bitcoin:LOTR Collectibles': { floorPrice: 10 },
    })
  })

  it('should refresh collection stats', async () => {
    nftsMonitor.emit('nfts', initialNfts)

    await new Promise(setImmediate)

    await expect(nftCollectionStatsAtom.get()).resolves.toEqual({
      'solana:Chocolate Frog Cards': { floorPrice: 7 },
      'polygon:Star Wars Collectibles': { floorPrice: 12 },
      'bitcoin:LOTR Collectibles': { floorPrice: 10 },
    })

    nftsProxy.solana.getCollectionStats.mockImplementation(async () => ({ floorPrice: 20 }))

    await monitor.refreshCollectionStats({
      nft: {
        id: 'Harry Potter',
        network: 'solana',
        collectionName: 'Chocolate Frog Cards',
      },
    })

    await expect(nftCollectionStatsAtom.get()).resolves.toEqual({
      'solana:Chocolate Frog Cards': { floorPrice: 20 },
      'polygon:Star Wars Collectibles': { floorPrice: 12 },
      'bitcoin:LOTR Collectibles': { floorPrice: 10 },
    })
  })
})
