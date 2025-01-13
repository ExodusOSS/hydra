import { OrderSet, Tx } from '@exodus/models'

import { setup } from '../utils'

describe('createMultiActivity', () => {
  test('should return empty array of activities in wallet', () => {
    const { store, selectors } = setup()
    const createSelector = selectors.activityTxs.createMultiActivity({
      createAssetSourceActivitySelector: selectors.activityTxs.createAssetSourceBaseActivity,
    })

    const selector = createSelector({
      assetNames: ['ethereum'],
      walletAccounts: ['exodus_0'],
      foo: 'bar',
    })

    expect(selector(store.getState())).toEqual([])
  })

  test('should map activities, de-dup orders and sort by date', () => {
    const { store, selectors, handleEvent, assets } = setup()

    const BTC_ETH_ORDER = {
      orderId: 'btc-eth-order',
      fromAsset: 'bitcoin',
      toAsset: 'ethereum',
      txIds: [{ txId: 'received-tx' }, { txId: 'sent-tx' }],
      date: '2019-07-22T13:54:28.000Z',
      fromWalletAccount: 'exodus_0',
      toWalletAccount: 'exodus_0',
      toAmount: assets.ethereum.currency.defaultUnit(1),
    }

    const txLogFixtures = {
      exodus_0: {
        ethereum: [
          Tx.fromJSON({
            txId: 'received-tx',
            error: null,
            date: '2019-07-22T13:54:28.000Z',
            confirmations: 1,
            meta: {},
            token: null,
            dropped: false,
            coinAmount: '1 ETH',
            coinName: 'ethereum',
            feeCoinName: 'ethereum',
            feeAmount: '0.000189 ETH',
            currencies: { ethereum: assets.ethereum.currency },
          }),
        ],
        bitcoin: [
          Tx.fromJSON({
            txId: 'sent-tx',
            error: null,
            date: '2019-07-22T13:54:28.000Z',
            confirmations: 1,
            meta: {},
            token: null,
            dropped: false,
            coinAmount: '-1 BTC',
            coinName: 'bitcoin',
            feeCoinName: 'bitcoin',
            feeAmount: '0.000189 BTC',
            currencies: { bitcoin: assets.bitcoin.currency },
          }),
        ],
      },
      exodus_1: {
        ethereum: [
          Tx.fromJSON({
            txId: 'received-tx-2',
            error: null,
            date: '2020-07-22T13:54:28.000Z',
            confirmations: 1,
            meta: {},
            token: null,
            dropped: false,
            coinAmount: '1 ETH',
            coinName: 'ethereum',
            feeCoinName: 'ethereum',
            feeAmount: '0.000189 ETH',
            currencies: { ethereum: assets.ethereum.currency },
          }),
        ],
        bitcoin: [
          Tx.fromJSON({
            txId: 'sent-tx-2',
            error: null,
            date: '2020-07-22T13:54:28.000Z',
            confirmations: 1,
            meta: {},
            token: null,
            dropped: false,
            coinAmount: '-1 BTC',
            coinName: 'bitcoin',
            feeCoinName: 'bitcoin',
            feeAmount: '0.000189 BTC',
            currencies: { bitcoin: assets.bitcoin.currency },
          }),
        ],
      },
    }

    handleEvent('activityTxs', txLogFixtures)
    handleEvent('orders', OrderSet.fromArray([BTC_ETH_ORDER]))

    const createSelector = selectors.activityTxs.createMultiActivity({
      createAssetSourceActivitySelector: selectors.activityTxs.createAssetSourceBaseActivity,
    })

    const selector = createSelector({
      assetNames: ['ethereum', 'bitcoin'],
      walletAccounts: ['exodus_0', 'exodus_1'],
    })

    const result = selector(store.getState())

    expect(result).toMatchSnapshot()
    expect(result.map((i) => i.id)).toEqual([
      'bitcoin.sent-tx-2',
      'ethereum.received-tx-2',
      'swap.ethereum.btc-eth-order',
    ])
    expect(result.map((i) => i.date.toISOString())).toEqual([
      '2020-07-22T13:54:28.000Z',
      '2020-07-22T13:54:28.000Z',
      '2019-07-22T13:54:28.000Z',
    ])
  })

  test('should map activities and dedup items with same id', () => {
    const { store, selectors, handleEvent, assets } = setup()

    // Simulate transfer from exodus_1 to exodus_0
    const txLogFixtures = {
      exodus_0: {
        ethereum: [
          Tx.fromJSON({
            txId: 'some-tx-id',
            error: null,
            date: '2019-07-22T13:54:28.000Z',
            confirmations: 1,
            meta: {},
            token: null,
            dropped: false,
            coinAmount: '1 ETH',
            coinName: 'ethereum',
            feeCoinName: 'ethereum',
            feeAmount: '0.000189 ETH',
            currencies: { ethereum: assets.ethereum.currency },
          }),
        ],
      },
      exodus_1: {
        ethereum: [
          Tx.fromJSON({
            txId: 'some-tx-id',
            error: null,
            date: '2019-07-22T13:54:28.000Z',
            confirmations: 1,
            meta: {},
            token: null,
            dropped: false,
            coinAmount: '-1 ETH',
            coinName: 'ethereum',
            feeCoinName: 'ethereum',
            feeAmount: '0.000189 ETH',
            currencies: { ethereum: assets.ethereum.currency },
          }),
        ],
      },
    }

    handleEvent('activityTxs', txLogFixtures)

    const createSelector = selectors.activityTxs.createMultiActivity({
      createAssetSourceActivitySelector: selectors.activityTxs.createAssetSourceBaseActivity,
    })

    const selector = createSelector({
      assetNames: ['ethereum'],
      walletAccounts: ['exodus_0', 'exodus_1'],
    })

    const result = selector(store.getState())

    expect(result.map((i) => i.id)).toEqual(['ethereum.some-tx-id'])
  })
})
