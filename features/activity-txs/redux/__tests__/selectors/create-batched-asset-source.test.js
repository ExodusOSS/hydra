import { Tx } from '@exodus/models'

import { setup } from '../utils.js'

describe('createBatchedAssetSourceSelector', () => {
  it('should return batched txs', () => {
    const { store, selectors, handleEvent, assets } = setup()

    const fixtures = {
      ethereum: [
        {
          txId: 'tx-id-1',
          error: null,
          date: '2019-07-22T13:54:28.000Z',
          confirmations: 1,
          meta: {},
          token: null,
          dropped: false,
          coinAmount: '-0.23637286 ETH',
          coinName: 'ethereum',
          feeCoinName: 'ethereum',
          feeAmount: '0.000189 ETH',
          to: '0xa96b536eef496e21f5432fd258b6f78cf3673f74',
          currencies: { ethereum: assets.ethereum.currency },
        },
        {
          txId: 'tx-id-2',
          error: null,
          date: '2019-07-22T14:18:09.000Z',
          confirmations: 1,
          meta: {},
          token: null,
          dropped: false,
          coinAmount: '0.24511145 ETH',
          coinName: 'ethereum',
          currencies: { ethereum: assets.ethereum.currency },
        },
        {
          txId: 'tx-id-3',
          error: null,
          date: '2019-07-23T11:23:39.000Z',
          confirmations: 1,
          meta: {},
          token: null,
          dropped: false,
          coinAmount: '0.31622234 ETH',
          coinName: 'ethereum',
          currencies: { ethereum: assets.ethereum.currency },
        },
      ],
    }

    expect(
      selectors.activityTxs.createBatchedAssetSourceSelector({
        walletAccount: 'exodus_0',
        assetName: 'ethereum',
      })(store.getState())
    ).toEqual([])

    const createBatched = (batchId, txIds) =>
      txIds.map((txId) => ({
        txId,
        message: '',
        dapp: {
          batch: {
            id: batchId,
          },
        },
      }))

    const batchedTxs = ['tx-id-1', 'tx-id-2']

    const batchedPersonalNotes = createBatched('testBatch', batchedTxs)

    handleEvent('personalNotes', batchedPersonalNotes)
    handleEvent('activityTxs', {
      exodus_0: { ethereum: fixtures.ethereum.map((tx) => Tx.fromJSON(tx)) },
    })

    expect(
      selectors.activityTxs
        .createBatchedAssetSourceSelector({
          walletAccount: 'exodus_0',
          assetName: 'ethereum',
        })(store.getState())
        .map((tx) => tx.toJSON())
    ).toEqual([
      {
        coinAmount: '0.31622234 ETH',
        coinName: 'ethereum',
        confirmations: 1,
        currencies: {
          ethereum: {
            ETH: 18,
            Gwei: 9,
            Kwei: 3,
            Mwei: 6,
            finney: 15,
            szabo: 12,
            wei: 0,
          },
        },
        date: '2019-07-23T11:23:39.000Z',
        dropped: false,
        txId: 'tx-id-3',
        version: 1,
      },
      {
        coinAmount: '0.00873859 ETH',
        coinName: 'ethereum',
        confirmations: 1,
        currencies: {
          ethereum: {
            ETH: 18,
            Gwei: 9,
            Kwei: 3,
            Mwei: 6,
            finney: 15,
            szabo: 12,
            wei: 0,
          },
        },
        data: {
          batchedIds: ['tx-id-1', 'tx-id-2'],
        },
        date: '2019-07-22T13:54:28.000Z',
        dropped: false,
        feeAmount: '0.000189 ETH',
        feeCoinName: 'ethereum',
        to: '0xa96b536eef496e21f5432fd258b6f78cf3673f74',
        txId: 'tx-id-1',
        version: 1,
      },
    ])

    expect(
      selectors.activityTxs
        .createBatchedAssetSourceSelector({
          walletAccount: 'exodus_0',
          assetName: 'ethereum',
          limit: 1,
        })(store.getState())
        .map((tx) => tx.toJSON())
    ).toEqual([
      {
        coinAmount: '0.31622234 ETH',
        coinName: 'ethereum',
        confirmations: 1,
        currencies: {
          ethereum: {
            ETH: 18,
            Gwei: 9,
            Kwei: 3,
            Mwei: 6,
            finney: 15,
            szabo: 12,
            wei: 0,
          },
        },
        date: '2019-07-23T11:23:39.000Z',
        dropped: false,
        txId: 'tx-id-3',
        version: 1,
      },
    ])
  })
})
