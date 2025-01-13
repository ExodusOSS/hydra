import NumberUnit from '@exodus/currency'
import lodash from 'lodash'
import FiatOrder, { adapter, fusionOrderToOrderAdapter } from '../index.js'
import assets from '../../__tests__/assets.js'
import { serialize } from '../../account-state/index.js'
import { ORDER_STATUS } from '../constants.js'

const { isEqual } = lodash

const serializedOrder = {
  date: '2023-07-06T08:41:06.541Z',
  exodusRate: 1.084_99,
  fees: {
    networkFee: 0,
    providerFee: 2.05,
    processingFee: 0,
    totalFee: 2.559_999_999_999_999_6,
  },
  fiatValue: 40.35,
  fromAddress: 'tb1q8k9pw7yvrzurm4fs8wmmkyqwdkcvh5d7xmujj2',
  fromAmount: serialize(assets.bitcoin.currency.parse('0.0015 BTC')),
  fromAsset: 'bitcoin',
  fromWalletAccount: 'exodus_0',
  orderId: 'b370924a-79cb-4889-97a7-7a3c23625024',
  orderType: 'sell',
  provider: 'moonpay',
  providerOrderId: '5cd78be4-ec5c-46a4-90d2-3f525c50308b',
  providerRate: 1.084_99,
  status: ORDER_STATUS.in_progress,
  toAddress: null,
  toAmount: 40.35,
  toAsset: 'EUR',
  toWalletAccount: 'exodus_0',
  txId: 'c159af6b1386a73543878a44ceef04a5da89cf9c22317e2cf6664fa7eb441359',
}

test('can deserialize order', () => {
  const order = FiatOrder.fromJSON(serializedOrder)

  expect(order instanceof FiatOrder).toBeTruthy()
  expect(order.date instanceof Date).toBeTruthy()
  expect(order.date.toISOString()).toEqual(serializedOrder.date)
  expect(order.fromAmount instanceof NumberUnit).toBeTruthy()
  expect(order.fromAmount.toDefaultString({ unit: true })).toBe('0.0015 BTC')
})

test('can serialize order', () => {
  const order = FiatOrder.fromJSON(serializedOrder)

  expect(order.toJSON()).toEqual(serializedOrder)
})

test('can update order', () => {
  const status = 'cancelled'
  const order = FiatOrder.fromJSON(serializedOrder).update({ status })

  expect(order.status).toBe(status)
})

test('can adapt provider order', () => {
  const providerOrder = {
    createdAt: new Date('2023-07-06T08:41:06.541Z'),
    depositWalletAddress: undefined,
    depositedAt: null,
    extraFee: 0,
    fee: 0.102_079_207_920_792_07,
    from: { amount: 15, asset: 'EUR' },
    id: '1da40b96-1b9f-4594-b03e-931f17ac4fae',
    networkFee: 4.69,
    paymentMethod: 'MANUAL_BANK_TRANSFER',
    paymentMethodType: 'bank',
    provider: 'ramp',
    providerId: 'sdnh9sgzj93vtwf',
    providerToken: 'aw3w7oufrswatqtd',
    rate: 27_966.404_140_714_75,
    status: 'RELEASING',
    success: true,
    to: { amount: 0.000_365, asset: 'bitcoin' },
    totalFee: 4.792_079_207_920_792,
    txId: undefined,
    type: 'buy',
    updatedAt: new Date('2023-07-06T08:41:06.541Z'),
    walletAccount: 'exodus_0',
    walletAddress: 'tb1qasxruqs6a543tvelxdc5r625t2p2z3l4mexsvs',
  }

  const expected = {
    date: providerOrder.createdAt,
    exodusRate: 27_966.404_140_714_75,
    fees: {
      networkFee: 4.69,
      providerFee: 0.102_079_207_920_792_07,
      processingFee: 0,
      totalFee: 4.792_079_207_920_792,
    },
    fiatValue: 15,
    fromAddress: null,
    fromAmount: 15,
    fromAsset: 'EUR',
    fromWalletAccount: null,
    orderId: '1da40b96-1b9f-4594-b03e-931f17ac4fae',
    orderType: 'buy',
    provider: 'ramp',
    providerOrderId: 'sdnh9sgzj93vtwf',
    providerRate: 27_966.404_140_714_75,
    status: 'RELEASING',
    toAddress: 'tb1qasxruqs6a543tvelxdc5r625t2p2z3l4mexsvs',
    toAmount: serialize(assets.bitcoin.currency.defaultUnit(0.000_365)),
    toAsset: 'bitcoin',
    toWalletAccount: 'exodus_0',
    txId: undefined,
  }

  const order = adapter(providerOrder, assets)

  expect(order).toEqual(expected)
})

test('order equals its copy', () => {
  const order1 = FiatOrder.fromJSON(serializedOrder)
  const order2 = FiatOrder.fromJSON(serializedOrder)

  expect(order1.equals(order2)).toBe(true)
})

test('two orders with different ID are not equal', () => {
  const order1 = FiatOrder.fromJSON(serializedOrder)
  const order2 = FiatOrder.fromJSON({ ...serializedOrder, orderId: 'order2' })

  expect(order1.equals(order2)).toBe(false)
})

test('two orders with different status are not equal', () => {
  const order1 = FiatOrder.fromJSON({ ...serializedOrder, status: ORDER_STATUS.in_progress })
  const order2 = FiatOrder.fromJSON({ ...serializedOrder, statux: ORDER_STATUS.complete })

  expect(order1.equals(order2)).toBe(false)
})

describe('lodash isEqual', () => {
  test('order equals its copy', () => {
    const order1 = FiatOrder.fromJSON(serializedOrder)
    const order2 = FiatOrder.fromJSON(serializedOrder)

    expect(isEqual(order1, order2)).toBe(true)
  })

  test('two orders with different status are not equal', () => {
    const order1 = FiatOrder.fromJSON({ ...serializedOrder, status: ORDER_STATUS.in_progress })
    const order2 = FiatOrder.fromJSON({ ...serializedOrder, statux: ORDER_STATUS.complete })

    expect(isEqual(order1, order2)).toBe(false)
  })
})

describe('fusionOrderToOrderAdapter', () => {
  test('can pass through latest order version', () => {
    expect(fusionOrderToOrderAdapter(serializedOrder, assets)).toEqual(serializedOrder)
  })

  test('can serialize legacy orders', () => {
    expect(fusionOrderToOrderAdapter({ ...serializedOrder, fromAmount: 0.0015 }, assets)).toEqual(
      serializedOrder
    )
    expect(fusionOrderToOrderAdapter({ ...serializedOrder, fromAmount: '0.0015' }, assets)).toEqual(
      serializedOrder
    )
    expect(
      fusionOrderToOrderAdapter({ ...serializedOrder, fromAmount: '0.0015 BTC' }, assets)
    ).toEqual(serializedOrder)
  })

  test('can serialize legacy order with no amount', () => {
    const serializedOrder_ = fusionOrderToOrderAdapter(
      { ...serializedOrder, fromAmount: null },
      assets
    )

    expect(serializedOrder_.fromAmount).toEqual(serialize(assets.bitcoin.currency.defaultUnit(0)))
  })
})
