import assert from 'minimalistic-assert'
import proxyFreeze from 'proxy-freeze'
import lodash from 'lodash'
import { isNumberUnit, UnitType } from '@exodus/currency'
import AddressSet from '../address-set/index.js'
import { unitTypeToJSON } from './utils.js'
import { ModelIdSymbol } from '../constants.js'

const { isEqual, isEmpty, isString, merge, omit, mapValues } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

const FACTORY_SYMBOL = Symbol('Tx')

// val can be an Object when JSON.stringifiy() was used on a NumberUnit
function parseCurrency(val, currency) {
  assert(currency instanceof UnitType, 'Currency must be an instance of UnitType')
  if (isNumberUnit(val)) return val

  return currency.parse(typeof val === 'string' ? val : val.value + ' ' + val.unit)
}

export default class Tx {
  constructor({ json, initSymbol }) {
    const {
      txId,
      error,
      date,
      confirmations,
      dropped,
      coinAmount,
      coinName,
      feeAmount,
      feeCoinName,
      selfSend,
      from,
      to,
      meta,
      data,
      tokens,
      token, // legacy
      addresses,
      currencies,
    } = json
    assert(initSymbol === FACTORY_SYMBOL, 'Tx: please use Tx.fromJSON().')
    assert(!isEmpty(currencies), 'Tx: `currencies` is required')
    assert(!from || Array.isArray(from), 'Tx: `from` has to be an array.')
    assert(!to || isString(to), 'Tx: `to` has to be a string.')
    assert(!tokens || Array.isArray(tokens), 'Tx: `tokens` has to be an array.')
    assert(
      !addresses || Array.isArray(addresses) || addresses instanceof AddressSet,
      'Tx: unknown `addresses` type'
    )
    assert(!coinAmount || coinName, 'Tx: `coinName` is required with `coinAmount`')
    assert(!feeAmount || feeCoinName, 'Tx: `feeCoinName` is required with `feeAmount`')

    this.currencies = mapValues(currencies, (currency) =>
      currency instanceof UnitType ? currency : UnitType.create(currency)
    )

    this.txId = txId
    this.error = error || null
    this.date = date ? new Date(date) : new Date()
    // we don't even know if it'll get propagated across the network
    this.confirmations = typeof confirmations === 'number' ? confirmations : -1
    if (dropped !== undefined) this.dropped = !!dropped && this.confirmations <= 0

    if (coinAmount) {
      assert(this.currencies[coinName], `Tx: currency for ${coinName} missing`)
      this.coinAmount = parseCurrency(coinAmount, this.currencies[coinName])
      this.coinName = coinName
    }

    if (feeAmount) {
      assert(this.currencies[feeCoinName], `Tx: currency for ${feeCoinName} missing`)
      this.feeAmount = parseCurrency(feeAmount, this.currencies[feeCoinName])
      this.feeCoinName = feeCoinName
    }

    this.selfSend = selfSend || false
    this.from = from || []
    if (to) this.to = to
    this.tokens = tokens || (token ? [token] : [])

    this.data = data || {}

    // SHOULD NOT BE NESTED!
    this.meta = meta ? { ...meta } : {}

    this.addresses = Array.isArray(addresses)
      ? AddressSet.fromArray(addresses)
      : addresses instanceof AddressSet
        ? addresses
        : AddressSet.EMPTY

    this.version = 1
  }

  static get [ModelIdSymbol]() {
    return 'Tx'
  }

  static isInstance(instance) {
    return instance?.constructor?.[ModelIdSymbol] === this[ModelIdSymbol]
  }

  static fromJSON(jsonOrString) {
    const json = typeof jsonOrString === 'string' ? JSON.parse(jsonOrString) : jsonOrString
    const tx = new Tx({ json, initSymbol: FACTORY_SYMBOL })
    return proxyFreeze(tx)
  }

  clone() {
    return Tx.fromJSON(this)
  }

  equals(otherTx) {
    return this === otherTx || isEqual(this.toJSON(), otherTx.toJSON())
  }

  /*
  inspect(): string {
    if (this.coinAmount)
      return `<Tx ${this.txId.slice(0, 6)}... ${this.date.toISOString()} ${this.coinAmount.toString()} >`
    else return `<Tx ${this.txId.slice(0, 6)}... ${this.date.toISOString()} >`
  }
  */

  toJSON() {
    const obj = { ...this }

    if (this.coinAmount) obj.coinAmount = this.coinAmount.toDefaultString({ unit: true })
    if (this.feeAmount) obj.feeAmount = this.feeAmount.toDefaultString({ unit: true })

    obj.date = obj.date.toISOString()

    if (this.addresses) {
      obj.addresses = [...this.addresses].map((address) => address.toJSON())

      // no need having a field name taking up empty space
      if (obj.addresses.length === 0) delete obj.addresses
    }

    if (!obj.selfSend) delete obj.selfSend

    if (obj.from.length === 0) delete obj.from

    if (Object.keys(obj.data).length === 0) delete obj.data

    if (!obj.error) delete obj.error

    if (Object.keys(obj.meta).length === 0) delete obj.meta

    if (obj.tokens.length === 0) delete obj.tokens

    obj.currencies = mapValues(this.currencies, unitTypeToJSON)

    return obj
  }

  toString() {
    return String(this.txId)
  }

  update(fields) {
    const current = this.toJSON()
    fields = omit(fields, ['version'])
    const isNoop = Object.keys(fields).every((field) => isEqual(current[field], fields[field]))
    if (isNoop) {
      return this
    }

    return Tx.fromJSON(merge({}, current, fields))
  }

  get accepted() {
    return (this.received || (this.sent && this.confirmations >= 0)) && !this.dropped
  }

  get confirmed() {
    return this.confirmations > 0
  }

  get pending() {
    return this.confirmations <= 0 && !this.dropped // dropped txs are not pending anymore
  }

  get failed() {
    return this.error || this.dropped
  }

  get sent() {
    return !!(this.coinAmount.isNegative || this.to || this.selfSend)
  }

  get received() {
    return !this.sent
  }

  // Legacy; previously each TX could only have one corresponding token
  get token() {
    return this.tokens[0] || null
  }
}
