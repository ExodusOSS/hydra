import { setup } from '../utils'

describe('all', () => {
  it('should return default all', () => {
    const { store, selectors } = setup()

    expect(selectors.nfts.all(store.getState())).toEqual({})
  })

  it('should return stored all', () => {
    const { store, selectors, handleEvent } = setup()

    const bitcoinNfts = {
      exodus_0: {
        solana: [{ id: 'solana:someId2', owner: 'owner' }],
        bitcoin: [{ id: 'bitcoin:someId1', owner: 'owner1' }],
      },
      exodus_1: {
        bitcoin: [
          { id: 'bitcoin:someId1', owner: 'owner2' },
          { id: 'bitcoin:someId2', owner: 'owner3' },
        ],
      },
    }

    const nftsOptimistic = {
      exodus_0: {
        solana: {
          'solana:someId2': {
            owner: 'optimistic',
          },
        },
      },
    }

    handleEvent('nfts', bitcoinNfts)
    handleEvent('nftsOptimistic', nftsOptimistic)

    expect(selectors.nfts.all(store.getState())).toEqual({
      exodus_0: {
        bitcoin: [
          {
            id: 'bitcoin:someId1',
            owner: 'owner1',
          },
        ],
        solana: [
          {
            id: 'solana:someId2',
            owner: 'optimistic',
          },
        ],
      },
      exodus_1: {
        bitcoin: [
          {
            id: 'bitcoin:someId1',
            owner: 'owner2',
          },
          {
            id: 'bitcoin:someId2',
            owner: 'owner3',
          },
        ],
      },
    })
  })
})
