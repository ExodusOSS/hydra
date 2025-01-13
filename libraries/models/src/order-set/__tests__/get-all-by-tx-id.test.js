import Order from '../../order/index.js'
import OrderSet from '../index.js'

test('getAllByTxId() should return all orders relevant to a txid', () => {
  let os = OrderSet.EMPTY
  const o1 = Order.fromJSON({
    orderId: '123-456',
    fromAsset: 'bitcoin',
    fromTxId: '3ff',
    toTxId: '0x123',
  })
  const o2 = Order.fromJSON({
    orderId: 'ex-789',
    fromAsset: 'bitcoin',
    fromTxId: '432d',
    toTxId: '0x123',
  })
  os = os.add(o1)
  os = os.add(o2)

  const foundOrders = os.getAllByTxId('0x123')
  expect(foundOrders.includes(o1)).toBeTruthy()
  expect(foundOrders.includes(o2)).toBeTruthy()

  expect(os.getAllByTxId('3ff').includes(o1)).toBeTruthy()
  expect(os.getAllByTxId('432d').includes(o2)).toBeTruthy()

  const empty = os.getAllByTxId('foobar')
  expect(empty).toEqual([])
})

test('getAllByTxId() after updating', () => {
  let os = OrderSet.EMPTY
  const o1 = Order.fromJSON({
    orderId: '123-456',
    fromAsset: 'bitcoin',
    fromTxId: '3ff',
    toTxId: '0x123',
  })
  const o2 = Order.fromJSON({
    orderId: 'ex-789',
    fromAsset: 'bitcoin',
    fromTxId: '432d',
    toTxId: 'ff942',
  })
  os = os.add(o1)
  os = os.add(o2)

  expect(os.getAllByTxId('3ff')).toEqual([o1])
  expect(os.getAllByTxId('0x123')).toEqual([o1])
  expect(os.getAllByTxId('432d')).toEqual([o2])
  expect(os.getAllByTxId('ff942')).toEqual([o2])

  const o3 = o2.update({ toTxId: '0x123' })
  os = os.update([o3])
  expect(o2).not.toEqual(o3)

  // getAllByTxId returns newest order first
  expect(os.getAllByTxId('3ff')).toEqual([o1])
  // Order by tx12 was "reindexed" when update changed the toTxId
  const orders = os.getAllByTxId('0x123')
  expect(orders).toHaveLength(2)
  expect(orders).toEqual(expect.arrayContaining([o3, o1]))
  expect(os.getAllByTxId('432d')).toEqual([o3])
  expect(os.getAllByTxId('ff942')).toEqual([])

  const empty = os.getAllByTxId('foobar')
  expect(empty).toEqual([])
})

test('getAllByTxId() returns txs from txIds', () => {
  let os = OrderSet.EMPTY
  const o1 = Order.fromJSON({
    orderId: '123-456',
    fromAsset: 'bitcoin',
    fromTxId: '3ff',
    toTxId: '0x123',
    txIds: [
      { txId: 'some-tx-id-1', type: 'setup' },
      { txId: 'some-tx-id-2', type: 'cleanup' },
    ],
  })
  os = os.add(o1)

  expect(os.getAllByTxId('0x123')).toEqual([o1])
  expect(os.getAllByTxId('3ff')).toEqual([o1])
  expect(os.getAllByTxId('some-tx-id-1')).toEqual([o1])
  expect(os.getAllByTxId('some-tx-id-2')).toEqual([o1])

  const empty = os.getAllByTxId('foobar')
  expect(empty).toEqual([])
})
