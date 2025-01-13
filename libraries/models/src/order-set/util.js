import assert from 'minimalistic-assert'
import { orderFromJSONLegacy, orderToJSONLegacy } from '../order/util.js'
import Order from '../order/index.js'
import OrderSet from './index.js'

export const orderSetFromJSONLegacy = (orders, { assets }) => {
  return orders == null
    ? OrderSet.EMPTY
    : OrderSet.fromArray(orders.map((order) => isObjectOrConvert(order, assets)))
}

export const orderSetToJSONLegacy = (orderSet) => {
  assert(orderSet instanceof OrderSet, 'orderSetToJSONLegacy: expecting an OrderSet')

  return [...orderSet].map((order) => orderToJSONLegacy(order))
}

const isObjectOrConvert = (order, assets) => {
  return order instanceof Order ? order : orderFromJSONLegacy(order, { assets })
}
