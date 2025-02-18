import { connectAssets } from '@exodus/assets'
import assetsBase from '@exodus/assets-base'
import { isNumberUnit } from '@exodus/currency'
import assert from 'assert'
import lodash from 'lodash'

const { mapValues, isPlainObject, isArray, isString, compact, merge, isEqual } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

const assets = connectAssets(assetsBase)

/**
 * {
 *   orderId,
 *   status
 *   date,
 *   ANY
 * }
 * #
 *   txIds
 *   exodusStatus
 *   error
 * toJSON()
 * update(fields)
 */

function mapValuesDeep(obj, cb, known = new Set()) {
  // Circular detection
  if (known.has(obj)) {
    return obj
  }

  known.add(obj)

  if (isPlainObject(obj)) {
    return mapValues(obj, (v) => mapValuesDeep(v, cb, known))
  }

  if (isArray(obj)) {
    return obj.map((v) => mapValuesDeep(v, cb, known))
  }

  return cb(obj)
}

export default class OrderLike {
  static txIdFields
  static dateFields = []
  // [ { assetField, valueField } ]
  static numberUnitFields

  static fromJSON(json) {
    if (typeof json === 'string') json = JSON.parse(json)
    return new this(json)
  }

  constructor({ orderId, status = '', date = new Date(), ...rest } = {}) {
    assert.strictEqual(typeof orderId, 'string', `orderId must be a string, received: ${orderId}`)
    const { dateFields, numberUnitFields } = this.constructor

    this.orderId = orderId
    this.status = status
    this.date = new Date(date)

    Object.assign(
      this,
      mapValues(rest, (v, k) => {
        const numberUnitField = numberUnitFields.find((v) => v.valueField === k)
        if (numberUnitField && isString(v)) {
          const assetName = rest[numberUnitField.assetField]
          if (!assets[assetName]) {
            throw new Error(`Invalid assetName. ${JSON.stringify({ assetName, numberUnitField })}`)
          }

          return assets[assetName].currency.parse(v)
        }

        if (dateFields.includes(k) && isString(v)) {
          return new Date(v)
        }

        return v
      })
    )

    return this
  }

  // use getter to skip toJSON
  get txIds() {
    const { txIdFields } = this.constructor
    return compact(txIdFields.map((v) => this[v]))
  }

  // this.status is the raw field provided by the exchange service
  // exodusStatus is used to map to the interface, customer only
  // cares if an exchange is in progress, complete, or failed... nothing else
  get exodusStatus() {
    throw new Error('NotImplemented')
  }

  get error() {
    throw new Error('NotImplemented')
  }

  inspect() {
    return `[${this.constructor.name} ${this.orderId}]`
  }

  toJSON() {
    return mapValuesDeep({ ...this }, (v, k) => {
      if (v instanceof Date) {
        return v.toISOString()
      }

      if (isNumberUnit(v)) {
        return v.toString()
      }

      return v
    })
  }

  toString() {
    return this.orderId
  }

  update(fields) {
    const current = this.toJSON()
    const isNoop = Object.keys(fields).every((field) => isEqual(current[field], fields[field]))
    if (isNoop) {
      return this
    }

    return this.constructor.fromJSON(merge(current, fields))
  }
}
