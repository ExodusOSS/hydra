import assets from '../../__tests__/assets.js'
import type { OrderProps } from '../index.js'
import Order from '../index.js'

test('can create an order', () => {
  const order = Order.fromJSON({
    orderId: '1',
    svc: 'ch',
  })
  expect(order.toJSON()).toMatchObject({
    fromWalletAccount: 'exodus_0',
    orderId: '1',
    toWalletAccount: 'exodus_0',
  })
  expect(order.toAddress).toBeUndefined()
})

test('can create an order with toAddress for third-party withdrawals', () => {
  const order = Order.fromJSON({
    orderId: '1',
    svc: 'ch',
    toAddress: '0x1234567890abcdef',
  })
  expect(order.toAddress).toBe('0x1234567890abcdef')
  expect(order.toJSON()).toMatchObject({
    orderId: '1',
    toAddress: '0x1234567890abcdef',
  })
  expect(order.toRedactedJSON()).toMatchObject({
    orderId: '1',
    toAddress: '0x1234567890abcdef',
  })
})

describe('equals', () => {
  // satisfies Required<OrderProps> ensures all OrderProps fields are present
  // adding a new field to OrderProps without updating base causes a compile error.
  const base = {
    orderId: '1',
    svc: 'cn',
    appName: 'exodus-mobile',
    status: 'in-progress',
    synced: true,
    fromTxId: 'from-tx',
    toTxId: 'to-tx',
    message: 'hello',
    potentialToTxIds: ['ptx-1'],
    txIds: [{ txId: 'from-tx', type: 'depositTransaction' }],
    errorDetails: { code: 'ERR' },
    fromAmount: assets.bitcoin.currency.BTC(1),
    toAmount: assets.ethereum.currency.ETH(10),
    fromAsset: 'bitcoin',
    toAsset: 'ethereum',
    fromWalletAccount: 'exodus_0',
    toWalletAccount: 'exodus_0',
    toAddress: '0xabc',
    displaySvc: 'ChangeNow',
    svcOptions: { foo: 'bar' },
    region: 'INTL',
    slippage: 0.5,
    date: new Date('2024-01-01'),
  } satisfies Required<OrderProps>

  const alternates = {
    orderId: '2',
    appName: 'exodus-pay',
    status: 'complete-verified',
    synced: false,
    fromTxId: 'other-from-tx',
    toTxId: 'other-to-tx',
    message: 'other',
    potentialToTxIds: ['ptx-2'],
    txIds: [{ txId: 'other', type: 'depositTransaction' }],
    errorDetails: { code: 'OTHER' },
    fromAmount: assets.bitcoin.currency.BTC(2),
    toAmount: assets.ethereum.currency.ETH(20),
    fromAsset: 'solana',
    toAsset: 'solana',
    fromWalletAccount: 'exodus_1',
    toWalletAccount: 'exodus_1',
    toAddress: '0xdef',
    displaySvc: 'Other',
    svc: 'ch',
    svcOptions: { foo: 'baz' },
    region: 'US',
    slippage: 1.2,
    date: new Date('2020-01-01'),
  } satisfies Record<keyof OrderProps, unknown>

  it('returns true for the same reference', () => {
    const order = Order.fromJSON(base)
    expect(order.equals(order)).toBe(true)
  })

  it('returns true for different instances with identical values', () => {
    expect(Order.fromJSON(base).equals(Order.fromJSON(base))).toBe(true)
  })

  it('covers all Order own properties', () => {
    const orderFields = Object.keys(Order.fromJSON(base)).filter((k) => k !== '_version')
    expect(Object.keys(alternates).sort((a, b) => a.localeCompare(b))).toEqual(
      [...orderFields].sort((a, b) => a.localeCompare(b))
    )
  })

  describe('returns false when any field changes', () => {
    for (const [field, alternateValue] of Object.entries(alternates)) {
      it(field, () => {
        expect(
          Order.fromJSON(base).equals(Order.fromJSON({ ...base, [field]: alternateValue }))
        ).toBe(false)
      })
    }
  })
})

describe('error handling', () => {
  it('Should return object when error present', () => {
    const order = Order.fromJSON({
      orderId: '1',
      svc: 'jup-sol',
      status: 'failed-final',
      errorDetails: {
        code: '0x0',
        message: 'Failed',
      },
    })

    expect(order.errorDetails).toMatchObject({
      code: '0x0',
      message: 'Failed',
    })
  })
  it('Should return boolean when error not present but status is failure', () => {
    const order = Order.fromJSON({
      orderId: '1',
      svc: 'jup-sol',
      status: 'failed-final',
    })

    expect(order.error).toBe(true)
  })
  it('Should return false when status not failure', () => {
    const order = Order.fromJSON({
      orderId: '1',
      svc: 'jup-sol',
      status: 'complete-verified',
    })

    expect(order.error).toBe(false)
  })
})
