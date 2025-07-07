import assert from 'minimalistic-assert'
import { orderFromJSONLegacy, orderToJSONLegacy } from '../order/util.js'
import type { OrderProps } from '../order/index.js'
import Order from '../order/index.js'
import OrderSet from './index.js'
import type { Assets } from '../types.js'

export const orderSetFromJSONLegacy = (orders: any[], { assets }: { assets: Assets }) => {
  return orders == null
    ? OrderSet.EMPTY
    : OrderSet.fromArray(orders.map((order) => isObjectOrConvert(order, assets)))
}

export const orderSetToJSONLegacy = (orderSet: OrderSet) => {
  assert(OrderSet.isInstance(orderSet), 'orderSetToJSONLegacy: expecting an OrderSet')

  return [...orderSet].map((order) => orderToJSONLegacy(order))
}

const isObjectOrConvert = (order: Order | OrderProps, assets: Assets) => {
  return Order.isInstance(order) ? order : orderFromJSONLegacy(order, { assets })
}
