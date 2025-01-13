import { setup } from '../utils'

describe('txsById', () => {
  it('should return default txs by txId default', () => {
    const { store, selectors } = setup()

    expect(selectors.nfts.txsById(store.getState()).size).toEqual(0)
  })

  it('should return default txs by txId', () => {
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

    expect(Object.fromEntries(selectors.nfts.txsById(store.getState()))).toEqual({
      someNftTx1: {
        date: 1,
        from: 'bitcoinAddress1',
        network: 'bitcoin',
        nftId: 'someId1',
        to: 'anotherbitcoinAddress1',
        txId: 'someNftTx1',
      },
    })
  })
})
