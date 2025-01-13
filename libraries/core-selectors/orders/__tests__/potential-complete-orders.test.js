import createPotentialCompleteOrdersSelector from '../potential-complete-orders.js'
import { Order, OrderSet } from '@exodus/models'
import assets from '../../_test/assets.js'

describe('createOrdersInProgressSelector', () => {
  const orders1 = [
    {
      orderId: '1',
      status: 'optimistic-complete',
      date: '2018-05-16T16:36:24.271Z',
      fromTxId: '0x2eb88d1c7d0e30649bb294822b0d7bba3db188ef1b64891c716fc1847a711389',
      toTxId: '0x6ed56ee5e96b23f8bf8132c0e9949bbf4a0a180a5a08e4c1c8d2c3eaef9a4882',
      fromAsset: 'ethereumclassic',
      fromAmount: assets.ethereumclassic.currency.parse('2.95542858 ETC'),
      toAsset: 'ethereum',
      toAmount: assets.ethereum.currency.parse('0.071703116045841745 ETH'),
      fromAmountUSD: '51.72 USD',
      toAmountUSD: '51.47 USD',
      svc: 'ch',
      fromWalletAccount: 'exodus_0',
      toWalletAccount: 'exodus_0',
    },
    {
      orderId: '3',
      status: 'potential-complete',
      date: '2018-05-16T16:36:24.271Z',
      fromTxId: '0x2eb88d1c7d0e30649bb294822b0d7bba3db188ef1b64891c716fc1847a711389',
      toTxId: '0x6ed56ee5e96b23f8bf8132c0e9949bbf4a0a180a5a08e4c1c8d2c3eaef9a4882',
      fromAsset: 'ethereumclassic',
      fromAmount: assets.ethereumclassic.currency.parse('2.95542858 ETC'),
      toAsset: 'ethereum',
      toAmount: assets.ethereum.currency.parse('0.071703116045841745 ETH'),
      fromAmountUSD: '51.72 USD',
      toAmountUSD: '51.47 USD',
      svc: 'ch',
      fromWalletAccount: 'exodus_1',
      toWalletAccount: 'exodus_3',
    },
  ]
  const orderSet1 = OrderSet.fromArray(orders1)
  const state = {}

  test('returns empty OrderSet when no orders', () => {
    const orderSetSelector = () => OrderSet.EMPTY
    const result = createPotentialCompleteOrdersSelector({
      orderSetSelector,
    })(state)
    expect(result).toBeInstanceOf(OrderSet)
    expect(result.size).toBe(0)
  })

  test('returns OrderSet with order in progress', () => {
    const orderSetSelector = () => orderSet1
    const result = createPotentialCompleteOrdersSelector({
      orderSetSelector,
    })(state)
    expect(result).toBeInstanceOf(OrderSet)
    expect([...result][0]).toBeInstanceOf(Order)
    expect([...result][0].orderId).toEqual('3')
  })
})
