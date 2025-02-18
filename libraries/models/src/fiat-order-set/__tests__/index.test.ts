import lodash from 'lodash'

import assets from '../../__tests__/assets.js'
import { serialize } from '../../account-state/index.js'
import FiatOrder from '../../fiat-order/index.js'
import FiatOrderSet from '../../fiat-order-set/index.js'

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
  fromAmount: serialize(assets.bitcoin.currency.defaultUnit(0.0015)),
  fromAsset: 'bitcoin',
  fromWalletAccount: 'exodus_0',
  orderId: 'b370924a-79cb-4889-97a7-7a3c23625024',
  orderType: 'sell',
  provider: 'moonpay',
  providerOrderId: '5cd78be4-ec5c-46a4-90d2-3f525c50308b',
  providerRate: 1.084_99,
  status: 'completed',
  toAddress: null,
  toAmount: 40.35,
  toAsset: 'EUR',
  toWalletAccount: 'exodus_0',
  txId: 'c159af6b1386a73543878a44ceef04a5da89cf9c22317e2cf6664fa7eb441359',
} as const

test('can create FiatOrderSet', () => {
  const orderSet = FiatOrderSet.EMPTY

  expect(orderSet instanceof FiatOrderSet).toBeTruthy()
})

test('can create FiatOrderSet from array of orders', () => {
  const order = FiatOrder.fromJSON(serializedOrder)
  const orderSet = FiatOrderSet.fromArray([order])

  expect(orderSet instanceof FiatOrderSet).toBeTruthy()
  expect(orderSet.get('b370924a-79cb-4889-97a7-7a3c23625024') instanceof FiatOrder).toBeTruthy()
  expect(orderSet.toJSON().pop()).toEqual(serializedOrder)
})

test('can get order', () => {
  const order = FiatOrder.fromJSON(serializedOrder)
  const orderSet = FiatOrderSet.fromArray([order])

  expect(orderSet.get(order)).toBeTruthy()
})

test('can add new order', () => {
  const order = FiatOrder.fromJSON(serializedOrder)
  const orderSet = FiatOrderSet.fromArray()

  const updatedOrderSet = orderSet.add(order)

  expect(updatedOrderSet!.has(order)).toBeTruthy()
})

test('can update existing orders', () => {
  const order = FiatOrder.fromJSON(serializedOrder)
  const orderSet = FiatOrderSet.fromArray([order])

  const status = 'failed'
  const updatedOrder = order.update({ status })
  const updatedOrderSet = orderSet.update([updatedOrder])

  expect(updatedOrderSet.get(order)!.status).toBe(status)
})

test('can clone', () => {
  const order = FiatOrder.fromJSON(serializedOrder)
  const orderSet1 = FiatOrderSet.fromArray([order])
  const orderSet2 = orderSet1.clone()

  expect(orderSet1.equals(orderSet2)).toBeTruthy()
})

test('can delete', () => {
  const order = FiatOrder.fromJSON(serializedOrder)
  const orderSet = FiatOrderSet.fromArray([order])

  const updatedOrderSet = orderSet.delete(order)

  expect(updatedOrderSet!.size).toBe(0)
})

test('two sets with same order are equal', () => {
  const order1 = FiatOrder.fromJSON(serializedOrder)
  const set1 = FiatOrderSet.fromArray([order1])
  const set2 = FiatOrderSet.fromArray([order1])

  expect(set1.equals(set2)).toBe(true)
})

test('two sets with same order copy are equal', () => {
  const order1 = FiatOrder.fromJSON(serializedOrder)
  const order1Copy = FiatOrder.fromJSON(serializedOrder)
  const set1 = FiatOrderSet.fromArray([order1Copy])
  const set2 = FiatOrderSet.fromArray([order1])

  expect(set1.equals(set2)).toBe(true)
})

test('two sets with different orders are not equal', () => {
  const order1 = FiatOrder.fromJSON(serializedOrder)
  const order2 = FiatOrder.fromJSON({ ...serializedOrder, orderId: 'order2' })
  const set1 = FiatOrderSet.fromArray([order1])
  const set2 = FiatOrderSet.fromArray([order2])

  expect(set1.equals(set2)).toBe(false)
})

test('two sets of different size are not equal', () => {
  const order1 = FiatOrder.fromJSON(serializedOrder)
  const order2 = FiatOrder.fromJSON({ ...serializedOrder, orderId: 'order2' })
  const set1 = FiatOrderSet.fromArray([order1, order2])
  const set2 = FiatOrderSet.fromArray([order1])

  expect(set1.equals(set2)).toBe(false)
})

describe('lodash isEqual', () => {
  test('two sets with same order are equal', () => {
    const order1 = FiatOrder.fromJSON(serializedOrder)
    const set1 = FiatOrderSet.fromArray([order1])
    const set2 = FiatOrderSet.fromArray([order1])

    expect(isEqual(set1, set2)).toBe(true)
  })

  test('two sets with same order copy are equal', () => {
    const order1 = FiatOrder.fromJSON(serializedOrder)
    const order1Copy = FiatOrder.fromJSON(serializedOrder)
    const set1 = FiatOrderSet.fromArray([order1Copy])
    const set2 = FiatOrderSet.fromArray([order1])

    expect(isEqual(set1, set2)).toBe(true)
  })

  test('two sets with different orders are not equal', () => {
    const order1 = FiatOrder.fromJSON(serializedOrder)
    const order2 = FiatOrder.fromJSON({ ...serializedOrder, orderId: 'order2' })
    const set1 = FiatOrderSet.fromArray([order1])
    const set2 = FiatOrderSet.fromArray([order2])

    expect(isEqual(set1, set2)).toBe(false)
  })

  test('two sets of different size are not equal', () => {
    const order1 = FiatOrder.fromJSON(serializedOrder)
    const order2 = FiatOrder.fromJSON({ ...serializedOrder, orderId: 'order2' })
    const set1 = FiatOrderSet.fromArray([order1, order2])
    const set2 = FiatOrderSet.fromArray([order1])

    expect(isEqual(set1, set2)).toBe(false)
  })
})
