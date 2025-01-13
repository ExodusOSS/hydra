import OrderLike from './order-like.js'

export default class Order extends OrderLike {
  static txIdFields = ['txId']
  static dateFields = ['date']
  static numberUnitFields = [
    { assetField: 'toAsset', valueField: 'toAmount' },
    { assetField: 'fromAsset', valueField: 'fromAmount' },
  ]
}
