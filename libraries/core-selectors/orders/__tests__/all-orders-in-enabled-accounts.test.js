import { Order, orderFromJSONLegacy, OrderSet } from '@exodus/models'

import assets from '../../__tests__/assets.js'
import createAllOrdersInEnabledWalletAccountsSelector from '../all-orders-in-enabled-accounts.js'

describe('createAllOrdersInEnabledWalletAccountsSelector', () => {
  const orders1 = [
    {
      orderId: '1',
      status: 'complete-verified',
      date: '2018-05-16T16:36:24.271Z',
      fromTxId: '0x2eb88d1c7d0e30649bb294822b0d7bba3db188ef1b64891c716fc1847a711389',
      toTxId: '0x6ed56ee5e96b23f8bf8132c0e9949bbf4a0a180a5a08e4c1c8d2c3eaef9a4882',
      fromAsset: 'ethereumclassic',
      fromAmount: '2.95542858 ETC',
      toAsset: 'ethereum',
      toAmount: '0.071703116045841745 ETH',
      fromAmountUSD: '51.72 USD',
      toAmountUSD: '51.47 USD',
      svc: 'ch',
      fromWalletAccount: 'exodus_0',
      toWalletAccount: 'exodus_0',
    },
    {
      orderId: '2',
      status: 'complete-verified',
      date: '2018-05-16T16:36:24.271Z',
      fromTxId: '0x2eb88d1c7d0e30649bb294822b0d7bba3db188ef1b64891c716fc1847a711389',
      toTxId: '0x6ed56ee5e96b23f8bf8132c0e9949bbf4a0a180a5a08e4c1c8d2c3eaef9a4882',
      fromAsset: 'ethereumclassic',
      fromAmount: '2.95542858 ETC',
      toAsset: 'ethereum',
      toAmount: '0.071703116045841745 ETH',
      fromAmountUSD: '51.72 USD',
      toAmountUSD: '51.47 USD',
      svc: 'ch',
      fromWalletAccount: 'exodus_1',
      toWalletAccount: 'exodus_1',
    },
    {
      orderId: '3',
      status: 'complete-verified',
      date: '2018-05-16T16:36:24.271Z',
      fromTxId: '0x2eb88d1c7d0e30649bb294822b0d7bba3db188ef1b64891c716fc1847a711389',
      toTxId: '0x6ed56ee5e96b23f8bf8132c0e9949bbf4a0a180a5a08e4c1c8d2c3eaef9a4882',
      fromAsset: 'ethereumclassic',
      fromAmount: '2.95542858 ETC',
      toAsset: 'ethereum',
      toAmount: '0.071703116045841745 ETH',
      fromAmountUSD: '51.72 USD',
      toAmountUSD: '51.47 USD',
      svc: 'ch',
      fromWalletAccount: 'exodus_1',
      toWalletAccount: 'exodus_3',
    },
  ]
  const orderSet1 = OrderSet.fromArray(orders1.map((item) => orderFromJSONLegacy(item, { assets })))
  const state = {}

  test('filters orders by enabled wallet accounts', () => {
    const enabledWalletAccounts = ['exodus_0', 'exodus_3']
    const orderSetSelector = () => orderSet1
    const allEnabledWalletAccountsSelector = () => enabledWalletAccounts
    const result = createAllOrdersInEnabledWalletAccountsSelector({
      orderSetSelector,
      allEnabledWalletAccountsSelector,
    })(state)
    expect(result).toBeInstanceOf(OrderSet)
    expect([...result][0]).toBeInstanceOf(Order)
    expect([...result][0].orderId).toEqual('1')
    expect([...result][1].orderId).toEqual('3')
  })
})
