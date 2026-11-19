import assets from '../../__tests__/assets.js'
import Order from '../index.js'

const toString = (amount: any) => amount?.v?.v

test.each(['exodus-mobile', 'exodus-pay', undefined])(
  'preserves appName %s through serialization and order updates',
  (appName) => {
    const order = Order.fromJSON({ orderId: '12345', svc: 'ch', appName })
    const restored = Order.fromJSON(JSON.stringify(order))
    const updated = restored.update({ status: 'complete-verified' })

    expect(restored.appName).toBe(appName)
    expect(updated.appName).toBe(appName)
    expect(updated.toJSON().appName).toBe(appName)
    expect(updated.toRedactedJSON().appName).toBe(appName)
    if (appName === undefined) expect(updated.toJSON()).not.toHaveProperty('appName')
  }
)

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
