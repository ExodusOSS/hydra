import { BUY_ORDER, SELL_ORDER } from '@exodus/fiat-ramp/redux/__tests__/fixture.js'
import { FiatOrderSet, Tx } from '@exodus/models'

import { setup } from '../utils.js'

describe('createWithFiatActivity', () => {
  test('should return empty array of activities in wallet', () => {
    const { store, selectors } = setup()
    const createSelector = selectors.activityTxs.createWithFiatActivity({
      createActivitySelector: selectors.activityTxs.createAssetSourceBaseActivity,
    })

    const selector = createSelector({
      assetName: 'ethereum',
      walletAccount: 'exodus_0',
    })

    expect(selector(store.getState())).toEqual([])
  })

  test('should add fiatOrder to activity props', () => {
    const { store, selectors, handleEvent, assets } = setup()

    const txLogFixtures = {
      ethereum: [
        {
          txId: 'buy-order-tx',
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
      ],
    }

    handleEvent('fiatOrders', FiatOrderSet.fromArray([{ ...BUY_ORDER, toAsset: 'ethereum' }]))

    handleEvent('activityTxs', {
      exodus_0: {
        ethereum: txLogFixtures.ethereum.map((tx) => Tx.fromJSON(tx)),
      },
    })

    const createSelector = selectors.activityTxs.createWithFiatActivity({
      createActivitySelector: selectors.activityTxs.createAssetSourceBaseActivity,
    })

    const selector = createSelector({
      assetName: 'ethereum',
      walletAccount: 'exodus_0',
    })

    const result = selector(store.getState())

    expect(result.length).toEqual(1)
    expect(result[0].id).toEqual('ethereum.buy-order-tx')
    expect(result[0].type).toEqual('fiat')
    expect(result[0].fiatOrder.toJSON()).toEqual({
      date: '2023-07-11T15:10:42.226Z',
      exodusRate: 35,
      fiatValue: 22,
      fromAddress: null,
      fromAmount: 42,
      fromAsset: 'USD',
      fromWalletAccount: null,
      orderId: 'buy-order',
      orderType: 'buy',
      provider: 'ramp',
      providerRate: 32,
      status: '',
      toAddress: 'toAddress',
      toAmount: 42,
      toAsset: 'ethereum',
      toWalletAccount: 'exodus_0',
      txId: 'buy-order-tx',
    })
  })

  test('should return same activity if no fiat orders added', () => {
    const { store, selectors, handleEvent, assets } = setup()

    const txLogFixtures = {
      ethereum: [
        {
          txId: 'some-tx',
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
      ],
    }

    handleEvent('fiatOrders', FiatOrderSet.fromArray([BUY_ORDER]))

    handleEvent('activityTxs', {
      exodus_0: {
        ethereum: txLogFixtures.ethereum.map((tx) => Tx.fromJSON(tx)),
      },
    })

    const createBaseSelector = selectors.activityTxs.createAssetSourceBaseActivity

    const createSelector = selectors.activityTxs.createWithFiatActivity({
      createActivitySelector: createBaseSelector,
    })

    const assetSource = {
      assetName: 'ethereum',
      walletAccount: 'exodus_0',
    }

    const selector = createSelector(assetSource)

    const result = selector(store.getState())
    const baseSelectorResult = createBaseSelector(assetSource)(store.getState())

    expect(result.length).toEqual(1)
    expect(result).toEqual(baseSelectorResult)
    expect(result[0].id).toEqual('ethereum.some-tx')
    expect(result[0].type).toEqual('rx')
    expect(result[0].fiatOrder).toEqual(undefined)
  })

  test('should add fiat orders without tx to activity', () => {
    const { store, selectors, handleEvent } = setup()

    handleEvent(
      'fiatOrders',
      FiatOrderSet.fromArray([
        { ...BUY_ORDER, txId: null, orderId: 'buy-in-progress-order-id', status: 'in-progress' },
        {
          ...SELL_ORDER,
          fromWalletAccount: 'exodus_0',
          toWalletAccount: null,
          txId: null,
          orderId: 'sell-in-progress-order-id',
          status: 'in-progress',
        },
        {
          ...SELL_ORDER,
          fromWalletAccount: 'exodus_0',
          toWalletAccount: null,
          txId: null,
          orderId: 'failed-order-id',
          status: 'PAYMENT_FAILED',
        },
        {
          ...SELL_ORDER,
          fromWalletAccount: 'exodus_1',
          toWalletAccount: null,
          txId: null,
          orderId: 'sell-in-progress-order-id-from-exodus_1',
          status: 'in-progress',
        },
      ])
    )

    handleEvent('activityTxs', {
      exodus_0: {
        bitcoin: [],
      },
    })

    const createSelector = selectors.activityTxs.createWithFiatActivity({
      createActivitySelector: selectors.activityTxs.createAssetSourceBaseActivity,
    })

    const selector = createSelector({
      assetName: 'bitcoin',
      walletAccount: 'exodus_0',
      displayFiatOrdersWithoutTx: true,
    })

    const result = selector(store.getState())

    expect(result.length).toEqual(3)
    expect(result[0].id).toEqual('bitcoin.fiat-order-without-tx.buy-in-progress-order-id')
    expect(result[0].type).toEqual('fiat')
    expect(result[0].pending).toEqual(true)
    expect(result[0].fiatOrder.orderId).toEqual('buy-in-progress-order-id')
    expect(result[0].date).toEqual(new Date('2023-07-11T15:10:42.226Z'))

    expect(result[1].id).toEqual('bitcoin.fiat-order-without-tx.sell-in-progress-order-id')
    expect(result[1].type).toEqual('fiat')
    expect(result[1].pending).toEqual(true)
    expect(result[1].fiatOrder.orderId).toEqual('sell-in-progress-order-id')
    expect(result[1].date).toEqual(new Date('2023-02-11T15:10:42.226Z'))

    expect(result[2].id).toEqual('bitcoin.fiat-order-without-tx.failed-order-id')
    expect(result[2].type).toEqual('fiat')
    expect(result[2].pending).toEqual(false)
    expect(result[2].fiatOrder.orderId).toEqual('failed-order-id')
    expect(result[2].date).toEqual(new Date('2023-02-11T15:10:42.226Z'))
  })
})
