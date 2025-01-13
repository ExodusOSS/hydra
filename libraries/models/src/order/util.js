import assert from 'minimalistic-assert'
import lodash from 'lodash'
import { isNumberUnit } from '@exodus/currency'
import Order from './index.js'

const { isPlainObject, isString } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

export const orderFromJSONLegacy = (json, { assets }) => {
  assert(
    isString(json) || isPlainObject(json),
    'fromJSONLegacy: requires a string or a plain object'
  )

  if (isString(json)) json = JSON.parse(json)
  if (json._version) return Order.fromJSON(json)

  assert(assets, 'fromJSONLegacy(): assets is required to parse legacy Order')

  const { fromAsset, toAsset } = json
  const fromAmount = json.fromAmount
    ? parseAmountLegacy({ amount: json.fromAmount, asset: assets[fromAsset] })
    : undefined
  const toAmount = json.toAmount
    ? parseAmountLegacy({ amount: json.toAmount, asset: assets[toAsset] })
    : undefined

  return Order.fromJSON({ ...json, fromAmount, toAmount })
}

export const orderToJSONLegacy = (order) => {
  assert(order && order instanceof Order, 'toJSONLegacy: requires an Order')

  const obj = { ...order, date: order.date.toISOString() }

  if (obj.fromAmount) obj.fromAmount = obj.fromAmount.toDefaultString({ unit: true })
  if (obj.toAmount) obj.toAmount = obj.toAmount.toDefaultString({ unit: true })

  delete obj._version

  return obj
}

const parseAmountLegacy = ({ asset, amount }) =>
  isNumberUnit(amount) ? amount : asset ? asset.currency.parse(amount) : undefined
