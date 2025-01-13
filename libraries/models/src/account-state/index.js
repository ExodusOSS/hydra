import lodash from 'lodash'
import { serialize, deserialize } from './serialization.js'
import { ModelIdSymbol } from '../constants.js'

const { isEqual, pick, mapValues, isString } = lodash // eslint-disable-line @exodus/basic-utils/prefer-basic-utils

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
function assetUnitsToRegex(token) {
  const units = Object.keys(token.currency.units)
  return new RegExp(` (${units.join('|')})$`)
}

export default class AccountState {
  static defaults = {}
  static _allFieldNames = null
  static _fieldNames = null
  static _version = 0

  // @deprecated, but still required for parsing old account state data
  static _tokens = []
  static _dateKeys = []

  static get [ModelIdSymbol]() {
    return 'AccountState'
  }

  static isInstance(instance) {
    return instance?.constructor?.[ModelIdSymbol] === this[ModelIdSymbol]
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
  static serialize(json, { includeMem = false } = {}) {
    const keys = includeMem ? this._getAllFieldNames() : this._getFieldNames()
    return serialize(pick(json, keys))
  }

  // Take result of this.serialize() and return AccountState subclass
  static deserialize(serialized) {
    const json =
      serialized && serialized.v && serialized.v._version === 1
        ? deserialize(serialized)
        : this._legacyParse(serialized)
    return new this(json)
  }

  static fromJSON(serialized) {
    return this.deserialize(serialized)
  }

  static create(props) {
    return new this(props)
  }

  constructor(props = {}) {
    const { defaults } = this.constructor

    if (this.constructor === AccountState)
      throw new Error(
        'Instantiating the base AccountState class is forbidden, please instantiate a subclass instance'
      )

    // Pick keys in defaults
    const allProps = {
      ...defaults,
      ...pick(props, this.constructor._getAllFieldNames()),
    }

    Object.assign(this, allProps, { _version: 1 })
  }

  // @deprecated
  static _legacyParse(rawData) {
    return this._postParse(
      mapValues(rawData, (v, k) => {
        if (this._dateKeys.includes(k) && v) {
          return new Date(v)
        }

        const assetFound =
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
  static _postParse(data) {
    return data
  }

  toJSON(opts) {
    return this.constructor.serialize(this, opts)
  }

  // eslint-disable-next-line unicorn/no-object-as-default-parameter
  equals(other, opts = { includeMem: true }) {
    return this === other || isEqual(this.toJSON(opts), other.toJSON(opts))
  }

  merge(data) {
    return this.constructor.create({ ...this, ...data })
  }

  contains(data) {
    return this.equals(this.merge(data))
  }
}
