import lodash from 'lodash'

import { WalletAccount } from '../../index.js'
import Order from '../../order/index.js'
import OrderSet from '../index.js'

test('verify update() is working', () => {
  let os = OrderSet.EMPTY
  const o1 = Order.fromJSON({ orderId: '123-456', fromAsset: 'bitcoin' })
  os = os.add(o1)
  const o2 = o1.update({ toAsset: 'litecoin' })
  os = os.update([o2])
  const os3 = os.get('123-456')!

  // eslint-disable-next-line @exodus/basic-utils/prefer-basic-utils
  expect(lodash.omit(os3.toJSON(), 'date')).toEqual({
    orderId: '123-456',
    fromAsset: 'bitcoin',
    toAsset: 'litecoin',
    fromWalletAccount: WalletAccount.DEFAULT_NAME,
    toWalletAccount: WalletAccount.DEFAULT_NAME,
    status: '',
    svc: 'ss', // default service provider is always ShapeShift
    toTxId: undefined,
    potentialToTxIds: [],
    _version: 1,
  })
})

test('update() should properly update fields in Order object', () => {
  let os = OrderSet.EMPTY
  const o1 = Order.fromJSON({
    orderId: '123-456',
    fromAsset: 'ethereum',
    svc: 'ss',
    fromTxId: '0x123',
  })
  os = os.add(o1)

  const o1d = Order.fromJSON({
    orderId: '123-456',
    toAsset: 'litecoin',
    fromTxId: '0x123',
    txIds: [
      { txId: 'some-tx-id-1', type: 'setup' },
      { txId: 'some-tx-id-2', type: 'cleanup' },
    ],
  })
  os = os.update([o1d])

  const o1n = os.getByTxId('0x123')!
  expect(o1.orderId).toEqual(o1n.orderId)
  expect(os.getByTxId('some-tx-id-1')!.orderId).toEqual(o1n.orderId)
  expect(os.getByTxId('some-tx-id-2')!.orderId).toEqual(o1n.orderId)

  // regression didn't have data from existing Order present in the set
  expect(o1n.fromAsset).toEqual('ethereum')
  expect(o1n.toAsset).toEqual('litecoin')
})
