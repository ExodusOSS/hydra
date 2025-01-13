import Order from '../../order/index.js'
import assets from '../../__tests__/assets.js'
import { orderFromJSONLegacy } from '../../order/util.js'
import { orderSetFromJSONLegacy } from '../util.js'
import OrderSet from '../index.js'
import fixtures from './fixtures/index.cjs'

const { orders1, orders1Legacy } = fixtures

test('fromArray() should convert an array of legacy orders into an OrderSet', () => {
  const os1 = orderSetFromJSONLegacy(orders1Legacy, { assets })

  expect(os1.size).toEqual(orders1Legacy.length)
  expect(
    orders1Legacy.every((order) => os1.has(orderFromJSONLegacy(order, { assets })))
  ).toBeTruthy()

  // verify txIDs are present
  const txIds = []
  for (const o of orders1Legacy) {
    txIds.push(o.fromTxId, o.toTxId)
  }

  expect(txIds.every((txId) => os1.getByTxId(txId))).toBeTruthy()

  const os2 = OrderSet.fromArray(os1.toJSON())

  expect(os2.equals(os1)).toEqual(true)
})

test('fromArray() should convert an array of versioned orders into an OrderSet', () => {
  const os1 = OrderSet.fromArray(orders1)

  expect(os1.size).toEqual(orders1.length)
  expect(orders1.every((order) => os1.has(Order.fromJSON(order)))).toBeTruthy()

  // verify txIDs are present
  const txIds = []
  for (const o of orders1) {
    txIds.push(o.fromTxId, o.toTxId)
  }

  expect(txIds.every((txId) => os1.getByTxId(txId))).toBeTruthy()

  const os2 = OrderSet.fromArray(os1.toJSON())

  expect(os2.equals(os1)).toEqual(true)
})
