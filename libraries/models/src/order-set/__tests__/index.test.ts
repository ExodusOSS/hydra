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

test('toRedactedJSON returns array of redacted orders', () => {
  const orderSet = OrderSet.fromArray([
    {
      orderId: '1',
      svc: 'ch',
      fromWalletAccount: 'exodus_0',
      toWalletAccount: 'exodus_0',
      errorDetails: {
        message: 'top secret stuff in here',
      },
    },
  ])
  expect(orderSet.toRedactedJSON()).toMatchObject([
    {
      orderId: '1',
      fromWalletAccount: 'exodus_0',
      toWalletAccount: 'exodus_0',
      hasError: true,
    },
  ])
})
