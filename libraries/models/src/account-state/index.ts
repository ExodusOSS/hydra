import lodash from 'lodash'
import { serialize, deserialize } from './serialization.js'
import { ModelIdSymbol } from '../constants.js'
import type { Asset } from '../types.js'
import { createIsInstance, omitNullable } from '../utils.js'
import { isNumberUnit } from '@exodus/currency'
import { safeFields } from './utils.js'

const { isEqual, pick, mapValues, isString, cloneDeepWith } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

export * from './serialization.js'

// NOTE: AccountState should be treated as immutable

/**
 * Define:
 *
 * class TronAccountState extends AccountState {
 *   static defaults = {
 *     balance: assets.tronmainnet.currency.ZERO
 *     tokenBalances: { btt: assets.btt.currency.ZERO }
 *     utxos: null
 *     tokenUtxos: {}
 *     cursor: 0
 *     mem: {}
 *     timestamp: new Date()
 *   },
 * }
 *
 * Create from JSON:
 *
 *   const tronAccountState = new TronAccountState(props)
 *   const tronAccountState = TronAccountState.create(props)
 *   const newAccountState = tronAccountState.merge(props)
 *   e.g.:
 *   const accountState = TronAccountState.create({ balance: NumberUnit })
 *
 * Serialize/deserialize for RPC or storage:
 *
 *   const tronAccountState = TronAccountState.deserialize(serialized)
 *   const tronAccountState = TronAccountState.fromJSON(serialized)
 *   const serialized = TronAccountState.serialize(tronAccountState)
 *   const serialized = tronAccountState.toJSON()
 *
 * Comparison:
 *
 *   tronAccountState.equals(otherTronAccountState)
 *   tronAccountState.contains(props)
 */

// @deprecated
function assetUnitsToRegex(token: Asset) {
  const units = Object.keys(token.currency.units)
  return new RegExp(` (${units.join('|')})$`)
}

type AccountStateJson = Record<string, any>
type Props = Record<string, any>

export default class AccountState {
  static defaults = Object.create(null)
  static _allFieldNames: string[] | null = null
  static _fieldNames: string[] | null = null
  static _version = 0

  // @deprecated, but still required for parsing old account state data
  static _tokens: Asset[] = []
  static _dateKeys: string[] = []

  static get [ModelIdSymbol]() {
    return 'AccountState'
  }

  [key: string]: any

  static isInstance = createIsInstance(AccountState)

  static [Symbol.hasInstance](instance: unknown): instance is AccountState {
    return this.isInstance(instance)
  }

  static _getAllFieldNames() {
    if (!this._allFieldNames) {
      this._allFieldNames = Object.keys(this.defaults)
      this._allFieldNames.push('_version')
    }

    return this._allFieldNames
  }

  static _getFieldNames() {
    const fields = this._getAllFieldNames()
    if (!this._fieldNames) {
      this._fieldNames = fields.filter((name) => name !== 'mem')
    }

    return this._fieldNames
  }

  // Take an AccountState v1 or newer and return simple JSON, containing only primitive types
  static serialize(json: AccountStateJson, { includeMem = false } = Object.create(null)) {
    const keys = includeMem ? this._getAllFieldNames() : this._getFieldNames()
    return serialize(pick(json, keys))
  }

  // Take result of this.serialize() and return AccountState subclass
  static deserialize(serialized: AccountStateJson | { v: Record<string, any> }) {
    const json =
      serialized.v && serialized.v._version === 1
        ? deserialize(serialized)
        : this._legacyParse(serialized)

    return new this(json)
  }

  static fromJSON(serialized: AccountStateJson | { v: Record<string, any> }) {
    return this.deserialize(serialized)
  }

  static create(props?: Props) {
    return new this(props)
  }

  _version?: number

  constructor(props: Props = Object.create(null)) {
    const { defaults } = this.constructor as any

    if (this.constructor === AccountState)
      throw new Error(
        'Instantiating the base AccountState class is forbidden, please instantiate a subclass instance'
      )

    // Pick keys in defaults
    const allProps = {
      ...defaults,
      ...pick(props, (this.constructor as any)._getAllFieldNames()),
    }

    Object.assign(this, allProps, { _version: 1 })
  }

  // @deprecated
  static _legacyParse(rawData: Record<string, any>) {
    return this._postParse(
      mapValues(rawData, (v, k) => {
        if (this._dateKeys.includes(k) && v) {
          return new Date(v)
        }

        const assetFound: Asset =
          isString(v) && this._tokens.find((token) => assetUnitsToRegex(token).test(v))
        if (assetFound) {
          return assetFound.currency.parse(v)
        }

        return v
      })
    )
  }

  // @deprecated
  // legacy parsing hook, cannot be removed as long as we accept legacy raw account state data (v0)
  static _postParse(data: Record<string, any>) {
    return data
  }

  toJSON(opts?: { includeMem?: boolean }) {
    return (this.constructor as any).serialize(this, opts)
  }

  toRedactedJSON() {
    const obj = { ...this }

    const cloned = cloneDeepWith(obj, (value, key) => {
      if (value === obj) return // recurse
      if (typeof value === 'number' || typeof value === 'boolean') return value

      if (safeFields.has(key as string)) return // recurse
      if (isNumberUnit(value)) return value.toDefaultString({ unit: true })

      return null
    })

    return omitNullable(cloned)
  }

  // eslint-disable-next-line unicorn/no-object-as-default-parameter
  equals(other: AccountState, opts = { includeMem: true }) {
    return this === other || isEqual(this.toJSON(opts), other.toJSON(opts))
  }

  merge(data: Props) {
    return (this.constructor as any).create({ ...this, ...data })
  }

  contains(data: Props) {
    return this.equals(this.merge(data))
  }
}
