import test from '../../../_test.js'
import OrderSet from '../index.js'
import { orderFromJSONLegacy } from '../../order/util.js'
import assets from '../../__tests__/assets.js'
import fixtures from './fixtures/index.cjs'

const _fullList = fixtures.orders1Legacy
const fullList = _fullList.map((item) => orderFromJSONLegacy(item, { assets }))

const items1 = fullList.slice(0, 4) // Reducing the size of the input.
describe('OrderSet.delete', () => {
  test('delete() should not delete a non existing item by id', (t) => {
    const orderSet1 = OrderSet.fromArray(items1)
    const orderSetA = orderSet1.delete('dummy')
    t.deepEqual(orderSet1, orderSetA, 'sets are the same after no-op delete')
    t.equals(orderSet1.size, 4)
    t.equals(orderSetA.size, 4)
    t.end()
  })

  test('delete() should not delete a non existing item by object', (t) => {
    const orderSet1 = OrderSet.fromArray(items1)
    const orderSetA = orderSet1.delete(fullList[5])
    t.deepEqual(orderSet1, orderSetA, 'sets are the same after no-op delete')
    t.equals(orderSet1.size, 4)
    t.equals(orderSetA.size, 4)
    t.end()
  })

  test('delete() should delete existing item by id', (t) => {
    const orderSet1 = OrderSet.fromArray(items1)
    const itemToDelete = orderSet1.getAt(2)
    const orderSetA = orderSet1.delete(itemToDelete.orderId)
    const items1WithoutItem = OrderSet.fromArray(
      items1.filter((item) => item.orderId !== itemToDelete.orderId)
    )
    t.deepEqual(orderSetA, items1WithoutItem, 'sets removes index 2 by orderId')
    t.equals(orderSet1.size, 4)
    t.equals(orderSetA.size, 3)
    t.end()
  })

  test('delete() should delete existing item by object', (t) => {
    const orderSet1 = OrderSet.fromArray(items1)
    const itemToDelete = orderSet1.getAt(2)
    const orderSetA = orderSet1.delete(itemToDelete)
    const items1WithoutItem = OrderSet.fromArray(
      items1.filter((item) => item.orderId !== itemToDelete.orderId)
    )
    t.deepEqual(orderSetA, items1WithoutItem, 'sets removes index 2 by object')
    t.equals(orderSet1.size, 4)
    t.equals(orderSetA.size, 3)
    t.end()
  })

  test('delete() should not return orders from txIds after delete', (t) => {
    const orderSet1 = OrderSet.fromArray(items1)
    t.equals(orderSet1.getByTxId('cleanup-tx-id').orderId, items1[0].orderId)
    const itemToDelete = orderSet1.getAt(0)
    const orderSetA = orderSet1.delete(itemToDelete)

    t.equals(orderSetA.getByTxId('cleanup-tx-id'))
    t.equals(orderSetA.size, 3)
    t.end()
  })
})
