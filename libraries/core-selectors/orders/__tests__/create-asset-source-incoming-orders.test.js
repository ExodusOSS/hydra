import { Order, OrderSet, orderFromJSONLegacy } from '@exodus/models'
import assets from '../../_test/assets.js'
import createAssetSourceIncomingOrdersSelectorCreator from '../create-asset-source-incoming-orders.js'

describe('createAssetSourceIncomingOrdersSelectorCreator', () => {
  const orders1 = [
    {
      orderId: '1',
      status: 'in-progress',
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
      status: 'in-progress',
      date: '2018-05-16T16:36:24.271Z',
      fromTxId: '0x2eb88d1c7d0e30649bb294822b0d7bba3db188ef1b64891c716fc1847a711389',
      toTxId: '0x6ed56ee5e96b23f8bf8132c0e9949bbf4a0a180a5a08e4c1c8d2c3eaef9a4882',
      fromAsset: 'ethereumclassic',
      fromAmount: '2.95542858 ETC',
      toAsset: 'monero',
      toAmount: '0.071703116045841745 XMR',
      fromAmountUSD: '51.72 USD',
      toAmountUSD: '51.47 USD',
      svc: 'ch',
      fromWalletAccount: 'exodus_0',
      toWalletAccount: 'exodus_0',
    },
    {
      orderId: '3',
      status: 'in-progress',
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

  test('returns empty OrderSet when no orders', () => {
    const ordersInProgressSelector = () => OrderSet.EMPTY
    const createIncomingOrdersInProgressSelector = createAssetSourceIncomingOrdersSelectorCreator({
      ordersInProgressSelector,
    })
    const walletAccount = 'exodus_3'
    const result = createIncomingOrdersInProgressSelector({
      walletAccount,
      assetName: 'ethereum',
    })(state)
    expect(result).toBeInstanceOf(OrderSet)
    expect(result.size).toBe(0)
  })

  test('returns OrderSet with order incoming orders for corresponding account', () => {
    const ordersInProgressSelector = () => orderSet1
    const createIncomingOrdersInProgressSelector = createAssetSourceIncomingOrdersSelectorCreator({
      ordersInProgressSelector,
    })
    const result1 = createIncomingOrdersInProgressSelector({
      walletAccount: 'exodus_3',
      assetName: 'ethereum',
    })(state)
    expect(result1).toBeInstanceOf(OrderSet)
    expect(result1.size).toBe(1)
    expect([...result1][0]).toBeInstanceOf(Order)
    expect([...result1][0].orderId).toEqual('3')

    const result2 = createIncomingOrdersInProgressSelector({
      walletAccount: 'exodus_0',
      assetName: 'ethereum',
    })(state)
    expect(result2).toBeInstanceOf(OrderSet)
    expect(result2.size).toBe(1)
    expect([...result2][0]).toBeInstanceOf(Order)
    expect([...result2][0].orderId).toEqual('1')
  })
})
