import { createInMemoryAtom } from '@exodus/atoms'

import createHasNftsAtom from '../has-nfts.js'

describe('hasNftsAtom', () => {
  let hasNftsAtom
  let nftsAtom

  beforeEach(() => {
    nftsAtom = createInMemoryAtom({ defaultValue: {} })
    hasNftsAtom = createHasNftsAtom({ nftsAtom })
  })

  it('should be false if nfts atom is empty', async () => {
    await expect(hasNftsAtom.get()).resolves.toBe(false)
  })

  it('should be false if nfts atom does not have nfts', async () => {
    await nftsAtom.set({ exodus_0: { ethereum: [] }, exodus_1: { ethereum: [] } })
    await expect(hasNftsAtom.get()).resolves.toBe(false)
  })

  it('should be true if nfts atom have nfts', async () => {
    await nftsAtom.set({
      exodus_0: { ethereum: [{ id: 'nft1' }] },
      exodus_1: { ethereum: [{ id: 'nfts2', isSpam: false }] },
    })
    await expect(hasNftsAtom.get()).resolves.toBe(true)
  })

  it('should be false if nfts atom have only spam NFTs', async () => {
    await nftsAtom.set({
      exodus_0: { ethereum: [{ id: 'nft1', isSpam: true }] },
      exodus_1: { ethereum: [{ id: 'nfts2', isSpam: true }] },
    })
    await expect(hasNftsAtom.get()).resolves.toBe(false)
  })
})
