import { omit } from '@exodus/basic-utils'
import { OrderSet, Tx } from '@exodus/models'

import { setup } from '../utils'

describe('createAssetSourceBaseActivity', () => {
  test('should return array of activities in wallet', () => {
    const { store, selectors } = setup()
    const empty = selectors.activityTxs.createAssetSourceBaseActivity({
      assetName: 'ethereum',
      walletAccount: 'exodus_0',
    })

    expect(empty(store.getState())).toEqual([])
  })

  test('should group txs with same order', () => {
    const { store, selectors, handleEvent, assets } = setup()

    const BTC_ETH_ORDER = {
      orderId: 'btc-eth-order',
      fromAsset: 'bitcoin',
      toAsset: 'ethereum',
      txIds: [{ txId: 'some-receive-tx' }, { txId: 'some-receive-tx-2' }],
      date: '2019-07-22T13:54:28.000Z',
      fromWalletAccount: 'exodus_0',
      toWalletAccount: 'exodus_0',
      toAmount: assets.ethereum.currency.defaultUnit(3),
    }

    const txLogFixtures = {
      ethereum: [
        {
          txId: 'some-receive-tx',
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
        },
        {
          txId: 'some-receive-tx-2',
          error: null,
          date: '2019-07-22T13:54:28.000Z',
          confirmations: 1,
          meta: {},
          token: null,
          dropped: false,
          coinAmount: '2 ETH',
          coinName: 'ethereum',
          feeCoinName: 'ethereum',
          feeAmount: '0.000189 ETH',
          currencies: { ethereum: assets.ethereum.currency },
        },
      ],
    }

    handleEvent('activityTxs', {
      exodus_0: {
        ethereum: txLogFixtures.ethereum.map((tx) => Tx.fromJSON(tx)),
      },
    })
    handleEvent('orders', OrderSet.fromArray([BTC_ETH_ORDER]))

    const selector = selectors.activityTxs.createAssetSourceBaseActivity({
      assetName: 'ethereum',
      walletAccount: 'exodus_0',
    })

    const result = selector(store.getState())

    expect(result.length).toEqual(1)
    expect(result[0].id).toEqual('swap.ethereum.btc-eth-order')
    expect(result[0].type).toEqual('exchange')
    expect(result).toMatchSnapshot()
  })

  test('should return activity for asset', () => {
    const { store, selectors, handleEvent, assets } = setup()

    const txLogFixtures = {
      ethereum: [
        {
          txId: 'some-receive-tx',
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
        },
        {
          txId: 'some-receive-tx-2',
          error: null,
          date: '2019-07-22T13:54:28.000Z',
          confirmations: 1,
          meta: {},
          token: null,
          dropped: false,
          coinAmount: '2 ETH',
          coinName: 'ethereum',
          feeCoinName: 'ethereum',
          feeAmount: '0.000189 ETH',
          currencies: { ethereum: assets.ethereum.currency },
        },
      ],
    }

    handleEvent('activityTxs', {
      exodus_0: {
        ethereum: txLogFixtures.ethereum.map((tx) => Tx.fromJSON(tx)),
      },
    })

    const selector = selectors.activityTxs.createAssetSourceBaseActivity({
      assetName: 'ethereum',
      walletAccount: 'exodus_0',
    })

    const result = selector(store.getState())

    expect(result.length).toEqual(2)
    expect(result[0].id).toEqual('ethereum.some-receive-tx')
    expect(result[1].id).toEqual('ethereum.some-receive-tx-2')
    expect(result).toMatchSnapshot()
  })

  test('should use activityIndex for id when available', () => {
    const { store, selectors, handleEvent, assets } = setup()

    const txLogFixtures = {
      bitcoin: [
        {
          currencies: { bitcoin: assets.bitcoin.currency },
          txId: 'bitcoin-tx',
          error: null,
          date: '2019-07-18T12:48:15.000Z',
          confirmations: 1,
          meta: {},
          token: null,
          dropped: false,
          coinAmount: '-0.1 BTC',
          coinName: 'bitcoin',
          feeCoinName: 'bitcoin',
          feeAmount: '0.00002 BTC',
          data: {
            activityIndex: 0,
            sent: [
              { amount: '0.1 BTC', address: 'btc-address-1' },
              { amount: '0.1 BTC', address: 'btc-address-2' },
            ],
          },
        },
        {
          currencies: { bitcoin: assets.bitcoin.currency },
          txId: 'bitcoin-tx',
          error: null,
          date: '2019-07-18T12:48:15.000Z',
          confirmations: 1,
          meta: {},
          token: null,
          dropped: false,
          coinAmount: '-0.1 BTC',
          coinName: 'bitcoin',
          feeCoinName: 'bitcoin',
          feeAmount: '0.00002 BTC',
          data: {
            activityIndex: 1,
            sent: [
              { amount: '0.1 BTC', address: 'btc-address-1' },
              { amount: '0.1 BTC', address: 'btc-address-2' },
            ],
          },
        },
      ],
    }

    handleEvent('activityTxs', {
      exodus_0: {
        bitcoin: txLogFixtures.bitcoin.map((tx) => Tx.fromJSON(tx)),
      },
    })

    const selector = selectors.activityTxs.createAssetSourceBaseActivity({
      assetName: 'bitcoin',
      walletAccount: 'exodus_0',
    })

    const result = selector(store.getState())

    expect(result.length).toEqual(2)
    expect(result[0].id).toEqual('bitcoin.bitcoin-tx')
    expect(result[1].id).toEqual('bitcoin.bitcoin-tx_1')
    expect(result).toMatchSnapshot()
  })

  test('should add indexless orders to activity', () => {
    const { store, selectors, handleEvent, assets } = setup()
    handleEvent('assets', {
      assets: {
        algorand: assets.algorand,
        flare: {
          ...assets.flare,
          baseAsset: {
            ...assets.flare.baseAsset,
            api: {
              features: {
                noHistory: true, // simulate flare have no history
              },
            },
          },
        },
      },
    })
    handleEvent('availableAssetNames', ['algorand', 'flare'])
    const orders = OrderSet.fromArray([
      {
        orderId: 'eac6bec7798be8',
        status: 'complete-verified',
        date: '2023-09-13T11:59:24.204Z',
        fromTxId: 'ISO7UZYSZAYC2PGTD4OKYJMBFA3JILLKCDSUO3LZB2Q7ECWDYTYQ',
        toTxId: '0x8bbea887472df32167597c36fffc70ac508a01088194e30b877d093fe25f9725',
        txIds: [
          {
            txType: 'depositTransaction',
            txId: 'ISO7UZYSZAYC2PGTD4OKYJMBFA3JILLKCDSUO3LZB2Q7ECWDYTYQ',
          },
          {
            txType: 'payoutTransaction',
            txId: '0x8bbea887472df32167597c36fffc70ac508a01088194e30b877d093fe25f9725',
          },
        ],
        fromAsset: 'algorand',
        fromAmount: {
          t: 'numberunit',
          v: {
            v: '1013.41878 ALGO',
            u: {
              microAlgo: 0,
              ALGO: 6,
            },
          },
        },
        toAsset: 'flare',
        toAmount: {
          t: 'numberunit',
          v: {
            v: '7598.14749525 FLR',
            u: {
              wei: 0,
              Kwei: 3,
              Mwei: 6,
              Gwei: 9,
              szabo: 12,
              finney: 15,
              FLR: 18,
            },
          },
        },
        fromWalletAccount: 'exodus_0',
        toWalletAccount: 'exodus_0',
        svc: 'cn',
        synced: true,
        region: 'INTL',
        displaySvc: 'cn',
        potentialToTxIds: [],
        _version: 1,
      },
    ])

    handleEvent('orders', orders)

    handleEvent('activityTxs', {
      exodus_0: {
        flare: [
          // Simulate having tx. it must be ignored
          {
            txId: '0x8bbea887472df32167597c36fffc70ac508a01088194e30b877d093fe25f9725',
            coinName: 'flare',
            coinAmount: '7598.14749525 FLR',
            confirmations: 1,
            date: '2023-09-13T11:59:24.204Z',
            currencies: { flare: assets.flare.currency },
          },
        ].map((tx) => Tx.fromJSON(tx)),
        algorand: [
          {
            txId: 'ISO7UZYSZAYC2PGTD4OKYJMBFA3JILLKCDSUO3LZB2Q7ECWDYTYQ',
            coinName: 'algorand',
            coinAmount: '1013.41878 ALGO',
            confirmations: 1,
            date: '2023-09-13T11:59:24.204Z',
            currencies: { algorand: assets.algorand.currency },
          },
        ].map((tx) => Tx.fromJSON(tx)),
      },
    })

    const selector = selectors.activityTxs.createAssetSourceBaseActivity({
      assetName: 'flare',
      walletAccount: 'exodus_0',
    })

    const result = selector(store.getState())
    expect(result.length).toEqual(1)
    expect(omit(result[0], ['toAsset', 'fromAsset'])).toMatchSnapshot()

    const selector2 = selectors.activityTxs.createAssetSourceBaseActivity({
      assetName: 'algorand',
      walletAccount: 'exodus_0',
    })
    const result2 = selector2(store.getState())
    expect(result2.length).toEqual(1)
    expect(omit(result2[0], ['toAsset', 'fromAsset'])).toMatchSnapshot()
  })

  test('should add orders without txs to activity', () => {
    const { store, selectors, handleEvent, assets } = setup()
    handleEvent('assets', {
      assets: {
        algorand: assets.algorand,
        flare: assets.flare,
      },
    })
    handleEvent('availableAssetNames', ['algorand', 'flare'])

    // simulate pending order without payout tx (received tx for flare)
    const orders = OrderSet.fromArray([
      // normal order with tx
      {
        orderId: 'order-with-tx',
        status: 'complete-verified',
        date: new Date('2022-09-13T11:59:24.204Z'),
        fromTxId: 'tx-with-order-algorand',
        toTxId: 'tx-with-order-flare',
        fromAsset: 'algorand',
        fromAmount: assets.algorand.currency.defaultUnit(1),
        toAsset: 'flare',
        toAmount: assets.flare.currency.defaultUnit(10),
        fromWalletAccount: 'exodus_0',
        toWalletAccount: 'exodus_0',
        svc: 'cn',
        synced: true,
        region: 'INTL',
        displaySvc: 'cn',
        potentialToTxIds: [],
        _version: 1,
      },
      // pending order without received tx
      {
        orderId: 'eac6bec7798be8',
        status: 'in-progress',
        date: new Date('2023-09-13T11:59:24.204Z'),
        fromTxId: 'algorand-send-tx',
        toTxId: null,
        fromAsset: 'algorand',
        fromAmount: assets.algorand.currency.defaultUnit(100),
        toAsset: 'flare',
        toAmount: assets.flare.currency.defaultUnit(10_000),
        fromWalletAccount: 'exodus_0',
        toWalletAccount: 'exodus_0',
        svc: 'cn',
        synced: true,
        region: 'INTL',
        displaySvc: 'cn',
        potentialToTxIds: [],
        _version: 1,
      },
    ])

    handleEvent('orders', orders)

    handleEvent('activityTxs', {
      exodus_0: {
        flare: [
          {
            txId: 'tx-with-order-flare',
            coinName: 'flare',
            coinAmount: '10 FLR',
            confirmations: 1,
            date: '2022-09-13T11:59:24.204Z',
            currencies: { flare: assets.flare.currency },
          },
        ].map((tx) => Tx.fromJSON(tx)),
        algorand: [
          {
            txId: 'tx-with-order-algorand',
            coinName: 'algorand',
            coinAmount: '1 ALGO',
            confirmations: 1,
            date: '2022-09-13T11:59:24.204Z',
            currencies: { algorand: assets.algorand.currency },
          },
          {
            txId: 'ISO7UZYSZAYC2PGTD4OKYJMBFA3JILLKCDSUO3LZB2Q7ECWDYTYQ',
            coinName: 'algorand',
            coinAmount: '1013.41878 ALGO',
            confirmations: 1,
            date: '2023-09-13T11:59:24.204Z',
            currencies: { algorand: assets.algorand.currency },
          },
        ].map((tx) => Tx.fromJSON(tx)),
      },
    })

    const selector = selectors.activityTxs.createAssetSourceBaseActivity({
      assetName: 'flare',
      walletAccount: 'exodus_0',
      displayOrderWithoutTx: true,
    })

    const result = selector(store.getState())
    expect(result.length).toEqual(2)
    expect(result[0].id).toEqual('swap.flare.eac6bec7798be8')
    expect(result[0].pending).toEqual(true)
    expect(result[1].id).toEqual('swap.flare.order-with-tx')
    expect(result[1].order.orderId).toEqual('order-with-tx')
    expect(result[1].pending).toEqual(false)
    expect(omit(result[0], ['toAsset', 'fromAsset'])).toMatchSnapshot()
    expect(omit(result[1], ['toAsset', 'fromAsset'])).toMatchSnapshot()
  })

  test('should return txs if orders are not supported', () => {
    const { store, selectors, handleEvent, assets } = setup({ withOrders: false })
    handleEvent('assets', {
      assets: {
        algorand: assets.algorand,
      },
    })
    handleEvent('availableAssetNames', ['algorand'])

    handleEvent('activityTxs', {
      exodus_0: {
        algorand: [
          {
            txId: 'ISO7UZYSZAYC2PGTD4OKYJMBFA3JILLKCDSUO3LZB2Q7ECWDYTYQ',
            coinName: 'algorand',
            coinAmount: '1013.41878 ALGO',
            confirmations: 1,
            date: '2023-09-13T11:59:24.204Z',
            currencies: { algorand: assets.algorand.currency },
          },
        ].map((tx) => Tx.fromJSON(tx)),
      },
    })

    const selector = selectors.activityTxs.createAssetSourceBaseActivity({
      assetName: 'algorand',
      walletAccount: 'exodus_0',
    })
    const result = selector(store.getState())
    expect(result.length).toEqual(1)
    expect(result).toMatchSnapshot()
  })
})
