import { omit } from '@exodus/basic-utils'
import { OrderSet, Tx, TxSet } from '@exodus/models'

import { setup } from '../utils.js'

describe('createAssetSourceBaseActivity', () => {
  test('should return array of activities in wallet', () => {
    const { store, selectors } = setup()
    const empty = selectors.activityTxs.createAssetSourceBaseActivity({
      assetName: 'ethereum',
      walletAccount: 'exodus_0',
    })

    expect(empty(store.getState())).toEqual([])
  })

  test('should return empty activity when the asset is missing from the assets registry', () => {
    const { store, selectors } = setup()

    // multi-account-redux returns a null tx source for assets missing from the
    // registry; the selector must yield empty activity instead of crashing.
    const selector = selectors.activityTxs.createAssetSourceBaseActivity({
      assetName: 'unregistered-token',
      walletAccount: 'exodus_0',
    })

    expect(selector(store.getState())).toEqual([])
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

  test('should handle a TxSet (iterable) tx source without throwing', () => {
    const { store, selectors, handleEvent, assets } = setup()

    const txs = [
      {
        txId: 'iterable-receive-tx',
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
    ].map((tx) => Tx.fromJSON(tx))

    handleEvent('activityTxs', {
      exodus_0: {
        ethereum: TxSet.fromArray(txs),
      },
    })

    const selector = selectors.activityTxs.createAssetSourceBaseActivity({
      assetName: 'ethereum',
      walletAccount: 'exodus_0',
    })

    const result = selector(store.getState())

    expect(result.length).toEqual(1)
    expect(result[0].id).toEqual('ethereum.iterable-receive-tx')
  })

  test('should add orders only related to provided account', () => {
    const { store, selectors, handleEvent, assets } = setup()

    const BTC_ETH_ORDER = {
      orderId: 'btc-eth-order',
      fromAsset: 'bitcoin',
      toAsset: 'ethereum',
      txIds: [{ txId: 'cross-portfolio-swap' }],
      date: '2019-07-22T13:54:28.000Z',
      fromWalletAccount: 'exodus_0',
      toWalletAccount: 'exodus_1',
      toAmount: assets.ethereum.currency.defaultUnit(3),
    }

    handleEvent('activityTxs', {
      exodus_0: {
        ethereum: [
          Tx.fromJSON({
            txId: 'just-tx',
            error: null,
            date: '2019-07-22T13:54:28.000Z',
            confirmations: 1,
            meta: {},
            token: null,
            dropped: false,
            coinAmount: '2 ETH',
            coinName: 'ethereum',
            feeCoinName: 'ethereum',
            feeAmount: '0.01 ETH',
            currencies: { ethereum: assets.ethereum.currency },
          }),
        ],
      },
      exodus_1: {
        ethereum: [
          Tx.fromJSON({
            txId: 'cross-portfolio-swap',
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
    })
    handleEvent('orders', OrderSet.fromArray([BTC_ETH_ORDER]))

    const selector = selectors.activityTxs.createAssetSourceBaseActivity({
      assetName: 'ethereum',
      walletAccount: 'exodus_1',
      displayOrderWithoutTx: true,
    })

    const result = selector(store.getState())

    expect(result.length).toEqual(1)
    expect(result[0].id).toEqual('swap.ethereum.btc-eth-order')
    expect(result[0].type).toEqual('exchange')

    const selector2 = selectors.activityTxs.createAssetSourceBaseActivity({
      assetName: 'ethereum',
      walletAccount: 'exodus_0',
      displayOrderWithoutTx: true,
    })

    const result2 = selector2(store.getState())

    expect(result2.length).toEqual(1)
    expect(result2[0].id).toEqual('ethereum.just-tx')
    expect(result2[0].type).toEqual('rx')
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

  test('should not match tx with order if has different coin amount', () => {
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
            sentIndex: 0,
            sent: [
              { amount: '0.1 BTC', address: 'btc-address-1' },
              { amount: '0.2 BTC', address: 'btc-address-2' },
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
          coinAmount: '-0.2 BTC',
          coinName: 'bitcoin',
          feeCoinName: 'bitcoin',
          feeAmount: '0.00002 BTC',
          data: {
            sentIndex: 1,
            sent: [
              { amount: '0.1 BTC', address: 'btc-address-1' },
              { amount: '0.2 BTC', address: 'btc-address-2' },
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

    handleEvent(
      'orders',
      OrderSet.fromArray([
        {
          orderId: 'btc-eth-order',
          fromAsset: 'bitcoin',
          toAsset: 'ethereum',
          txIds: [{ txId: 'bitcoin-tx' }],
          date: '2019-07-22T13:54:28.000Z',
          fromWalletAccount: 'exodus_0',
          toWalletAccount: 'exodus_0',
          toAmount: assets.ethereum.currency.defaultUnit(3),
          fromAmount: assets.bitcoin.currency.defaultUnit(0.1),
        },
      ])
    )

    const selector = selectors.activityTxs.createAssetSourceBaseActivity({
      assetName: 'bitcoin',
      walletAccount: 'exodus_0',
    })

    const result = selector(store.getState())

    expect(result.length).toEqual(2)
    expect(result[0].id).toEqual('bitcoin.bitcoin-tx')
    expect(result[1].id).toEqual('swap.bitcoin.btc-eth-order')
    expect(result[1].type).toEqual('exchange')
  })

  test('should not fail on not found order for batched tx', () => {
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
            sentIndex: 0,
            sent: [
              { amount: '0.1 BTC', address: 'btc-address-1' },
              { amount: '0.2 BTC', address: 'btc-address-2' },
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

    expect(result.length).toEqual(1)
    expect(result[0].id).toEqual('bitcoin.bitcoin-tx')
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

  test('should skip unindexed receive-side orders without an amount', () => {
    const { store, selectors, handleEvent, assets } = setup()
    handleEvent('assets', {
      assets: {
        algorand: assets.algorand,
        flare: assets.flare,
      },
    })
    handleEvent('availableAssetNames', ['algorand', 'flare'])

    handleEvent(
      'orders',
      OrderSet.fromArray([
        {
          orderId: 'failed-without-to-amount',
          status: 'failed-final',
          date: new Date('2023-09-13T11:59:24.204Z'),
          fromTxId: 'algorand-send-tx',
          toTxId: null,
          fromAsset: 'algorand',
          fromAmount: assets.algorand.currency.defaultUnit(100),
          toAsset: 'flare',
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
    )

    const receiveSelector = selectors.activityTxs.createAssetSourceBaseActivity({
      assetName: 'flare',
      walletAccount: 'exodus_0',
      displayOrderWithoutTx: true,
    })
    const sendSelector = selectors.activityTxs.createAssetSourceBaseActivity({
      assetName: 'algorand',
      walletAccount: 'exodus_0',
      displayOrderWithoutTx: true,
    })

    expect(receiveSelector(store.getState())).toEqual([])

    const sendResult = sendSelector(store.getState())
    expect(sendResult).toHaveLength(1)
    expect(sendResult[0].id).toEqual('swap.algorand.failed-without-to-amount')
    expect(sendResult[0].displayAmount).toEqual(assets.algorand.currency.defaultUnit(100))
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

  test('should suppress bridge-asset legs of a chained swap', () => {
    const { store, selectors, handleEvent, assets } = setup()

    // Simulate a chained swap ALGO -> ETH (bridge) -> FLR.
    // The bridge asset (ETH) lands in and leaves the wallet on the same on-chain
    // txs as the first/last legs, so it must not surface as send/receive rows.
    const CHAINED_ORDER = {
      orderId: 'chained-algo-flr',
      status: 'complete-verified',
      fromAsset: 'algorand',
      toAsset: 'flare',
      fromTxId: 'leg1-tx',
      toTxId: 'leg2-tx',
      txIds: [
        { txType: 'depositTransaction', txId: 'leg1-tx' },
        { txType: 'payoutTransaction', txId: 'leg2-tx' },
      ],
      date: '2025-10-01T13:54:28.000Z',
      fromWalletAccount: 'exodus_0',
      toWalletAccount: 'exodus_0',
      fromAmount: assets.algorand.currency.defaultUnit(100),
      toAmount: assets.flare.currency.defaultUnit(1000),
      svc: 'chained',
      synced: true,
      region: 'INTL',
      displaySvc: 'chained',
      potentialToTxIds: [],
      _version: 1,
    }

    const txLogFixtures = {
      algorand: [
        {
          txId: 'leg1-tx',
          error: null,
          date: '2025-10-01T13:54:28.000Z',
          confirmations: 1,
          meta: {},
          token: null,
          dropped: false,
          coinAmount: '-100 ALGO',
          coinName: 'algorand',
          feeCoinName: 'algorand',
          feeAmount: '0.001 ALGO',
          currencies: { algorand: assets.algorand.currency },
        },
      ],
      // Bridge asset movements: received on leg 1, sent on leg 2. Both noise.
      ethereum: [
        {
          txId: 'leg1-tx',
          error: null,
          date: '2025-10-01T13:54:28.000Z',
          confirmations: 1,
          meta: {},
          token: null,
          dropped: false,
          coinAmount: '5 ETH',
          coinName: 'ethereum',
          feeCoinName: 'ethereum',
          feeAmount: '0 ETH',
          currencies: { ethereum: assets.ethereum.currency },
        },
        {
          txId: 'leg2-tx',
          error: null,
          date: '2025-10-01T13:54:28.000Z',
          confirmations: 1,
          meta: {},
          token: null,
          dropped: false,
          coinAmount: '-5 ETH',
          coinName: 'ethereum',
          feeCoinName: 'ethereum',
          feeAmount: '0 ETH',
          currencies: { ethereum: assets.ethereum.currency },
        },
      ],
      flare: [
        {
          txId: 'leg2-tx',
          error: null,
          date: '2025-10-01T13:54:28.000Z',
          confirmations: 1,
          meta: {},
          token: null,
          dropped: false,
          coinAmount: '1000 FLR',
          coinName: 'flare',
          feeCoinName: 'flare',
          feeAmount: '0 FLR',
          currencies: { flare: assets.flare.currency },
        },
      ],
    }

    handleEvent('activityTxs', {
      exodus_0: {
        algorand: txLogFixtures.algorand.map((tx) => Tx.fromJSON(tx)),
        ethereum: txLogFixtures.ethereum.map((tx) => Tx.fromJSON(tx)),
        flare: txLogFixtures.flare.map((tx) => Tx.fromJSON(tx)),
      },
    })
    handleEvent('orders', OrderSet.fromArray([CHAINED_ORDER]))

    // Bridge asset (ETH): both legs suppressed, nothing shown.
    const ethSelector = selectors.activityTxs.createAssetSourceBaseActivity({
      assetName: 'ethereum',
      walletAccount: 'exodus_0',
    })
    expect(ethSelector(store.getState())).toEqual([])

    // Source asset (ALGO): single swap row.
    const algoSelector = selectors.activityTxs.createAssetSourceBaseActivity({
      assetName: 'algorand',
      walletAccount: 'exodus_0',
    })
    const algoResult = algoSelector(store.getState())
    expect(algoResult.length).toEqual(1)
    expect(algoResult[0].type).toEqual('exchange')
    expect(algoResult[0].id).toEqual('swap.algorand.chained-algo-flr')

    // Destination asset (FLR): single swap row.
    const flrSelector = selectors.activityTxs.createAssetSourceBaseActivity({
      assetName: 'flare',
      walletAccount: 'exodus_0',
    })
    const flrResult = flrSelector(store.getState())
    expect(flrResult.length).toEqual(1)
    expect(flrResult[0].type).toEqual('exchange')
    expect(flrResult[0].id).toEqual('swap.flare.chained-algo-flr')
  })

  test('should suppress an orphaned bridge leg when the server linked only one leg', () => {
    const { store, selectors, handleEvent, assets } = setup()

    const CHAINED_ORDER = {
      orderId: 'chained-orphan-leg',
      status: 'complete-verified',
      fromAsset: 'algorand',
      toAsset: 'flare',
      fromTxId: 'leg2-tx',
      toTxId: 'leg2-tx',
      txIds: [{ txType: 'payoutTransaction', txId: 'leg2-tx' }],
      date: '2025-10-01T13:54:28.000Z',
      fromWalletAccount: 'exodus_0',
      toWalletAccount: 'exodus_0',
      fromAmount: assets.algorand.currency.defaultUnit(100),
      toAmount: assets.flare.currency.defaultUnit(1000),
      svc: 'chained',
      synced: true,
      region: 'INTL',
      displaySvc: 'chained',
      potentialToTxIds: [],
      _version: 1,
    }

    handleEvent('activityTxs', {
      exodus_0: {
        ethereum: [
          {
            txId: 'leg1-tx',
            error: null,
            date: '2025-10-01T13:54:28.000Z',
            confirmations: 1,
            meta: {},
            token: null,
            dropped: false,
            coinAmount: '5 ETH',
            coinName: 'ethereum',
            feeCoinName: 'ethereum',
            feeAmount: '0 ETH',
            currencies: { ethereum: assets.ethereum.currency },
          },
          {
            txId: 'leg2-tx',
            error: null,
            date: '2025-10-01T13:54:28.000Z',
            confirmations: 1,
            meta: {},
            token: null,
            dropped: false,
            coinAmount: '-5 ETH',
            coinName: 'ethereum',
            feeCoinName: 'ethereum',
            feeAmount: '0 ETH',
            currencies: { ethereum: assets.ethereum.currency },
          },
          {
            txId: 'unrelated-tx',
            error: null,
            date: '2025-10-02T13:54:28.000Z',
            confirmations: 1,
            meta: {},
            token: null,
            dropped: false,
            coinAmount: '3 ETH',
            coinName: 'ethereum',
            feeCoinName: 'ethereum',
            feeAmount: '0 ETH',
            currencies: { ethereum: assets.ethereum.currency },
          },
        ].map((tx) => Tx.fromJSON(tx)),
      },
    })
    handleEvent('orders', OrderSet.fromArray([CHAINED_ORDER]))

    const ethSelector = selectors.activityTxs.createAssetSourceBaseActivity({
      assetName: 'ethereum',
      walletAccount: 'exodus_0',
    })
    const ethResult = ethSelector(store.getState())

    expect(ethResult.length).toEqual(1)
    expect(ethResult[0].id).toEqual('ethereum.unrelated-tx')
  })

  test('should not hide an unrelated same-amount receive for a normally-linked chained swap', () => {
    const { store, selectors, handleEvent, assets } = setup()

    const CHAINED_ORDER = {
      orderId: 'chained-both-linked',
      status: 'complete-verified',
      fromAsset: 'algorand',
      toAsset: 'flare',
      fromTxId: 'leg1-tx',
      toTxId: 'leg2-tx',
      txIds: [
        { txType: 'depositTransaction', txId: 'leg1-tx' },
        { txType: 'payoutTransaction', txId: 'leg2-tx' },
      ],
      date: '2025-10-01T13:54:28.000Z',
      fromWalletAccount: 'exodus_0',
      toWalletAccount: 'exodus_0',
      fromAmount: assets.algorand.currency.defaultUnit(100),
      toAmount: assets.flare.currency.defaultUnit(1000),
      svc: 'chained',
      synced: true,
      region: 'INTL',
      displaySvc: 'chained',
      potentialToTxIds: [],
      _version: 1,
    }

    handleEvent('activityTxs', {
      exodus_0: {
        ethereum: [
          { txId: 'leg1-tx', coinAmount: '5 ETH' },
          { txId: 'leg2-tx', coinAmount: '-5 ETH' },
          { txId: 'gift-tx', coinAmount: '5 ETH' },
        ].map((tx) =>
          Tx.fromJSON({
            error: null,
            date: '2025-10-02T13:54:28.000Z',
            confirmations: 1,
            meta: {},
            token: null,
            dropped: false,
            coinName: 'ethereum',
            feeCoinName: 'ethereum',
            feeAmount: '0 ETH',
            currencies: { ethereum: assets.ethereum.currency },
            ...tx,
          })
        ),
      },
    })
    handleEvent('orders', OrderSet.fromArray([CHAINED_ORDER]))

    const ethSelector = selectors.activityTxs.createAssetSourceBaseActivity({
      assetName: 'ethereum',
      walletAccount: 'exodus_0',
    })
    const ethResult = ethSelector(store.getState())

    expect(ethResult.length).toEqual(1)
    expect(ethResult[0].id).toEqual('ethereum.gift-tx')
  })

  test('should keep bridge-asset leg visible while a chained swap is not complete', () => {
    const { store, selectors, handleEvent, assets } = setup()

    // Chained swap ALGO -> ETH(bridge) -> FLR that stalled after leg 1: the
    // bridge asset (ETH) was received but not yet sent. The user is genuinely
    // holding ETH, so the receive must stay visible — only completed swaps net
    // to zero and may be suppressed.
    const CHAINED_ORDER = {
      orderId: 'chained-stalled',
      status: 'in-progress',
      fromAsset: 'algorand',
      toAsset: 'flare',
      fromTxId: 'leg1-tx',
      txIds: [{ txType: 'depositTransaction', txId: 'leg1-tx' }],
      date: '2025-10-01T13:54:28.000Z',
      fromWalletAccount: 'exodus_0',
      toWalletAccount: 'exodus_0',
      fromAmount: assets.algorand.currency.defaultUnit(100),
      toAmount: assets.flare.currency.defaultUnit(1000),
      svc: 'chained',
      synced: true,
      region: 'INTL',
      displaySvc: 'chained',
      potentialToTxIds: [],
      _version: 1,
    }

    handleEvent('activityTxs', {
      exodus_0: {
        ethereum: [
          {
            txId: 'leg1-tx',
            error: null,
            date: '2025-10-01T13:54:28.000Z',
            confirmations: 1,
            meta: {},
            token: null,
            dropped: false,
            coinAmount: '5 ETH',
            coinName: 'ethereum',
            feeCoinName: 'ethereum',
            feeAmount: '0 ETH',
            currencies: { ethereum: assets.ethereum.currency },
          },
        ].map((tx) => Tx.fromJSON(tx)),
      },
    })
    handleEvent('orders', OrderSet.fromArray([CHAINED_ORDER]))

    const ethSelector = selectors.activityTxs.createAssetSourceBaseActivity({
      assetName: 'ethereum',
      walletAccount: 'exodus_0',
    })
    const ethResult = ethSelector(store.getState())

    expect(ethResult.length).toEqual(1)
    expect(ethResult[0].type).not.toEqual('exchange')
    expect(ethResult[0].id).toEqual('ethereum.leg1-tx')
  })

  test('should keep base-asset fee tx visible for a chained swap', () => {
    const { store, selectors, handleEvent, assets } = setup()

    // Chained swap ALGO -> FLR where the source-chain swap pays gas in the base
    // asset (ETH). The fee-only ETH tx is "neither from nor to asset" but is a
    // real one-way balance change, so it must NOT be suppressed like a bridge leg.
    const CHAINED_ORDER = {
      orderId: 'chained-with-fee',
      fromAsset: 'algorand',
      toAsset: 'flare',
      txIds: [{ txId: 'swap-tx-id' }],
      date: '2025-10-01T13:54:28.000Z',
      fromWalletAccount: 'exodus_0',
      toWalletAccount: 'exodus_0',
      fromAmount: assets.algorand.currency.defaultUnit(100),
      toAmount: assets.flare.currency.defaultUnit(1000),
      svc: 'chained',
      synced: true,
      region: 'INTL',
      displaySvc: 'chained',
      potentialToTxIds: [],
      _version: 1,
    }

    handleEvent('activityTxs', {
      exodus_0: {
        ethereum: [
          {
            txId: 'swap-tx-id',
            error: null,
            date: '2025-10-01T13:54:28.000Z',
            confirmations: 1,
            meta: {},
            token: null,
            dropped: false,
            coinAmount: '0 ETH',
            coinName: 'ethereum',
            feeCoinName: 'ethereum',
            feeAmount: '0.002 ETH',
            currencies: { ethereum: assets.ethereum.currency },
          },
        ].map((tx) => Tx.fromJSON(tx)),
      },
    })
    handleEvent('orders', OrderSet.fromArray([CHAINED_ORDER]))

    const ethSelector = selectors.activityTxs.createAssetSourceBaseActivity({
      assetName: 'ethereum',
      walletAccount: 'exodus_0',
    })
    const ethResult = ethSelector(store.getState())

    expect(ethResult.length).toEqual(1)
    expect(ethResult[0].type).not.toEqual('exchange')
    expect(ethResult[0].id).toEqual('ethereum.swap-tx-id')
  })

  test('should not treat base asset gas fee tx as swap activity', () => {
    const { store, selectors, handleEvent, assets } = setup()

    // Simulate ALGO -> FLR swap on Ethereum (using ETH for gas)
    // In a real-world scenario, this simulates token swaps like USDT -> USDC where ETH pays gas
    const ALGO_FLR_ORDER = {
      orderId: 'algo-flr-swap',
      fromAsset: 'algorand',
      toAsset: 'flare',
      txIds: [{ txId: 'swap-tx-id' }],
      date: '2025-10-01T13:54:28.000Z',
      fromWalletAccount: 'exodus_0',
      toWalletAccount: 'exodus_0',
      fromAmount: assets.algorand.currency.defaultUnit(100),
      toAmount: assets.flare.currency.defaultUnit(1000),
      svc: 'cn',
      synced: true,
      region: 'INTL',
      displaySvc: 'cn',
      potentialToTxIds: [],
      _version: 1,
    }

    const txLogFixtures = {
      // ETH transaction that only pays gas fee - should NOT be treated as swap
      ethereum: [
        {
          txId: 'swap-tx-id',
          error: null,
          date: '2025-10-01T13:54:28.000Z',
          confirmations: 1,
          meta: {},
          token: null,
          dropped: false,
          coinAmount: '0 ETH', // No ETH amount, only gas fee
          coinName: 'ethereum',
          feeCoinName: 'ethereum',
          feeAmount: '0.002 ETH',
          currencies: { ethereum: assets.ethereum.currency },
        },
      ],
      // ALGO transaction - should be treated as swap
      algorand: [
        {
          txId: 'swap-tx-id',
          error: null,
          date: '2025-10-01T13:54:28.000Z',
          confirmations: 1,
          meta: {},
          token: null,
          dropped: false,
          coinAmount: '-100 ALGO',
          coinName: 'algorand',
          feeCoinName: 'algorand',
          feeAmount: '0.001 ALGO',
          currencies: { algorand: assets.algorand.currency },
        },
      ],
      // FLR transaction - should be treated as swap
      flare: [
        {
          txId: 'swap-tx-id',
          error: null,
          date: '2025-10-01T13:54:28.000Z',
          confirmations: 1,
          meta: {},
          token: null,
          dropped: false,
          coinAmount: '1000 FLR',
          coinName: 'flare',
          feeCoinName: 'flare',
          feeAmount: '0 FLR',
          currencies: { flare: assets.flare.currency },
        },
      ],
    }

    handleEvent('activityTxs', {
      exodus_0: {
        ethereum: txLogFixtures.ethereum.map((tx) => Tx.fromJSON(tx)),
        algorand: txLogFixtures.algorand.map((tx) => Tx.fromJSON(tx)),
        flare: txLogFixtures.flare.map((tx) => Tx.fromJSON(tx)),
      },
    })
    handleEvent('orders', OrderSet.fromArray([ALGO_FLR_ORDER]))

    // Check ETH activity - should be treated as normal tx, not swap
    const ethSelector = selectors.activityTxs.createAssetSourceBaseActivity({
      assetName: 'ethereum',
      walletAccount: 'exodus_0',
    })
    const ethResult = ethSelector(store.getState())

    expect(ethResult.length).toEqual(1)
    expect(ethResult[0].type).not.toEqual('exchange')
    expect(ethResult[0].id).toEqual('ethereum.swap-tx-id')

    // Check ALGO activity - should be treated as swap
    const algoSelector = selectors.activityTxs.createAssetSourceBaseActivity({
      assetName: 'algorand',
      walletAccount: 'exodus_0',
    })
    const algoResult = algoSelector(store.getState())

    expect(algoResult.length).toEqual(1)
    expect(algoResult[0].type).toEqual('exchange')
    expect(algoResult[0].id).toEqual('swap.algorand.algo-flr-swap')

    // Check FLR activity - should be treated as swap
    const flrSelector = selectors.activityTxs.createAssetSourceBaseActivity({
      assetName: 'flare',
      walletAccount: 'exodus_0',
    })
    const flrResult = flrSelector(store.getState())

    expect(flrResult.length).toEqual(1)
    expect(flrResult[0].type).toEqual('exchange')
    expect(flrResult[0].id).toEqual('swap.flare.algo-flr-swap')
  })

  test('should represent a swap by its swap leg even when a cleanup leg is newer', () => {
    const { store, selectors, handleEvent, assets } = setup()

    const BTC_ETH_ORDER = {
      orderId: 'btc-eth-cleanup-order',
      fromAsset: 'bitcoin',
      toAsset: 'ethereum',
      txIds: [
        { txType: 'swapTransaction', txId: 'swap-leg-tx' },
        { txType: 'cleanupTransaction', txId: 'cleanup-leg-tx' },
      ],
      date: '2025-10-01T13:54:28.000Z',
      fromWalletAccount: 'exodus_0',
      toWalletAccount: 'exodus_0',
      fromAmount: assets.bitcoin.currency.defaultUnit(0.1),
      toAmount: assets.ethereum.currency.defaultUnit(3),
    }

    handleEvent('activityTxs', {
      exodus_0: {
        bitcoin: [
          {
            txId: 'swap-leg-tx',
            error: null,
            date: '2025-10-01T13:54:28.000Z',
            confirmations: 1,
            meta: {},
            token: null,
            dropped: false,
            coinAmount: '-0.1 BTC',
            coinName: 'bitcoin',
            feeCoinName: 'bitcoin',
            feeAmount: '0.00002 BTC',
            currencies: { bitcoin: assets.bitcoin.currency },
          },
          {
            txId: 'cleanup-leg-tx',
            error: null,
            date: '2025-10-01T14:10:00.000Z',
            confirmations: 1,
            meta: {},
            token: null,
            dropped: false,
            coinAmount: '-0.001 BTC',
            coinName: 'bitcoin',
            feeCoinName: 'bitcoin',
            feeAmount: '0.00002 BTC',
            currencies: { bitcoin: assets.bitcoin.currency },
          },
        ].map((tx) => Tx.fromJSON(tx)),
      },
    })
    handleEvent('orders', OrderSet.fromArray([BTC_ETH_ORDER]))

    const selector = selectors.activityTxs.createAssetSourceBaseActivity({
      assetName: 'bitcoin',
      walletAccount: 'exodus_0',
    })

    const result = selector(store.getState())

    expect(result.length).toEqual(1)
    expect(result[0].id).toEqual('swap.bitcoin.btc-eth-cleanup-order')
    expect(result[0].type).toEqual('exchange')
    expect(result[0].tx.txId).toEqual('swap-leg-tx')
    expect(result[0].date).toEqual(new Date('2025-10-01T13:54:28.000Z'))
  })

  test('should keep an in-flight swap visible as exchange when only the approval leg is indexed', () => {
    const { store, selectors, handleEvent, assets } = setup()

    const ETH_BTC_ORDER = {
      orderId: 'eth-btc-approval-order',
      status: 'in-progress',
      fromAsset: 'ethereum',
      toAsset: 'bitcoin',
      txIds: [{ txType: 'setupTransaction', txId: 'approval-leg-tx' }],
      date: '2025-10-01T13:54:28.000Z',
      fromWalletAccount: 'exodus_0',
      toWalletAccount: 'exodus_0',
      fromAmount: assets.ethereum.currency.defaultUnit(1),
      toAmount: assets.bitcoin.currency.defaultUnit(0.05),
    }

    handleEvent('activityTxs', {
      exodus_0: {
        ethereum: [
          {
            txId: 'approval-leg-tx',
            error: null,
            date: '2025-10-01T13:54:28.000Z',
            confirmations: 1,
            meta: {},
            token: null,
            dropped: false,
            coinAmount: '0 ETH',
            coinName: 'ethereum',
            feeCoinName: 'ethereum',
            feeAmount: '0.002 ETH',
            currencies: { ethereum: assets.ethereum.currency },
          },
        ].map((tx) => Tx.fromJSON(tx)),
      },
    })
    handleEvent('orders', OrderSet.fromArray([ETH_BTC_ORDER]))

    const selector = selectors.activityTxs.createAssetSourceBaseActivity({
      assetName: 'ethereum',
      walletAccount: 'exodus_0',
      displayOrderWithoutTx: true,
    })

    const result = selector(store.getState())

    expect(result.length).toEqual(1)
    expect(result[0].id).toEqual('swap.ethereum.eth-btc-approval-order')
    expect(result[0].type).toEqual('exchange')
    expect(result[0].pending).toEqual(true)
  })
})
