import assert from 'minimalistic-assert'
// eslint-disable-next-line no-restricted-imports -- TODO: Fix this the next time the file is edited.
import lodash from 'lodash'
import type NumberUnit from '@exodus/currency'
import { isNumberUnit } from '@exodus/currency'
import Order from './index.js'
import type { Asset, Assets } from '../types.js'

const { isPlainObject, isString } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

export const orderFromJSONLegacy = (json: any, { assets }: { assets: Assets }) => {
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

export const orderToJSONLegacy = (order: Order) => {
  assert(order && order instanceof Order, 'toJSONLegacy: requires an Order')

  const obj: Record<string, any> = { ...order.toJSON(), date: order.date.toISOString() }

  if (order.fromAmount) obj.fromAmount = order.fromAmount.toDefaultString({ unit: true })
  if (order.toAmount) obj.toAmount = order.toAmount.toDefaultString({ unit: true })

  delete obj._version

  return obj
}

const parseAmountLegacy = ({ asset, amount }: { asset: Asset; amount: NumberUnit | string }) =>
  isNumberUnit(amount) ? amount : asset ? asset.currency.parse(amount) : undefined
