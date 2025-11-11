import NumberUnit from '@exodus/currency'
// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'

import assets from '../../__tests__/assets.js'
import { serialize } from '../../account-state/index.js'
import type { Provider, StatusByProvider } from '../constants.js'
import {
  MOONPAY_ORDER_STATUS,
  ORDER_STATUS,
  ORDER_STATUS_TO_BLOCKCHAIN_STATUS,
  ORDER_STATUS_TO_MOONPAY_STATUS,
  ORDER_STATUS_TO_ONRAMPER_STATUS,
  ORDER_STATUS_TO_PAYPAL_STATUS,
  ORDER_STATUS_TO_RAMP_STATUS,
  ORDER_STATUS_TO_SARDINE_STATUS,
  ORDER_STATUS_TO_XOPAY_STATUS,
} from '../constants.js'
import FiatOrder, { adapter, fusionOrderToOrderAdapter } from '../index.js'

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
  status: MOONPAY_ORDER_STATUS.pending,
  toAddress: null,
  toAmount: 40.35,
  toAsset: 'EUR',
  toWalletAccount: 'exodus_0',
  txId: 'c159af6b1386a73543878a44ceef04a5da89cf9c22317e2cf6664fa7eb441359',
  paymentMethodType: 'card',
} as const

test('can deserialize order', () => {
  const order = FiatOrder.fromJSON(serializedOrder)

  expect(order instanceof FiatOrder).toBeTruthy()
  expect(order.date instanceof Date).toBeTruthy()
  expect(order.date.toISOString()).toEqual(serializedOrder.date)
  expect(order.fromAmount instanceof NumberUnit).toBeTruthy()
  expect((order.fromAmount as NumberUnit).toDefaultString({ unit: true })).toBe('0.0015 BTC')
  expect(order.paymentMethodType).toBe('card')
})

test('can serialize order', () => {
  const order = FiatOrder.fromJSON(serializedOrder)

  expect(order.toJSON()).toEqual(serializedOrder)
})

test('can update order', () => {
  const status = 'failed'
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
  } as const

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
    paymentMethodType: 'bank',
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
  const order1 = FiatOrder.fromJSON({ ...serializedOrder, status: MOONPAY_ORDER_STATUS.pending })
  const order2 = FiatOrder.fromJSON({ ...serializedOrder, status: MOONPAY_ORDER_STATUS.completed })

  expect(order1.equals(order2)).toBe(false)
})

describe('lodash isEqual', () => {
  test('order equals its copy', () => {
    const order1 = FiatOrder.fromJSON(serializedOrder)
    const order2 = FiatOrder.fromJSON(serializedOrder)

    expect(isEqual(order1, order2)).toBe(true)
  })

  test('two orders with different status are not equal', () => {
    const order1 = FiatOrder.fromJSON({ ...serializedOrder, status: MOONPAY_ORDER_STATUS.pending })
    const order2 = FiatOrder.fromJSON({
      ...serializedOrder,
      status: MOONPAY_ORDER_STATUS.completed,
    })

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

describe('types', () => {
  test('cant pass invalid status for provider', () => {
    FiatOrder.fromJSON({
      ...serializedOrder,
      // @ts-expect-error -- invalid status for moonpay, should we make this throw at runtime?
      status: 'FAILED',
    })
  })
})

describe('toRedactedJSON()', () => {
  test('returns expected fields for sell order', () => {
    const order = FiatOrder.fromJSON(serializedOrder)
    const redacted = order.toRedactedJSON()

    expect(redacted).toEqual({
      cryptoAmount: serializedOrder.fromAmount,
      cryptoAsset: 'bitcoin',
      date: serializedOrder.date,
      exodusRate: order.exodusRate,
      exodusStatus: 'in-progress',
      fees: order.fees,
      fiatValue: serializedOrder.fiatValue,
      fromAmount: serializedOrder.fromAmount,
      fromAsset: order.fromAsset,
      isBuy: false,
      isSell: true,
      orderId: order.orderId,
      orderType: order.orderType,
      provider: order.provider,
      providerOrderId: order.providerOrderId,
      providerRate: order.providerRate,
      status: order.status,
      toAddress: order.toAddress,
      toAmount: serializedOrder.toAmount,
      toAsset: order.toAsset,
      toWalletAccount: order.toWalletAccount,
      txIds: [order.txId],
      paymentMethodType: order.paymentMethodType,
    })
  })

  test('returns expected fields for buy order', () => {
    const serializedBuyOrder = {
      ...serializedOrder,
      fromAddress: null,
      fromAmount: 40.35,
      fromAsset: 'EUR',
      orderType: 'buy',
      toAddress: 'tb1q8k9pw7yvrzurm4fs8wmmkyqwdkcvh5d7xmujj2',
      toAmount: serialize(assets.bitcoin.currency.parse('0.0015 BTC')),
      toAsset: 'bitcoin',
    }

    const order = FiatOrder.fromJSON(serializedBuyOrder)
    const redacted = order.toRedactedJSON()

    expect(redacted).toEqual({
      cryptoAmount: serializedBuyOrder.toAmount,
      cryptoAsset: 'bitcoin',
      date: serializedBuyOrder.date,
      exodusRate: order.exodusRate,
      exodusStatus: 'in-progress',
      fees: order.fees,
      fiatValue: order.fiatValue,
      fromAmount: serializedBuyOrder.fromAmount,
      fromAsset: order.fromAsset,
      isBuy: true,
      isSell: false,
      orderId: order.orderId,
      orderType: order.orderType,
      provider: order.provider,
      providerOrderId: order.providerOrderId,
      providerRate: order.providerRate,
      status: order.status,
      toAddress: order.toAddress,
      toAmount: serializedBuyOrder.toAmount,
      toAsset: order.toAsset,
      toWalletAccount: order.toWalletAccount,
      txIds: [order.txId],
      paymentMethodType: order.paymentMethodType,
    })
  })

  test('omits undefined values', () => {
    const order = FiatOrder.fromJSON({
      ...serializedOrder,
      providerOrderId: undefined,
      txId: undefined,
    })

    const redacted = order.toRedactedJSON()

    expect(redacted.txIds).toEqual([])
    expect(Object.hasOwn(redacted, 'providerOrderId')).toBe(false)
  })
})

test('throw on unknown provider', () => {
  expect(() =>
    FiatOrder.fromJSON({
      ...serializedOrder,
      provider: 'unknown' as Provider,
      status: 'unknown',
    })
  ).toThrow('invalid provider')
})

describe('order status', () => {
  const statusMappings = {
    alchemypay: ORDER_STATUS_TO_ONRAMPER_STATUS,
    banxa: ORDER_STATUS_TO_ONRAMPER_STATUS,
    blockchain: ORDER_STATUS_TO_BLOCKCHAIN_STATUS,
    binancep2p: ORDER_STATUS_TO_ONRAMPER_STATUS,
    btcdirect: ORDER_STATUS_TO_ONRAMPER_STATUS,
    coinify: ORDER_STATUS_TO_ONRAMPER_STATUS,
    dfx: ORDER_STATUS_TO_ONRAMPER_STATUS,
    fonbnk: ORDER_STATUS_TO_ONRAMPER_STATUS,
    gateconnect: ORDER_STATUS_TO_ONRAMPER_STATUS,
    gatefi: ORDER_STATUS_TO_ONRAMPER_STATUS,
    guardarian: ORDER_STATUS_TO_ONRAMPER_STATUS,
    koywe: ORDER_STATUS_TO_ONRAMPER_STATUS,
    localramp: ORDER_STATUS_TO_ONRAMPER_STATUS,
    moonpay: ORDER_STATUS_TO_MOONPAY_STATUS,
    neocrypto: ORDER_STATUS_TO_ONRAMPER_STATUS,
    onramper: ORDER_STATUS_TO_ONRAMPER_STATUS,
    onrampmoney: ORDER_STATUS_TO_ONRAMPER_STATUS,
    paypal: ORDER_STATUS_TO_PAYPAL_STATUS,
    ramp: ORDER_STATUS_TO_RAMP_STATUS,
    revolut: ORDER_STATUS_TO_ONRAMPER_STATUS,
    sardine: ORDER_STATUS_TO_SARDINE_STATUS,
    skrill: ORDER_STATUS_TO_ONRAMPER_STATUS,
    stripe: ORDER_STATUS_TO_ONRAMPER_STATUS,
    topper: ORDER_STATUS_TO_ONRAMPER_STATUS,
    transfi: ORDER_STATUS_TO_ONRAMPER_STATUS,
    utorg: ORDER_STATUS_TO_ONRAMPER_STATUS,
    xopay: ORDER_STATUS_TO_XOPAY_STATUS,
  } as Record<Provider, unknown>

  test.each(Object.entries(statusMappings))('get %s order status', (provider, statusMapping) => {
    for (const [status, providerStatuses] of Object.entries(statusMapping!)) {
      for (const providerStatus of providerStatuses!) {
        const order = FiatOrder.fromJSON({
          ...serializedOrder,
          provider: provider as Provider,
          status: providerStatus,
        })

        expect(order.exodusStatus).toBe(status)
      }
    }
  })

  test('provider unknown status', () => {
    const order = FiatOrder.fromJSON({
      ...serializedOrder,
      provider: 'moonpay',
      status: 'unknown' as StatusByProvider['moonpay'],
    })

    expect(order.exodusStatus).toBe('in-progress')
  })

  test('all status mappings should only contain valid status keys', () => {
    const VALID_STATUS_KEYS = [ORDER_STATUS.complete, ORDER_STATUS.failed, ORDER_STATUS.in_progress]

    for (const providerStatuses of Object.values(statusMappings)) {
      for (const status of Object.keys(providerStatuses!)) {
        expect(VALID_STATUS_KEYS).toContain(status)
      }
    }
  })
})
