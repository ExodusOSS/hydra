import assert from 'minimalistic-assert'
import proxyFreeze from 'proxy-freeze'
import lodash from 'lodash'
import type NumberUnit from '@exodus/currency'
import { isNumberUnit, UnitType } from '@exodus/currency'
import AddressSet from '../address-set/index.js'
import { safeFields, unitTypeToJSON } from './utils.js'
import { ModelIdSymbol } from '../constants.js'
import type Address from '../address/index.js'
import { createIsInstance, omitUndefined } from '../utils.js'

const { isEqual, isEmpty, isString, merge, omit, mapValues, pick } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

const FACTORY_SYMBOL = Symbol('Tx')

// val can be an Object when JSON.stringifiy() was used on a NumberUnit
function parseCurrency(
  val: string | NumberUnit | { value: string; unit: string },
  currency: UnitType
) {
  assert(currency instanceof UnitType, 'Currency must be an instance of UnitType')
  if (isNumberUnit(val)) return val as NumberUnit

  return currency.parse(typeof val === 'string' ? val : val.value + ' ' + (val as any).unit)
}

const coerceToObject = (obj: Tx | Partial<TxProps>) => (obj instanceof Tx ? obj.toJSON() : obj)

export type TxProps = {
  txId?: string
  error?: string | null
  date?: Date | string | number
  dropped?: boolean
  confirmations?: number
  feeCoinName?: string
  selfSend?: boolean
  from?: string[]
  to?: string
  meta?: Record<string, any>
  data?: Record<string, any>
  tokens?: string[]
  token?: string // legacy
  addresses?: string[] | AddressSet | Address[]
  currencies?: Record<string, UnitType | Record<string, number>>
} & (
  | { coinAmount: string | NumberUnit | { value: string; unit: string }; coinName: string }
  | { coinAmount?: never; coinName?: never }
) &
  (
    | { feeAmount: string | NumberUnit | { value: string; unit: string }; feeCoinName: string }
    | { feeAmount?: never; feeCoinName?: never }
  )

type ConstructorParams = {
  json: TxProps
  initSymbol: typeof FACTORY_SYMBOL
}

export default class Tx {
  version = 1
  currencies: Record<string, UnitType>
  txId?: string
  error?: string | null
  date: Date
  confirmations: number
  selfSend: boolean
  from: string[]
  tokens: string[]
  data: Record<string, any>
  meta: Record<string, any>
  addresses: AddressSet
  to?: string
  dropped?: boolean
  coinName?: string
  feeCoinName?: string
  coinAmount?: NumberUnit
  feeAmount?: NumberUnit

  constructor({ json, initSymbol }: ConstructorParams) {
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

    this.data = data || Object.create(null)

    // SHOULD NOT BE NESTED!
    this.meta = meta ? { ...meta } : Object.create(null)

    this.addresses = Array.isArray(addresses)
      ? AddressSet.fromArray(addresses)
      : addresses instanceof AddressSet
        ? addresses
        : AddressSet.EMPTY
  }

  static get [ModelIdSymbol]() {
    return 'Tx'
  }

  static isInstance = createIsInstance(Tx)

  static [Symbol.hasInstance](instance: unknown): instance is Tx {
    return this.isInstance(instance)
  }

  static fromJSON(jsonOrString: string | TxProps) {
    const json = typeof jsonOrString === 'string' ? JSON.parse(jsonOrString) : jsonOrString
    const tx = new Tx({ json, initSymbol: FACTORY_SYMBOL })
    return proxyFreeze(tx)
  }

  clone() {
    return Tx.fromJSON(this as unknown as TxProps)
  }

  equals(otherTx: Tx) {
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
    const _obj = {
      __proto__: null,
      ...this,
      date: this.date.toISOString(),
      addresses: [...this.addresses].map((address) => address.toJSON()),
      currencies: mapValues(this.currencies, unitTypeToJSON),
      ...(this.coinAmount && { coinAmount: this.coinAmount.toDefaultString({ unit: true }) }),
      ...(this.feeAmount && { feeAmount: this.feeAmount.toDefaultString({ unit: true }) }),
    }
    const obj = _obj as Partial<typeof _obj> // so we can delete properties

    if (obj.addresses!.length === 0) delete obj.addresses

    if (!obj.selfSend) delete obj.selfSend

    if (obj.from!.length === 0) delete obj.from

    if (Object.keys(obj.data!).length === 0) delete obj.data

    if (!obj.error) delete obj.error

    if (Object.keys(obj.meta!).length === 0) delete obj.meta

    if (obj.tokens!.length === 0) delete obj.tokens

    return omitUndefined(obj)
  }

  toRedactedJSON() {
    return pick(this.toJSON(), safeFields)
  }

  toString() {
    return String(this.txId)
  }

  update(fields: Partial<TxProps> | Tx) {
    const current: Record<string, any> = this.toJSON()
    const data = coerceToObject(fields)
    const updateable: Record<string, any> = omit(data, ['version'])
    const isNoop = Object.keys(updateable).every((field) =>
      isEqual(current[field], updateable[field])
    )
    if (isNoop) {
      return this
    }

    return Tx.fromJSON(merge(Object.create(null), current, updateable) as TxProps)
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
    return !!(this.coinAmount?.isNegative || this.to || this.selfSend)
  }

  get received() {
    return !this.sent
  }

  // Legacy; previously each TX could only have one corresponding token
  get token() {
    return this.tokens[0] || null
  }
}
