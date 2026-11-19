import Order from '../../order/index.js'
import OrderSet from '../index.js'

test('getByTxId()', () => {
  let os = OrderSet.EMPTY
  const o1 = Order.fromJSON({
    orderId: '123-456',
    fromAsset: 'bitcoin',
    fromTxId: '3ff',
    toTxId: '2aa',
  })
  const o2 = Order.fromJSON({
    orderId: 'ex-789',
    fromAsset: 'bitcoin',
    fromTxId: '432d',
    toTxId: '0x123',
  })
  os = os.add(o1)
  os = os.add(o2)

  const o1n0 = os.getByTxId('3ff')
  const o1n1 = os.getByTxId('2aa')
  const o2n0 = os.getByTxId('432d')
  const o2n1 = os.getByTxId('0x123')

  const oundef = os.getByTxId('0xfff')

  expect(o1).toBe(o1n0)
  expect(o1).toBe(o1n1)
  expect(o2).toBe(o2n0)
  expect(o2).toBe(o2n1)

  expect(oundef).toBeUndefined()
})

test('getByTxId() after update()', () => {
  let os = OrderSet.EMPTY
  const o1 = Order.fromJSON({
    orderId: '123-456',
    fromAsset: 'bitcoin',
    fromTxId: '3ff',
    toTxId: '2aa',
  })
  let o2 = Order.fromJSON({ orderId: 'ex-789', fromAsset: 'bitcoin', fromTxId: '432d' })
  os = os.add(o1)
  os = os.add(o2)

  o2 = o2.update({ toTxId: '0x123' })
  os = os.update([o2])
  const o2n1 = os.getByTxId('0x123')

  expect(o2).toEqual(o2n1)
  expect(o2).not.toBe(o2n1)
})
