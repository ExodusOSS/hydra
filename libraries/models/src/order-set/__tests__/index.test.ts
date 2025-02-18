import OrderSet from '../index.js'

test('can create an order set', () => {
  const orderSet = OrderSet.fromArray([
    {
      orderId: '1',
      svc: 'ch',
    },
  ])
  expect(orderSet.toJSON()).toMatchObject([
    {
      fromWalletAccount: 'exodus_0',
      orderId: '1',
      toWalletAccount: 'exodus_0',
    },
  ])
})
