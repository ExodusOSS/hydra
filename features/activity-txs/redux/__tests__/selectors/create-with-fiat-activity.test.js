import { BUY_ORDER, SELL_ORDER } from '@exodus/fiat-ramp/redux/__tests__/fixture.js'
import { FIAT_ORDER, FiatOrderSet, Tx } from '@exodus/models'

import { setup } from '../utils.js'

const { MOONPAY_ORDER_STATUS, ORDER_STATUS, RAMP_ORDER_STATUS } = FIAT_ORDER

const TX_DATE = '2024-01-15T10:00:00.000Z'
const ORDER_DATE = '2024-01-15T09:55:00.000Z'

const makeBtcTx = ({ assets, txId, coinAmount, confirmations = 0, date = TX_DATE }) =>
  Tx.fromJSON({
    txId,
    error: null,
    date,
    confirmations,
    meta: {},
    token: null,
    dropped: false,
    coinAmount,
    coinName: 'bitcoin',
    feeCoinName: 'bitcoin',
    feeAmount: '0.0001 BTC',
    currencies: { bitcoin: assets.bitcoin.currency },
  })

const makeBtcOrder = ({
  assets,
  orderType,
  status,
  amountBtc,
  orderId,
  date = ORDER_DATE,
  walletAccount = 'exodus_0',
  provider, // optional override; otherwise inherited from SELL_ORDER/BUY_ORDER fixture (ramp)
}) => {
  const base = orderType === 'sell' ? SELL_ORDER : BUY_ORDER
  const amount = assets.bitcoin.currency.BTC(amountBtc)
  return {
    ...base,
    ...(provider && { provider }),
    date: date instanceof Date ? date : new Date(date),
    txId: null,
    orderId,
    status,
    ...(orderType === 'sell'
      ? { fromWalletAccount: walletAccount, toWalletAccount: null, fromAmount: amount }
      : {
          toWalletAccount: walletAccount,
          fromWalletAccount: null,
          toAsset: 'bitcoin',
          toAmount: amount,
        }),
  }
}

const runBitcoinSelector = ({ store, selectors, walletAccount = 'exodus_0' }) => {
  const selector = selectors.activityTxs.createWithFiatActivity({
    createActivitySelector: selectors.activityTxs.createAssetSourceBaseActivity,
  })({ assetName: 'bitcoin', walletAccount, displayFiatOrdersWithoutTx: true })
  return selector(store.getState())
}

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
    const firstOrderId = 'first-order'
    const secondOrderId = 'second-order'
    const txId = 'buy-order-tx'

    const txLogFixtures = {
      ethereum: [
        {
          txId,
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

    handleEvent(
      'fiatOrders',
      FiatOrderSet.fromArray([
        { ...BUY_ORDER, toAsset: 'ethereum', orderId: firstOrderId },
        { ...BUY_ORDER, toAsset: 'ethereum', orderId: secondOrderId, fromAmount: 84 },
      ])
    )

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

    expect(result.length).toEqual(2)

    const sortedOrders = result.sort((a, b) => a.fiatOrder.orderId - b.fiatOrder.orderId)

    expect(sortedOrders[0].id).toEqual(`ethereum.${txId}.${firstOrderId}`)
    expect(sortedOrders[0].type).toEqual('fiat')
    expect(sortedOrders[0].fiatOrder.orderId).toEqual(firstOrderId)
    expect(sortedOrders[0].fiatOrder.fromAmount).toEqual(42)
    expect(sortedOrders[1].id).toEqual(`ethereum.${txId}.${secondOrderId}`)
    expect(sortedOrders[1].type).toEqual('fiat')
    expect(sortedOrders[1].fiatOrder.orderId).toEqual(secondOrderId)
    expect(sortedOrders[1].fiatOrder.fromAmount).toEqual(84)
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

  // Cases where the on-chain tx must collapse into the matching fiat order
  // (i.e. the duplicate row must disappear).
  test.each([
    {
      description: 'pending send tx + in-progress sell order (ramp PAYMENT_IN_PROGRESS)',
      orderType: 'sell',
      provider: 'ramp',
      rawStatus: RAMP_ORDER_STATUS.payment_in_progress,
      expectedPending: true,
      txCoinAmount: '-1 BTC',
      confirmations: 0,
      amountBtc: 1,
    },
    {
      description: 'confirmed send tx + completed sell order (ramp RELEASED)',
      orderType: 'sell',
      provider: 'ramp',
      rawStatus: RAMP_ORDER_STATUS.released,
      expectedPending: false,
      txCoinAmount: '-1 BTC',
      confirmations: 3,
      amountBtc: 1,
    },
    {
      description: 'confirmed receive tx + completed buy order (ramp RELEASED)',
      orderType: 'buy',
      provider: 'ramp',
      rawStatus: RAMP_ORDER_STATUS.released,
      expectedPending: false,
      txCoinAmount: '0.5 BTC',
      confirmations: 3,
      amountBtc: 0.5,
    },
    {
      description: 'pending send tx + action-required sell order (moonpay waitingForDeposit)',
      orderType: 'sell',
      provider: 'moonpay',
      rawStatus: MOONPAY_ORDER_STATUS.waiting_deposit,
      expectedPending: false,
      txCoinAmount: '-1 BTC',
      confirmations: 0,
      amountBtc: 1,
    },
    {
      description: 'send tx + refunding sell order (path-2 future fiat-server)',
      orderType: 'sell',
      provider: 'ramp',
      rawStatus: ORDER_STATUS.refunding,
      expectedPending: false,
      txCoinAmount: '-1 BTC',
      confirmations: 1,
      amountBtc: 1,
    },
  ])(
    'should collapse tx into matching fiat order: $description',
    ({
      orderType,
      provider,
      rawStatus,
      expectedPending,
      txCoinAmount,
      confirmations,
      amountBtc,
    }) => {
      const { store, selectors, handleEvent, assets } = setup()
      const orderId = `${orderType}-${rawStatus}-order`

      handleEvent(
        'fiatOrders',
        FiatOrderSet.fromArray([
          makeBtcOrder({ assets, orderType, provider, status: rawStatus, amountBtc, orderId }),
        ])
      )
      handleEvent('activityTxs', {
        exodus_0: {
          bitcoin: [
            makeBtcTx({ assets, txId: 'tx-under-test', coinAmount: txCoinAmount, confirmations }),
          ],
        },
      })

      const result = runBitcoinSelector({ store, selectors })

      expect(result.length).toEqual(1)
      expect(result[0].id).toEqual(`bitcoin.fiat-order-without-tx.${orderId}`)
      expect(result[0].type).toEqual('fiat')
      expect(result[0].pending).toEqual(expectedPending)
    }
  )

  // Cases where the tx and the fiat order must be shown side-by-side
  // (no false collapse).
  test.each([
    {
      description: 'amount does not match',
      orderType: 'sell',
      amountBtc: 1,
      txCoinAmount: '-0.5 BTC',
      txDate: TX_DATE,
      orderDate: ORDER_DATE,
    },
    {
      description: 'sell order with same-amount incoming tx (direction mismatch)',
      orderType: 'sell',
      amountBtc: 1,
      txCoinAmount: '1 BTC',
      txDate: TX_DATE,
      orderDate: ORDER_DATE,
    },
    {
      description: 'buy order with same-amount outgoing tx (direction mismatch)',
      orderType: 'buy',
      amountBtc: 0.5,
      txCoinAmount: '-0.5 BTC',
      txDate: TX_DATE,
      orderDate: ORDER_DATE,
    },
    {
      description: 'tx is outside the order match time window',
      orderType: 'sell',
      amountBtc: 1,
      txCoinAmount: '-1 BTC',
      txDate: '2024-06-15T10:00:00.000Z',
      orderDate: ORDER_DATE,
    },
  ])(
    'should not hide tx when $description',
    ({ orderType, amountBtc, txCoinAmount, txDate, orderDate }) => {
      const { store, selectors, handleEvent, assets } = setup()
      const orderId = 'unrelated-order'
      const txId = 'unrelated-tx'

      handleEvent(
        'fiatOrders',
        FiatOrderSet.fromArray([
          makeBtcOrder({
            assets,
            orderType,
            provider: 'ramp',
            status: RAMP_ORDER_STATUS.payment_in_progress,
            amountBtc,
            orderId,
            date: orderDate,
          }),
        ])
      )
      handleEvent('activityTxs', {
        exodus_0: {
          bitcoin: [makeBtcTx({ assets, txId, coinAmount: txCoinAmount, date: txDate })],
        },
      })

      const result = runBitcoinSelector({ store, selectors })

      expect(result.length).toEqual(2)
      const ids = result.map((item) => item.id)
      expect(ids).toContain(`bitcoin.${txId}`)
      expect(ids).toContain(`bitcoin.fiat-order-without-tx.${orderId}`)
    }
  )

  test('should not hide tx when fiat order date is not a finite timestamp (conservative)', () => {
    const { store, selectors, handleEvent, assets } = setup()
    const orderId = 'invalid-date-order'
    const txId = 'send-with-valid-date'

    handleEvent(
      'fiatOrders',
      FiatOrderSet.fromArray([
        makeBtcOrder({
          assets,
          orderType: 'sell',
          provider: 'ramp',
          status: RAMP_ORDER_STATUS.payment_in_progress,
          amountBtc: 1,
          orderId,
          date: new Date(Number.NaN),
        }),
      ])
    )
    handleEvent('activityTxs', {
      exodus_0: {
        bitcoin: [makeBtcTx({ assets, txId, coinAmount: '-1 BTC', date: TX_DATE })],
      },
    })

    const result = runBitcoinSelector({ store, selectors })

    expect(result.length).toEqual(2)
    const ids = result.map((item) => item.id)
    expect(ids).toContain(`bitcoin.${txId}`)
    expect(ids).toContain(`bitcoin.fiat-order-without-tx.${orderId}`)
  })

  // Orders in terminal/error states must never swallow a same-amount tx -
  // there is no on-chain counterpart anymore.
  test.each([
    {
      label: 'ramp PAYMENT_FAILED -> failed',
      provider: 'ramp',
      rawStatus: RAMP_ORDER_STATUS.payment_failed,
    },
    {
      label: 'ramp EXPIRED -> expired',
      provider: 'ramp',
      rawStatus: RAMP_ORDER_STATUS.expired,
    },
    {
      label: 'refunded (path-2 future fiat-server)',
      provider: 'ramp',
      rawStatus: ORDER_STATUS.refunded,
    },
    {
      label: 'error (path-2 future fiat-server)',
      provider: 'ramp',
      rawStatus: ORDER_STATUS.error,
    },
  ])(
    'should not hide tx with matching amount when fiat order is $label',
    ({ provider, rawStatus }) => {
      const { store, selectors, handleEvent, assets } = setup()
      const orderId = `terminal-sell-order-${rawStatus}`
      const txId = 'unrelated-send'

      handleEvent(
        'fiatOrders',
        FiatOrderSet.fromArray([
          makeBtcOrder({
            assets,
            orderType: 'sell',
            provider,
            status: rawStatus,
            amountBtc: 1,
            orderId,
          }),
        ])
      )
      handleEvent('activityTxs', {
        exodus_0: { bitcoin: [makeBtcTx({ assets, txId, coinAmount: '-1 BTC' })] },
      })

      const result = runBitcoinSelector({ store, selectors })

      expect(result.length).toEqual(2)
      const ids = result.map((item) => item.id)
      expect(ids).toContain(`bitcoin.${txId}`)
      expect(ids).toContain(`bitcoin.fiat-order-without-tx.${orderId}`)
    }
  )

  test('should only hide one pending tx per matching fiat order', () => {
    const { store, selectors, handleEvent, assets } = setup()

    handleEvent(
      'fiatOrders',
      FiatOrderSet.fromArray([
        makeBtcOrder({
          assets,
          orderType: 'sell',
          provider: 'ramp',
          status: RAMP_ORDER_STATUS.payment_in_progress,
          amountBtc: 1,
          orderId: 'pending-sell-order',
        }),
      ])
    )
    handleEvent('activityTxs', {
      exodus_0: {
        bitcoin: [
          makeBtcTx({ assets, txId: 'pending-send-tx-1', coinAmount: '-1 BTC' }),
          makeBtcTx({
            assets,
            txId: 'pending-send-tx-2',
            coinAmount: '-1 BTC',
            date: '2024-01-15T11:00:00.000Z',
          }),
        ],
      },
    })

    const result = runBitcoinSelector({ store, selectors })

    expect(result.length).toEqual(2)
    const ids = result.map((item) => item.id)
    expect(ids).toContain('bitcoin.fiat-order-without-tx.pending-sell-order')
    expect(ids.some((id) => id.startsWith('bitcoin.pending-send-tx'))).toEqual(true)
  })

  test('should hide both txs when two same-amount sell orders match two send txs', () => {
    // Edge case: two simultaneous sell orders for the same amount, two matching send txs.
    // Each order should consume exactly one tx slot; both order rows should be displayed.
    const { store, selectors, handleEvent, assets } = setup()

    handleEvent(
      'fiatOrders',
      FiatOrderSet.fromArray([
        makeBtcOrder({
          assets,
          orderType: 'sell',
          provider: 'ramp',
          status: RAMP_ORDER_STATUS.payment_in_progress,
          amountBtc: 1,
          orderId: 'sell-order-a',
          date: '2024-01-15T09:50:00.000Z',
        }),
        makeBtcOrder({
          assets,
          orderType: 'sell',
          provider: 'ramp',
          status: RAMP_ORDER_STATUS.payment_in_progress,
          amountBtc: 1,
          orderId: 'sell-order-b',
        }),
      ])
    )
    handleEvent('activityTxs', {
      exodus_0: {
        bitcoin: [
          makeBtcTx({ assets, txId: 'send-tx-1', coinAmount: '-1 BTC' }),
          makeBtcTx({
            assets,
            txId: 'send-tx-2',
            coinAmount: '-1 BTC',
            date: '2024-01-15T10:05:00.000Z',
          }),
        ],
      },
    })

    const result = runBitcoinSelector({ store, selectors })

    const ids = result.map((item) => item.id).sort()
    expect(ids).toEqual([
      'bitcoin.fiat-order-without-tx.sell-order-a',
      'bitcoin.fiat-order-without-tx.sell-order-b',
    ])
  })
})
