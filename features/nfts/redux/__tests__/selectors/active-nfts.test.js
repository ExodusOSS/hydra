import { setup } from '../utils'

describe('activeNfts', () => {
  it('should return default activeNfts', () => {
    const { store, selectors } = setup()

    expect(selectors.nfts.activeNfts(store.getState())).toEqual({})
  })

  it('should return stored activeNfts', () => {
    const { store, selectors, handleEvent } = setup()

    const nfts = {
      exodus_0: {
        bitcoin: [{ id: 'someId1', owner: 'owner' }],
        solana: [{ id: 'someId2', owner: 'owner' }],
      },
    }

    handleEvent('nfts', nfts)

    expect(selectors.nfts.activeNfts(store.getState())).toEqual({
      bitcoin: [
        {
          id: 'someId1',
          owner: 'owner',
        },
      ],
      solana: [
        {
          id: 'someId2',
          owner: 'owner',
        },
      ],
    })
  })
})
