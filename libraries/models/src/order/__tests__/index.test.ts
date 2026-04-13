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
