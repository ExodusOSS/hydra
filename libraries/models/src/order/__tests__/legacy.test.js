import assets from '../../__tests__/assets.js'
import { orderFromJSONLegacy, orderToJSONLegacy } from '../util.js'

const fixture = {
  orderId: 'fd87187e89c9',
  status: 'complete-verified',
  date: '2018-05-29T15:49:07.785Z',
  fromTxId: '0x8366cab6aa264febfb167938f7ad75c363e81cdbb3e1a6a99b3cd61b6c94d183',
  toTxId: '0x0cf4907d9ce059176f85290861cfc8efaa5e924d42cabf05ea4a9b38c96cb901',
  fromAsset: 'eosio',
  fromAmount: '4.2758 EOS',
  fromWalletAccount: 'exodus_0',
  toAsset: 'ethereum',
  toAmount: '0.072635 ETH',
  toWalletAccount: 'exodus_0',
  svc: 'ch',
  txIds: [
    {
      type: 'cleanup',
      txId: 'cleanup-tx-id',
    },
  ],
  potentialToTxIds: [],
}

test('can create an order', () => {
  const order = orderFromJSONLegacy(fixture, { assets })
  const legacy = orderToJSONLegacy(order)
  expect(legacy).toEqual(fixture)
})
