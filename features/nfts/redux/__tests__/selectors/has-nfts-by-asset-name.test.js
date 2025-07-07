import { setup } from '../utils.js'

describe('hasNftsByAssetName', () => {
  it('should return false if not loaded', () => {
    const { store, selectors } = setup()

    expect(selectors.nfts.hasNftsByAssetName(store.getState())('bitcoin')).toEqual(false)
  })

  it('should return stored hasNfts', () => {
    const { store, selectors, handleEvent } = setup()

    const nfts = { exodus_0: { bitcoin: [{ id: 'someId1', owner: 'owner' }] } }

    handleEvent('nfts', nfts)

    expect(selectors.nfts.hasNftsByAssetName(store.getState())('bitcoin')).toEqual(true)
    expect(selectors.nfts.hasNftsByAssetName(store.getState())('solana')).toEqual(false)
  })

  it('should not consider spam nfts', () => {
    const { store, selectors, handleEvent } = setup()

    const nfts = {
      exodus_0: {
        bitcoin: [{ id: 'someId1', owner: 'owner', isSpam: true }],
        solana: [{ id: 'someId2', owner: 'owner', isSpam: false }],
      },
    }

    handleEvent('nfts', nfts)

    expect(selectors.nfts.hasNftsByAssetName(store.getState())('bitcoin')).toEqual(false)
    expect(selectors.nfts.hasNftsByAssetName(store.getState())('solana')).toEqual(true)
  })
})
