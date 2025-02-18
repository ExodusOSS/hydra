import { isNumberUnit } from '@exodus/currency'

import assets from '../../__tests__/assets.js'
import { orderFromJSONLegacy } from '../../order/util.js'
import Order from '../index.js'

test('normalize date to Date', () => {
  const date = new Date()
  const o1 = Order.fromJSON({ orderId: '12345', date })

  expect(o1.date.getTime()).toEqual(date.getTime())

  const o2 = Order.fromJSON({ orderId: '23456', date: date.toISOString() })
  expect(o2.date.getTime()).toEqual(date.getTime())
})

test('normalize fromAmount / toAmount to NumberUnit', () => {
  const fromAmount = assets.bitcoin.currency.BTC(1)
  const toAmount = assets.ethereum.currency.ETH(10)
  const o1 = Order.fromJSON({
    orderId: '12345',
    fromAsset: 'bitcoin',
    toAsset: 'ethereum',
    fromAmount,
    toAmount,
  })

  expect(isNumberUnit(o1.fromAmount)).toBeTruthy()
  expect(isNumberUnit(o1.toAmount)).toBeTruthy()

  const o2 = orderFromJSONLegacy(
    {
      orderId: '12345',
      fromAsset: 'bitcoin',
      toAsset: 'ethereum',
      fromAmount: fromAmount.toString(),
      toAmount: toAmount.toString(),
    },
    { assets }
  )

  expect(isNumberUnit(o2.fromAmount)).toBeTruthy()
  expect(isNumberUnit(o2.toAmount)).toBeTruthy()
})

test('default service provider is ShapeShift', () => {
  const o = Order.fromJSON({ orderId: 'something' })
  expect(o.svc).toEqual('ss')
})

test('set service provider', () => {
  const o = Order.fromJSON({ orderId: 'something', svc: 'ch' })
  expect(o.svc).toEqual('ch')

  // 'xx' doesn't actually represent any known service provider, unlike 'ch' or 'ss'
  const o2 = Order.fromJSON({ orderId: 'something', svc: 'xx' })
  expect(o2.svc).toEqual('xx')
})
