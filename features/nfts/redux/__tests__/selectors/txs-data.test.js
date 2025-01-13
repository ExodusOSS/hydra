import { setup } from '../utils'

describe('txsData', () => {
  it('should return default txs data', () => {
    const { store, selectors } = setup()

    expect(selectors.nfts.txsData(store.getState())).toEqual({})
  })

  it('should return stored txs data', () => {
    const { store, selectors, handleEvent } = setup()

    handleEvent('nftsTxs', {
      exodus_0: {
        bitcoin: [
          {
            nftId: 'someId1',
            date: 1,
            from: 'bitcoinAddress1',
            to: 'anotherbitcoinAddress1',
            txId: 'someNftTx1',
          },
        ],
      },
    })

    expect(selectors.nfts.txsData(store.getState())).toEqual({
      exodus_0: {
        bitcoin: [
          {
            date: 1,
            from: 'bitcoinAddress1',
            nftId: 'someId1',
            to: 'anotherbitcoinAddress1',
            txId: 'someNftTx1',
          },
        ],
      },
    })
  })
})
