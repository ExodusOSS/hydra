import { setup } from '../utils.js'

describe('createAssetSourceNftTxsById', () => {
  it('should return default txs by txId default', () => {
    const { store, selectors } = setup()

    expect(
      selectors.nfts.createAssetSourceNftTxsById({
        assetName: 'bitcoin',
        walletAccount: 'exodus_0',
      })(store.getState()).size
    ).toEqual(0)
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
        solana: [
          {
            nftId: 'someId2',
            date: 1,
            from: 'solanaAddress1',
            to: 'anothersolanaAddress1',
            txId: 'someNftTx2',
          },
        ],
      },
      exodus_1: {
        bitcoin: [
          {
            nftId: 'someId4',
            date: 1,
            from: 'bitcoinAddress2',
            to: 'anotherbitcoinAddress3',
            txId: 'someNftTx4',
          },
        ],
      },
    })

    const result = selectors.nfts.createAssetSourceNftTxsById({
      assetName: 'bitcoin',
      walletAccount: 'exodus_0',
    })(store.getState())

    expect(result.size).toEqual(1)

    expect(Object.fromEntries(result)).toEqual({
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
