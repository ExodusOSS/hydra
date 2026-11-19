import Order from '../../order/index.js'
import OrderSet from '../index.js'

test('filter() should filter items using callbackFn', () => {
  const o1 = Order.fromJSON({
    orderId: '123-456',
    fromAsset: 'ethereum',
    svc: 'ss',
    fromTxId: '0x123',
  })

  const o2 = Order.fromJSON({
    orderId: '123-456',
    toAsset: 'litecoin',
    fromTxId: '0x123',
    txIds: [
      { txId: 'some-tx-id-1', type: 'setup' },
      { txId: 'some-tx-id-2', type: 'cleanup' },
    ],
  })

  const orderSet = OrderSet.fromArray([o1, o2])

  const filteredOrderSet = orderSet.filter((order) => {
    return order.toAsset === 'litecoin'
  })

  expect(filteredOrderSet).toEqual(OrderSet.fromArray([o2]))
})
