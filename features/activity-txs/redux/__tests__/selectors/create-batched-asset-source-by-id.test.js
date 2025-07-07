import { Tx } from '@exodus/models'

import { setup } from '../utils.js'

describe('createBatchedAssetSourceByIdSelector', () => {
  it('should return activity txs by id', () => {
    const { store, selectors, handleEvent } = setup()

    const bitcoinTxs = [
      {
        coinAmount: '-0.04 BTC',
        coinName: 'bitcoin',
        confirmations: 0,
        currencies: {
          bitcoin: {
            BTC: 8,
            bits: 2,
            satoshis: 0,
          },
        },
        data: {
          sent: [
            {
              address: 'btc-address-1',
              amount: {
                type: 'NumberUnit',
                unit: 'BTC',
                unitType: 'BTC',
                value: '0.06',
              },
            },
            {
              address: 'btc-address-2',
              amount: {
                type: 'NumberUnit',
                unit: 'BTC',
                unitType: 'BTC',
                value: '0.04',
              },
            },
          ],
        },
        date: '2023-07-18T12:48:15.000Z',
        dropped: false,
        feeAmount: '0.25 BTC',
        feeCoinName: 'bitcoin',
        to: 'btc-address-2',
        txId: 'tx-3-to-expand',
        version: 1,
      },
      {
        coinAmount: '-0.06 BTC',
        coinName: 'bitcoin',
        confirmations: 0,
        currencies: {
          bitcoin: {
            BTC: 8,
            bits: 2,
            satoshis: 0,
          },
        },
        data: {
          sent: [
            {
              address: 'btc-address-1',
              amount: {
                type: 'NumberUnit',
                unit: 'BTC',
                unitType: 'BTC',
                value: '0.06',
              },
            },
            {
              address: 'btc-address-2',
              amount: {
                type: 'NumberUnit',
                unit: 'BTC',
                unitType: 'BTC',
                value: '0.04',
              },
            },
          ],
        },
        date: '2023-07-18T12:48:15.000Z',
        dropped: false,
        feeAmount: '0.25 BTC',
        feeCoinName: 'bitcoin',
        to: 'btc-address-1',
        txId: 'tx-3-to-expand',
        version: 1,
      },
    ]

    const fixtures = {
      bitcoin: bitcoinTxs.map((tx) => Tx.fromJSON(tx)),
    }
    expect(
      selectors.activityTxs.createBatchedAssetSourceActivityById({
        walletAccount: 'exodus_0',
        assetName: 'bitcoin',
      })(store.getState())
    ).toEqual({})

    handleEvent('activityTxs', {
      exodus_0: { bitcoin: fixtures.bitcoin.map((tx) => Tx.fromJSON(tx)) },
    })

    const result = selectors.activityTxs.createBatchedAssetSourceActivityById({
      walletAccount: 'exodus_0',
      assetName: 'bitcoin',
    })(store.getState())

    expect(Object.keys(result)).toEqual(['tx-3-to-expand'])
    expect(result['tx-3-to-expand'].length).toEqual(2)
    expect(result['tx-3-to-expand'].map((tx) => tx.toJSON())).toEqual(bitcoinTxs)
  })
})
