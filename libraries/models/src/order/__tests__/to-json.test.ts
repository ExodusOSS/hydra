import assets from '../../__tests__/assets.js'
import Order from '../index.js'

const toString = (amount: any) => amount?.v?.v

test('date in toJSON() is a string', () => {
  const date = new Date()
  const o1 = Order.fromJSON({ orderId: '12345', date })

  expect(o1.toJSON().date).toEqual(date.toISOString())
})

test('fromAmount / toAmount in toJSON() is a string', () => {
  const fromAmount = assets.bitcoin.currency.BTC(1)
  const toAmount = assets.ethereum.currency.ETH(10)
  const o1 = Order.fromJSON({
    orderId: '12345',
    fromAsset: 'bitcoin',
    toAsset: 'ethereum',
    fromAmount,
    toAmount,
  })

  expect(toString(o1.toJSON().fromAmount)).toEqual('1 BTC')
  expect(toString(o1.toJSON().toAmount)).toEqual('10 ETH')
})
